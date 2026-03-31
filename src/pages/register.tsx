import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Globe, Coins, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { writeContract } from "@/lib/genlayer";
import toast from "react-hot-toast";

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    website: "",
    tokenAddress: "none",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Protocol name is required");
      return;
    }
    setLoading(true);
    try {
      const { hash } = await writeContract("register_protocol", [
        form.name,
        form.website || "none",
        form.tokenAddress || "none",
      ]);
      toast.success("Protocol registered successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
    <div className="pb-16">
      <PageHeader
        title="Register Protocol"
        description="Set up your protocol identity on CertLayer"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Protocol Registration</CardTitle>
                <CardDescription>
                  Register to start making on-chain promises
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Protocol Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. MyProtocol"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Website URL
                  </div>
                </Label>
                <Input
                  id="website"
                  placeholder="https://myprotocol.xyz"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    Token Address
                  </div>
                </Label>
                <Input
                  id="token"
                  placeholder="0x... or 'none'"
                  value={form.tokenAddress}
                  onChange={(e) =>
                    setForm({ ...form, tokenAddress: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  For token-gated watcher mode. Leave as "none" for stake mode.
                </p>
              </div>

              {/* Info box */}
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
                <p className="text-sm font-medium">What happens next?</p>
                <ul className="space-y-1.5">
                  {[
                    "Your protocol gets a starting reputation of 50/100",
                    "You can create promises with deposit collateral",
                    "Community watchers will monitor your promises",
                    "AI evaluates outcomes when deadlines pass",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner /> Registering...
                  </>
                ) : (
                  <>
                    Register Protocol
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
}
