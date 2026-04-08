import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "@/lib/router";
import { authApi } from "../api/auth";
import { queryKeys } from "../lib/queryKeys";
import { Button } from "@/components/ui/button";
import { AsciiArtAnimation } from "@/components/AsciiArtAnimation";
import { Sparkles } from "lucide-react";

type AuthMode = "sign_in" | "sign_up" | "forgot_password" | "reset_password";

export function AuthPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => {
    const m = searchParams.get("mode");
    if (m === "reset") return "reset_password";
    return "sign_in";
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState(() => searchParams.get("token") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams]);
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => authApi.getSession(),
    retry: false,
  });

  useEffect(() => {
    if (session) {
      navigate(nextPath, { replace: true });
    }
  }, [session, navigate, nextPath]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "sign_in") {
        await authApi.signInEmail({ email: email.trim(), password });
        return;
      }
      await authApi.signUpEmail({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    },
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      navigate(nextPath, { replace: true });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Authentication failed");
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Request failed");
      }
      return res.json() as Promise<{ resetUrl: string }>;
    },
    onSuccess: (data) => {
      setError(null);
      setResetUrl(window.location.origin + data.resetUrl);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Request failed");
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken.trim(), password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Reset failed");
      }
    },
    onSuccess: () => {
      setError(null);
      setResetSuccess(true);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Reset failed");
    },
  });

  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    (mode === "sign_in" || (name.trim().length > 0 && password.trim().length >= 8));

  if (isSessionLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-background">
      {/* Left half — form */}
      <div
        className="w-full md:w-1/2 flex flex-col overflow-y-auto"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8MXx8YnVpbGRpbmd8ZW58MHx8fHwxNzc1NjE2NTgyfDA&ixlib=rb-4.1.0&q=80&w=1280")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="w-full max-w-md mx-auto my-auto px-8 py-12"
          style={{ backgroundColor: "#000000", borderRight: "5px solid #ee4308" }}
        >
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Paperclip</span>
          </div>

          {/* ── Sign In / Sign Up ── */}
          {(mode === "sign_in" || mode === "sign_up") && (
            <>
              <h1 className="text-xl font-semibold">
                {mode === "sign_in" ? "Sign in to Paperclip" : "Create your Paperclip account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "sign_in"
                  ? "Use your email and password to access this instance."
                  : "Create an account for this instance. Email confirmation is not required in v1."}
              </p>

              <form
                className="mt-6 space-y-4"
                method="post"
                action={mode === "sign_up" ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email"}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (mutation.isPending) return;
                  if (!canSubmit) {
                    setError("Please fill in all required fields.");
                    return;
                  }
                  mutation.mutate();
                }}
              >
                {mode === "sign_up" && (
                  <div>
                    <label htmlFor="name" className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <input
                      id="name"
                      name="name"
                      className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input
                    id="email"
                    name="email"
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    autoFocus={mode === "sign_in"}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="text-xs text-muted-foreground">Password</label>
                    {mode === "sign_in" && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                        onClick={() => { setError(null); setResetUrl(null); setMode("forgot_password"); }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    name="password"
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "sign_in" ? "current-password" : "new-password"}
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  aria-disabled={!canSubmit || mutation.isPending}
                  className={`w-full ${!canSubmit && !mutation.isPending ? "opacity-50" : ""}`}
                >
                  {mutation.isPending
                    ? "Working…"
                    : mode === "sign_in"
                      ? "Sign In"
                      : "Create Account"}
                </Button>
              </form>

              <div className="mt-5 text-sm text-muted-foreground">
                {mode === "sign_in" ? "Need an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-2"
                  onClick={() => {
                    setError(null);
                    setMode(mode === "sign_in" ? "sign_up" : "sign_in");
                  }}
                >
                  {mode === "sign_in" ? "Create one" : "Sign in"}
                </button>
              </div>
            </>
          )}

          {/* ── Forgot Password ── */}
          {mode === "forgot_password" && (
            <>
              <h1 className="text-xl font-semibold">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email address and we'll generate a password reset link for you.
              </p>

              {!resetUrl ? (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (forgotMutation.isPending) return;
                    if (!email.trim()) { setError("Please enter your email address."); return; }
                    forgotMutation.mutate();
                  }}
                >
                  <div>
                    <label htmlFor="forgot-email" className="text-xs text-muted-foreground mb-1 block">Email</label>
                    <input
                      id="forgot-email"
                      type="email"
                      className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <Button type="submit" disabled={forgotMutation.isPending} className="w-full">
                    {forgotMutation.isPending ? "Generating…" : "Generate Reset Link"}
                  </Button>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your password reset link has been generated. Copy the link below and open it in your browser to set a new password.
                  </p>
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs break-all font-mono">
                    {resetUrl}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      void navigator.clipboard.writeText(resetUrl);
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => { window.location.href = resetUrl; }}
                  >
                    Open Reset Page
                  </Button>
                </div>
              )}

              <div className="mt-5 text-sm text-muted-foreground">
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-2"
                  onClick={() => { setError(null); setResetUrl(null); setMode("sign_in"); }}
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}

          {/* ── Reset Password ── */}
          {mode === "reset_password" && (
            <>
              <h1 className="text-xl font-semibold">Set a new password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your reset token and choose a new password.
              </p>

              {!resetSuccess ? (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (resetMutation.isPending) return;
                    if (!resetToken.trim()) { setError("Please enter the reset token."); return; }
                    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
                    resetMutation.mutate();
                  }}
                >
                  <div>
                    <label htmlFor="reset-token" className="text-xs text-muted-foreground mb-1 block">Reset Token</label>
                    <input
                      id="reset-token"
                      type="text"
                      className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 font-mono"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="text-xs text-muted-foreground mb-1 block">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      autoFocus={!resetToken}
                    />
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <Button type="submit" disabled={resetMutation.isPending} className="w-full">
                    {resetMutation.isPending ? "Resetting…" : "Set New Password"}
                  </Button>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-green-500">
                    Your password has been reset successfully.
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => { setMode("sign_in"); setNewPassword(""); setResetToken(""); setResetSuccess(false); }}
                  >
                    Sign In
                  </Button>
                </div>
              )}

              <div className="mt-5 text-sm text-muted-foreground">
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-2"
                  onClick={() => { setError(null); setMode("sign_in"); }}
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right half — ASCII art animation (hidden on mobile) */}
      <div className="hidden md:block w-1/2 overflow-hidden">
        <AsciiArtAnimation />
      </div>
    </div>
  );
}
