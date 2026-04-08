-- UBUYBOX Org Restructure Migration
-- Date: 2026-04-08
-- Description: Rewire agent hierarchy, promote Reporting Coordinator to COO-level,
--              create Real Estate & Title shared service agents, add 3 division projects

-- ============================================================
-- STEP 1: Rewire Agent Hierarchy
-- ============================================================

-- Compliance chain: Manager -> Officer, Confidentiality -> Manager, Legal -> Officer
UPDATE agents SET reports_to = 'ba6d3dd9-884f-43e3-bca6-9c94e8c446b3' WHERE id = 'f5e452c8-8dfd-4e5e-9f0a-c8a71dfe0c6a'; -- Compliance Manager -> Compliance Officer
UPDATE agents SET reports_to = 'f5e452c8-8dfd-4e5e-9f0a-c8a71dfe0c6a' WHERE id = '4aa64452-dfc3-4183-aeca-8a72887a7c0c'; -- Confidentiality & Release Manager -> Compliance Manager
UPDATE agents SET reports_to = 'ba6d3dd9-884f-43e3-bca6-9c94e8c446b3' WHERE id = 'd6d1801e-1809-48d7-90e3-85e76c926a95'; -- Legal Counsel -> Compliance Officer

-- Reporting Coordinator promoted: now reports to CEO + given COO title
UPDATE agents SET reports_to = '7f5a4aea-9417-4837-93e1-5e14df2c60b2', title = 'Head of Operations and Deal Flow' WHERE id = 'ad97474c-3d83-4fdc-a326-9e95056a5d15';

-- Division 1 ($17,500 Participation): Intake Coordinator leads Eligibility + Capital Readiness
UPDATE agents SET reports_to = 'ad97474c-3d83-4fdc-a326-9e95056a5d15' WHERE id = 'f8278f04-a294-4074-9631-2d09813a972f'; -- Intake Coordinator -> Reporting Coordinator
UPDATE agents SET reports_to = 'f8278f04-a294-4074-9631-2d09813a972f' WHERE id = '636cd376-08b7-442b-9fb9-de41188837a8'; -- Eligibility Reviewer -> Intake Coordinator
UPDATE agents SET reports_to = 'f8278f04-a294-4074-9631-2d09813a972f' WHERE id = '659527e9-25de-4f89-b8a1-aedd3b56adb8'; -- Capital Readiness Reviewer -> Intake Coordinator

-- Division 2 ($175,000 Deal Access): Access Review Coordinator leads Diligence + Deal Summary
UPDATE agents SET reports_to = 'ad97474c-3d83-4fdc-a326-9e95056a5d15' WHERE id = '82be4eaa-cc9d-4654-ac5c-5ff04b60ccb1'; -- Access Review Coordinator -> Reporting Coordinator
UPDATE agents SET reports_to = '82be4eaa-cc9d-4654-ac5c-5ff04b60ccb1' WHERE id = '3bb0c560-a9be-4be1-bf93-1dfd2bee1dcc'; -- Diligence Coordinator -> Access Review Coordinator
UPDATE agents SET reports_to = '82be4eaa-cc9d-4654-ac5c-5ff04b60ccb1' WHERE id = '3f17ee7b-66a6-4350-9f0c-ec63f71e5dda'; -- Deal Summary Specialist -> Access Review Coordinator

-- Division 3 ($1,750,000 Operator): Operator Onboarding Lead -> Execution Oversight -> Document Completion
UPDATE agents SET reports_to = 'ad97474c-3d83-4fdc-a326-9e95056a5d15' WHERE id = 'e8a58074-fe80-4563-94f7-eda5bd4de367'; -- Operator Onboarding Lead -> Reporting Coordinator
UPDATE agents SET reports_to = 'e8a58074-fe80-4563-94f7-eda5bd4de367' WHERE id = 'ceb2dd90-9d99-42f7-ba41-396959702a06'; -- Execution Oversight Lead -> Operator Onboarding Lead
UPDATE agents SET reports_to = 'ceb2dd90-9d99-42f7-ba41-396959702a06' WHERE id = '794b0121-0aab-491d-bd52-1a4963255804'; -- Document Completion Specialist -> Execution Oversight Lead

-- ============================================================
-- STEP 2: Create Real Estate & Title Shared Service Agents
-- ============================================================

INSERT INTO agents (id, company_id, name, role, title, status, reports_to, adapter_type, adapter_config, capabilities, permissions, metadata, created_at, updated_at)
VALUES
(
  gen_random_uuid(),
  '637d4518-42d6-4066-a265-f1bce16b612c',
  'Real Estate & Title Director',
  'real_estate_title_director',
  'Director of Real Estate & Title Operations',
  'paused',
  'ad97474c-3d83-4fdc-a326-9e95056a5d15',
  'claude_local',
  '{"model":"claude-haiku-4-5-20251001"}',
  '[]', '{}', '{}',
  NOW(), NOW()
),
(
  gen_random_uuid(),
  '637d4518-42d6-4066-a265-f1bce16b612c',
  'Title Coordinator',
  'title_coordinator',
  'Title Search & Escrow Coordinator',
  'paused',
  (SELECT id FROM agents WHERE name = 'Real Estate & Title Director'),
  'claude_local',
  '{"model":"claude-haiku-4-5-20251001"}',
  '[]', '{}', '{}',
  NOW(), NOW()
),
(
  gen_random_uuid(),
  '637d4518-42d6-4066-a265-f1bce16b612c',
  'Real Estate Stake Manager',
  'real_estate_stake_manager',
  'Equity Stakes & Property Title Manager',
  'paused',
  (SELECT id FROM agents WHERE name = 'Real Estate & Title Director'),
  'claude_local',
  '{"model":"claude-haiku-4-5-20251001"}',
  '[]', '{}', '{}',
  NOW(), NOW()
);

-- ============================================================
-- STEP 3: Create 3 Division Projects
-- ============================================================

INSERT INTO projects (id, company_id, name, description, status, lead_agent_id, created_at, updated_at, color)
VALUES
(
  gen_random_uuid(),
  '637d4518-42d6-4066-a265-f1bce16b612c',
  'Participation License - $17,500',
  'Tier 1 SPV pipeline. Entry-level participation at $17,500. Eligibility screening, capital readiness, and SPV onboarding for property BuyBox participants.',
  'active',
  'f8278f04-a294-4074-9631-2d09813a972f',
  NOW(), NOW(),
  '#3b82f6'
),
(
  gen_random_uuid(),
  '637d4518-42d6-4066-a265-f1bce16b612c',
  'Deal Access License - $175,000',
  'Tier 2 SPV pipeline. Deal-level access at $175,000. Access review, due diligence, deal summary, and investment documentation.',
  'active',
  '82be4eaa-cc9d-4654-ac5c-5ff04b60ccb1',
  NOW(), NOW(),
  '#f59e0b'
),
(
  gen_random_uuid(),
  '637d4518-42d6-4066-a265-f1bce16b612c',
  'Operator License - $1,750,000',
  'Tier 3 SPV pipeline. Full operator rights at $1,750,000. Operator onboarding, execution oversight, document completion, and revenue share setup.',
  'active',
  'e8a58074-fe80-4563-94f7-eda5bd4de367',
  NOW(), NOW(),
  '#10b981'
);
