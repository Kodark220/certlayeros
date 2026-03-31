import { useNavigate } from "react-router-dom";
import { Shield, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { PageTransition, motion } from "@/components/motion";

export function SelectRolePage() {
  const { user, setChosenRole } = useAuth();
  const navigate = useNavigate();

  // If already has a chosen role or not logged in, redirect
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.chosenRole) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  function pick(role: "protocol" | "watcher") {
    setChosenRole(role);
    navigate("/dashboard", { replace: true });
  }

  if (!user || user.chosenRole) return null;

  return (
    <PageTransition>
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            How will you use <span className="text-primary">CertLayer</span>?
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your role to get started. You can always switch later.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Protocol */}
          <motion.button onClick={() => pick("protocol")} className="text-left group" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full bg-white border-2 border-transparent hover:border-primary/50 transition-colors duration-300 cursor-pointer">
              <CardContent className="p-8 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">I'm a Protocol</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Register your protocol, create on-chain promises, build reputation, and show your community you're accountable.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Create & manage promises
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Build on-chain reputation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Stake funds on commitments
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-primary font-medium text-sm pt-2 group-hover:translate-x-1 transition-transform">
                  Continue as Protocol <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </motion.button>

          {/* Watcher */}
          <motion.button onClick={() => pick("watcher")} className="text-left group" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full bg-white border-2 border-transparent hover:border-blue-500/50 transition-colors duration-300 cursor-pointer">
              <CardContent className="p-8 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">I'm a Watcher</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Browse protocol promises, join as a watcher, verify outcomes, and earn rewards for holding protocols accountable.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Browse & enter promises
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Verify promise outcomes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Earn watcher rewards
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm pt-2 group-hover:translate-x-1 transition-transform">
                  Continue as Watcher <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </motion.button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/60">
          Connected as{" "}
          <span className="font-mono">
            {user?.externalAddress
              ? `${user.externalAddress.slice(0, 6)}...${user.externalAddress.slice(-4)}`
              : `${user?.address.slice(0, 6)}...${user?.address.slice(-4)}`}
          </span>
        </p>
      </div>
    </div>
    </PageTransition>
  );
}
