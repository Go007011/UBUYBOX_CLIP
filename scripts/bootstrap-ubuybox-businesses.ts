#!/usr/bin/env npx tsx
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDb } from "../packages/db/src/client.js";
import { companyService } from "../server/src/services/companies.js";
import { agentService } from "../server/src/services/agents.js";
import { accessService } from "../server/src/services/access.js";
import { agentInstructionsService } from "../server/src/services/agent-instructions.js";
import {
  loadDefaultAgentInstructionsBundle,
  resolveDefaultAgentInstructionsBundleRole,
} from "../server/src/services/default-agent-instructions.js";

type RoleConfig = {
  key: string;
  name: string;
  role: string;
  title: string;
  icon: string;
  capabilities: string;
  directiveTitle: string;
  directive: string;
};

type BusinessConfig = {
  name: string;
  description: string;
  category: string;
  roles: RoleConfig[];
};

type BootstrapConfig = {
  sourceCompanyName: string;
  opsBaselineAgentName?: string;
  managedBy: string;
  businesses: BusinessConfig[];
};

type CliOptions = {
  apply: boolean;
  configPath: string;
  sourceCompanyName?: string;
  help: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  let apply = false;
  let configPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../configs/ubuybox/businesses.json",
  );
  let sourceCompanyName: string | undefined;
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--config") {
      configPath = path.resolve(argv[i + 1] ?? "");
      i += 1;
      continue;
    }
    if (arg === "--source-company") {
      sourceCompanyName = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
  }

  return { apply, configPath, sourceCompanyName, help };
}

function printHelp() {
  console.log("Usage: pnpm ubuybox:bootstrap-businesses [-- --apply] [--config <path>] [--source-company <name>]");
  console.log("");
  console.log("Default mode is preview only. Use --apply to write changes.");
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripInstructionConfig(input: unknown) {
  const config = asRecord(input);
  delete config.instructionsFilePath;
  delete config.instructionsRootPath;
  delete config.instructionsEntryFile;
  delete config.instructionsBundleMode;
  delete config.agentsMdPath;
  delete config.promptTemplate;
  delete config.bootstrapPromptTemplate;
  return config;
}

function appendDirective(existing: string, title: string, body: string) {
  return `${existing.trim()}\n\n## ${title}\n${body.trim()}\n`.trim() + "\n";
}

async function readConfig(configPath: string): Promise<BootstrapConfig> {
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as BootstrapConfig;
}

function agentMatchesManagedRole(
  agent: {
    role: string;
    name: string;
    title: string | null;
    metadata: Record<string, unknown> | null;
  },
  roleConfig: RoleConfig,
  managedBy: string,
) {
  const metadata = asRecord(agent.metadata);
  return metadata.managedBy === managedBy
    || metadata.directiveRole === roleConfig.key
    || agent.role === roleConfig.role
    || agent.name === roleConfig.name
    || agent.title === roleConfig.title;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const config = await readConfig(options.configPath);
  const sourceCompanyName = options.sourceCompanyName?.trim() || config.sourceCompanyName;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const db = createDb(process.env.DATABASE_URL);
  const companies = companyService(db);
  const agents = agentService(db);
  const access = accessService(db);
  const instructions = agentInstructionsService();

  const allCompanies = await companies.list();
  const sourceCompany = allCompanies.find((company) => company.name === sourceCompanyName) ?? null;
  if (!sourceCompany) {
    throw new Error(`Source company "${sourceCompanyName}" not found`);
  }

  const sourceAgents = await agents.list(sourceCompany.id, { includeTerminated: true });
  const sourceCeo = sourceAgents.find((agent) => agent.role === "ceo") ?? null;
  const sourceOps = sourceAgents.find((agent) => agent.name === (config.opsBaselineAgentName ?? "Reporting Coordinator"))
    ?? sourceAgents.find((agent) => String(agent.title ?? "").toLowerCase().includes("operations"))
    ?? sourceCeo;

  if (!sourceCeo || !sourceOps) {
    throw new Error("Could not find source CEO/ops baseline agents");
  }

  const ceoAdapterConfigBase = stripInstructionConfig(sourceCeo.adapterConfig);
  const ceoRuntimeConfigBase = clone(asRecord(sourceCeo.runtimeConfig));
  const opsAdapterConfigBase = stripInstructionConfig(sourceOps.adapterConfig);
  const opsRuntimeConfigBase = clone(asRecord(sourceOps.runtimeConfig));

  console.log(options.apply ? "Applying UBUYBOX business bootstrap..." : "Previewing UBUYBOX business bootstrap...");

  for (const business of config.businesses) {
    const existingCompany = (await companies.list()).find((entry) => entry.name === business.name) ?? null;
    const willCreateCompany = !existingCompany;
    const willUpdateDescription = Boolean(existingCompany && (existingCompany.description ?? "") !== business.description);

    console.log(`\n[Company] ${business.name}`);
    console.log(`- create: ${willCreateCompany}`);
    console.log(`- update description: ${willUpdateDescription}`);

    let company = existingCompany;
    if (options.apply) {
      if (!company) {
        company = await companies.create({
          name: business.name,
          description: business.description,
          budgetMonthlyCents: 0,
        });
      } else if ((company.description ?? "") !== business.description) {
        company = (await companies.update(company.id, { description: business.description })) ?? company;
      }

      if (!company) {
        throw new Error(`Failed to create or load company ${business.name}`);
      }

      if (company.id !== sourceCompany.id) {
        await access.copyActiveUserMemberships(sourceCompany.id, company.id);
      }
    }

    const companyId = company?.id ?? existingCompany?.id;
    if (!companyId) {
      continue;
    }

    const existingAgents = await agents.list(companyId, { includeTerminated: true });
    let directManagerId: string | null = null;

    for (const roleConfig of business.roles) {
      const existingAgent = existingAgents.find((agent) => agentMatchesManagedRole(agent, roleConfig, config.managedBy)) ?? null;
      const action = existingAgent ? "upsert" : "create";
      console.log(`- ${roleConfig.key}: ${action}`);

      if (!options.apply) {
        if (roleConfig.key === "ceo") {
          directManagerId = existingAgent?.id ?? null;
        }
        continue;
      }

      const baselineAdapterConfig = roleConfig.key === "ceo" ? ceoAdapterConfigBase : opsAdapterConfigBase;
      const baselineRuntimeConfig = roleConfig.key === "ceo" ? ceoRuntimeConfigBase : opsRuntimeConfigBase;
      const reportsTo = roleConfig.key === "coo" ? directManagerId : null;

      let agent = existingAgent;
      if (!agent) {
        agent = await agents.create(companyId, {
          name: roleConfig.name,
          role: roleConfig.role,
          title: roleConfig.title,
          icon: roleConfig.icon,
          reportsTo,
          capabilities: roleConfig.capabilities,
          adapterType: String(roleConfig.key === "ceo" ? sourceCeo.adapterType : sourceOps.adapterType),
          adapterConfig: clone(baselineAdapterConfig),
          runtimeConfig: clone(baselineRuntimeConfig),
          budgetMonthlyCents: 0,
          permissions: { canCreateAgents: true },
          metadata: {
            managedBy: config.managedBy,
            businessCategory: business.category,
            directiveRole: roleConfig.key,
          },
          status: "idle",
          spentMonthlyCents: 0,
          lastHeartbeatAt: null,
        });
      } else {
        agent = await agents.update(agent.id, {
          name: roleConfig.name,
          role: roleConfig.role,
          title: roleConfig.title,
          icon: roleConfig.icon,
          reportsTo,
          capabilities: roleConfig.capabilities,
          metadata: {
            ...asRecord(agent.metadata),
            managedBy: config.managedBy,
            businessCategory: business.category,
            directiveRole: roleConfig.key,
          },
        });
      }

      if (!agent) {
        throw new Error(`Failed to upsert ${roleConfig.key} for ${business.name}`);
      }

      agent = await agents.updatePermissions(agent.id, { canCreateAgents: true });
      if (!agent) {
        throw new Error(`Failed to update permissions for ${roleConfig.key} in ${business.name}`);
      }

      const defaultFiles = await loadDefaultAgentInstructionsBundle(
        resolveDefaultAgentInstructionsBundleRole(agent.role),
      );
      const nextFiles = { ...defaultFiles };
      const existingAgentsFile = typeof nextFiles["AGENTS.md"] === "string" ? nextFiles["AGENTS.md"] : "";
      nextFiles["AGENTS.md"] = appendDirective(
        existingAgentsFile,
        roleConfig.directiveTitle,
        roleConfig.directive,
      );
      const { adapterConfig } = await instructions.materializeManagedBundle(agent, nextFiles, {
        entryFile: "AGENTS.md",
        replaceExisting: true,
        clearLegacyPromptTemplate: true,
      });
      agent = await agents.update(agent.id, { adapterConfig });
      if (!agent) {
        throw new Error(`Failed to persist instructions bundle for ${roleConfig.key} in ${business.name}`);
      }

      await access.setPrincipalPermission(companyId, "agent", agent.id, "tasks:assign", true, null);

      if (roleConfig.key === "ceo") {
        directManagerId = agent.id;
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
