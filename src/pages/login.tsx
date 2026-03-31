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

type ConnectStep = "choose" | "email" | "import-key";

const hasMetaMask = typeof window !== "undefined" && !!(window as any).ethereum;

export function LoginPage() {
  const { loginWithEmail, loginWithWallet, loginWithMetaMask } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<ConnectStep>("choose");
  const [email, setEmail] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  function go(target: string) {
    navigate(target);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      loginWithEmail(email.trim());
      toast.success("Logged in successfully!");
      go("/select-role");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMetaMask() {
    setLoading(true);
    try {
      await loginWithMetaMask();
      toast.success("MetaMask connected!");
      go("/select-role");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "MetaMask connection failed");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    setLoading(true);
    try {
      loginWithWallet();
      toast.success("New wallet created!");
      go("/select-role");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Failed to generate wallet");
    } finally {
      setLoading(false);
    }
  }

  function handleImport() {
    if (!privateKey.trim()) {
      toast.error("Please enter a private key");
      return;
    }
    setLoading(true);
    try {
      loginWithWallet(privateKey.trim());
      toast.success("Wallet imported!");
      go("/select-role");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Import failed");
    } finally {
      setLoading(false);
    }
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
              onClick={handleMetaMask}
              disabled={!hasMetaMask || loading}
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
              onClick={handleGenerate}
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
              Your keys are stored locally in this browser. We never store your private keys on a server.
            </p>
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
                A wallet will be automatically created for your account
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
                  <strong className="text-foreground">How it works:</strong> We generate a
                  unique wallet tied to your email. Same email = same wallet, every time.
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
                Paste your existing private key to connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button
                onClick={handleImport}
                variant="glow"
                className="w-full gap-2"
                disabled={loading || !privateKey.trim()}
              >
                {loading ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                Import & Connect
              </Button>
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <p className="text-xs text-amber-300/80">
                  <strong>Security:</strong> Your private key is stored only in this
                  browser's local storage. Never share your private key with anyone.
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
