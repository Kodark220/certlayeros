import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Wallet,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft,
  Zap,
  Plus,
  Download,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

type ConnectStep = "choose" | "email" | "import-key" | "generate";

const hasMetaMask = typeof window !== "undefined" && !!(window as any).ethereum;

export function LoginPage() {
  const { loginWithEmail, loginWithWallet, loginWithMetaMask, needsUnlock, unlockSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<ConnectStep>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");

  function go(target: string) {
    navigate(target);
  }

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter";
    if (!/[0-9]/.test(pw)) return "Password must include a number";
    return null;
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) { toast.error(pwErr); return; }
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast.success("Logged in successfully!");
      go("/select-role");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("decrypt") || msg.includes("operation")) {
        toast.error("Wrong password for this account");
      } else {
        toast.error(msg.slice(0, 100) || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMetaMask() {
    if (!password) {
      toast.error("Set a password to encrypt your wallet key");
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) { toast.error(pwErr); return; }
    setLoading(true);
    try {
      await loginWithMetaMask(password);
      toast.success("MetaMask connected!");
      go("/select-role");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("decrypt") || msg.includes("operation")) {
        toast.error("Wrong password for this MetaMask account");
      } else {
        toast.error(msg.slice(0, 100) || "MetaMask connection failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) { toast.error(pwErr); return; }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await loginWithWallet(password);
      toast.success("New wallet created! Save your password — it encrypts your key.");
      go("/select-role");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Failed to generate wallet");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!privateKey.trim()) {
      toast.error("Please enter a private key");
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) { toast.error(pwErr); return; }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await loginWithWallet(password, privateKey.trim());
      toast.success("Wallet imported and encrypted!");
      go("/select-role");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Import failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await unlockSession(unlockPassword);
      toast.success("Session unlocked!");
      go("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("decrypt") || msg.includes("operation")) {
        toast.error("Wrong password");
      } else {
        toast.error(msg.slice(0, 100) || "Unlock failed");
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Unlock screen (session expired or page reload) ───
  if (needsUnlock) {
    return (
      <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        </div>
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="CertLayer" className="w-12 h-12 rounded-xl" />
            </Link>
            <h1 className="text-2xl font-bold">Session Locked</h1>
            <p className="text-muted-foreground mt-2">
              Enter your password to unlock your wallet
            </p>
          </div>
          <Card className="bg-white border border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unlock-pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="unlock-pw"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      required
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" variant="glow" className="w-full gap-2" disabled={loading}>
                  {loading ? <Spinner className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Unlock
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Your private key is encrypted locally. Only your password can decrypt it.
          </p>
        </div>
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="CertLayer" className="w-12 h-12 rounded-xl" />
          </Link>
          <h1 className="text-2xl font-bold">
            Connect to Cert<span className="text-primary">Layer</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to connect
          </p>
        </div>

        {/* ========== STEP: CHOOSE ========== */}
        {step === "choose" && (
          <div className="space-y-3 animate-fade-in">
            {/* MetaMask */}
            <button
              onClick={() => {
                setStep("choose");
                handleMetaMask();
              }}
              disabled={!hasMetaMask || loading || !password}
              className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-secondary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 40 40" className="w-6 h-6">
                  <path d="M37.5 5L22.2 16.6l2.8-6.7L37.5 5z" fill="#E2761B" stroke="#E2761B" strokeWidth=".3"/>
                  <path d="M2.5 5l15.1 11.7-2.6-6.8L2.5 5zM32.1 28.5l-4.1 6.2 8.7 2.4 2.5-8.5-7.1-.1zM.8 28.6l2.5 8.5 8.7-2.4-4.1-6.2-7.1.1z" fill="#E4761B" stroke="#E4761B" strokeWidth=".3"/>
                  <path d="M11.6 17.5l-2.4 3.7 8.6.4-.3-9.3-5.9 5.2zM28.4 17.5l-6-5.3-.2 9.4 8.6-.4-2.4-3.7zM12 34.7l5.2-2.5-4.5-3.5-.7 6zM22.8 32.2l5.2 2.5-.7-6-4.5 3.5z" fill="#E4761B" stroke="#E4761B" strokeWidth=".3"/>
                  <path d="M28 34.7l-5.2-2.5.4 3.4v1.4L28 34.7zM12 34.7l4.8 2.3v-1.4l.4-3.4-5.2 2.5z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".3"/>
                  <path d="M16.9 26.8l-4.3-1.3 3-1.4 1.3 2.7zM23.1 26.8l1.3-2.7 3.1 1.4-4.4 1.3z" fill="#233447" stroke="#233447" strokeWidth=".3"/>
                  <path d="M12 34.7l.7-6.2-4.8.1L12 34.7zM27.3 28.5l.7 6.2 4.1-6.1-4.8-.1zM30.8 21.2l-8.6.4.8 4.2 1.3-2.7 3.1 1.4 3.4-3.3zM12.6 25.5l3-1.4 1.3 2.7.8-4.2-8.5-.4 3.4 3.3z" fill="#CD6116" stroke="#CD6116" strokeWidth=".3"/>
                  <path d="M9.2 21.2l3.5 6.9-.1-3.4-3.4-3.5zM27.4 24.7l-.1 3.4 3.5-6.9-3.4 3.5zM17.7 21.6l-.8 4.2 1 5.1.2-6.8-.4-2.5zM22.2 21.6l-.3 2.4.1 6.9 1-5.1-.8-4.2z" fill="#E4751F" stroke="#E4751F" strokeWidth=".3"/>
                  <path d="M23.1 26.8l-1 5.1.7.5 4.5-3.5.1-3.4-4.3 1.3zM12.6 25.5l.1 3.4 4.5 3.5.7-.5-1-5.1-4.3-1.3z" fill="#F6851B" stroke="#F6851B" strokeWidth=".3"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">MetaMask</p>
                <p className="text-xs text-muted-foreground">
                  {hasMetaMask ? "Connect your browser wallet" : "Not installed"}
                </p>
              </div>
              {loading ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              {hasMetaMask && (
                <span className="absolute top-2 right-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Detected
                </span>
              )}
            </button>

            {/* Generate New Wallet */}
            <button
              onClick={() => setStep("generate")}
              disabled={loading}
              className="w-full group flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-secondary/50 transition-all disabled:opacity-40"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Plus className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Create New Wallet</p>
                <p className="text-xs text-muted-foreground">Generate a fresh wallet instantly</p>
              </div>
              {loading ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Import Private Key */}
            <button
              onClick={() => setStep("import-key")}
              disabled={loading}
              className="w-full group flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-secondary/50 transition-all disabled:opacity-40"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Import Private Key</p>
                <p className="text-xs text-muted-foreground">Connect with an existing key</p>
              </div>
              <KeyRound className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <Separator className="my-3" />

            {/* Email Login */}
            <button
              onClick={() => setStep("email")}
              disabled={loading}
              className="w-full group flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-secondary/50 transition-all disabled:opacity-40"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/30 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Continue with Email</p>
                <p className="text-xs text-muted-foreground">Auto-create a wallet tied to your email</p>
              </div>
              <Sparkles className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              <ShieldCheck className="w-3 h-3 inline-block mr-1" />
              Your keys are AES-256 encrypted with your password. We never store private keys in plain text.
            </p>

            {/* Password for MetaMask */}
            {hasMetaMask && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="mm-pw" className="text-xs text-muted-foreground">
                  Set a password for MetaMask (encrypts your GenLayer key)
                </Label>
                <div className="relative">
                  <Input
                    id="mm-pw"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== STEP: EMAIL ========== */}
        {step === "email" && (
          <Card className="bg-white border border-border animate-fade-in">
            <CardHeader>
              <button
                onClick={() => setStep("choose")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Sign in with Email
              </CardTitle>
              <CardDescription>
                A wallet will be created and encrypted with your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@protocol.xyz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="email-pw"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="glow"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  Continue
                </Button>
              </form>
              <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">How it works:</strong> Your wallet key is
                  encrypted with your password using AES-256. Same email + same password = same wallet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== STEP: GENERATE ========== */}
        {step === "generate" && (
          <Card className="bg-white border border-border animate-fade-in">
            <CardHeader>
              <button
                onClick={() => setStep("choose")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Create New Wallet
              </CardTitle>
              <CardDescription>
                Set a password to encrypt your new wallet key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gen-pw">Password</Label>
                  <Input
                    id="gen-pw"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gen-pw2">Confirm Password</Label>
                  <Input
                    id="gen-pw2"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="glow" className="w-full gap-2" disabled={loading}>
                  {loading ? <Spinner className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  Create Wallet
                </Button>
              </form>
              <div className="mt-4 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> Your password encrypts your
                  private key. There is no recovery — if you forget it, you lose access. You can export
                  your key later from the dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== STEP: IMPORT KEY ========== */}
        {step === "import-key" && (
          <Card className="bg-white border border-border animate-fade-in">
            <CardHeader>
              <button
                onClick={() => setStep("choose")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Import Private Key
              </CardTitle>
              <CardDescription>
                Import and encrypt your existing key with a password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImport} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pk">Private Key</Label>
                  <div className="relative">
                    <Input
                      id="pk"
                      type={showKey ? "text" : "password"}
                      placeholder="0x..."
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="pr-10 font-mono text-sm"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imp-pw">Password</Label>
                  <Input
                    id="imp-pw"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imp-pw2">Confirm Password</Label>
                  <Input
                    id="imp-pw2"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="glow"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  Import & Encrypt
                </Button>
              </form>
              <div className="mt-4 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Security:</strong> Your private key will be
                  AES-256 encrypted with your password immediately. The raw key is never stored.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
