import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, ShieldCheck } from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

const hasMetaMask = typeof window !== "undefined" && !!(window as any).ethereum;

export function LoginPage() {
  const { connectWallet } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      await connectWallet();
      toast.success("Wallet connected!");
      navigate("/select-role");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        toast.error("Connection cancelled");
      } else {
        toast.error(msg.slice(0, 100) || "Connection failed");
      }
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
            Connect your wallet to get started
          </p>
        </div>

        <div className="space-y-4 animate-fade-in">
          {/* Connect Wallet Button */}
          <button
            onClick={handleConnect}
            disabled={!hasMetaMask || loading}
            className="w-full group relative flex items-center gap-4 p-5 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-secondary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 40 40" className="w-7 h-7">
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
              <p className="font-semibold">Connect with MetaMask</p>
              <p className="text-xs text-muted-foreground">
                {hasMetaMask ? "Sign in using your browser wallet" : "MetaMask not detected — please install it"}
              </p>
            </div>
            {loading && <Spinner className="w-5 h-5" />}
            {hasMetaMask && !loading && (
              <span className="absolute top-2 right-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Detected
              </span>
            )}
          </button>

          {!hasMetaMask && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
            >
              <Wallet className="w-4 h-4" />
              Install MetaMask
            </Button>
          )}

          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 mt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1.5 text-primary" />
              <strong className="text-foreground">How it works:</strong> You'll sign a message with
              MetaMask to verify your identity. This creates your unique CertLayer account — no
              passwords, no private keys to manage. Same wallet = same account every time.
            </p>
          </div>

          <p className="text-center text-[11px] text-muted-foreground pt-2">
            No gas fees are charged for signing in. Only on-chain actions require tokens.
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
