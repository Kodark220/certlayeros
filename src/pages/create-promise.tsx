import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  ArrowRight,
  CalendarDays,
  Link2,
  Coins,
  Eye,
  Settings2,
  FileText,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { writeContract } from "@/lib/genlayer";
import toast from "react-hot-toast";

export function CreatePromisePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    description: "",
    deadline: "",
    verificationUrls: "",
    depositAmount: "0",
    watcherRewardPct: "70",
    minWatcherStake: "0",
    mode: "stake",
    criteria: "",
    claimWindowDays: "30",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || !form.deadline.trim()) {
      toast.error("Description and deadline are required");
      return;
    }
    setLoading(true);
    try {
      const { hash } = await writeContract(
        "create_promise",
        [
          form.description,
          form.deadline,
          form.verificationUrls || "none",
          parseInt(form.depositAmount) || 0,
          parseInt(form.watcherRewardPct) || 70,
          parseInt(form.minWatcherStake) || 0,
          form.mode,
          form.criteria || "Evaluate whether the promise was fulfilled based on available evidence",
          parseInt(form.claimWindowDays) || 30,
        ],
        parseInt(form.depositAmount) || 0
      );
      toast.success("Promise created successfully!");
      navigate("/promises");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Failed to create promise");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
    <div className="pb-16">
      <PageHeader
        title="Create Promise"
        description="Make an on-chain commitment backed by deposited funds"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <CardTitle>New Promise</CardTitle>
                <CardDescription>
                  Define what you're committing to and the evaluation criteria
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Promise basics */}
              <div className="space-y-2">
                <Label htmlFor="desc">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Promise Description *
                  </div>
                </Label>
                <textarea
                  id="desc"
                  rows={3}
                  placeholder="Describe what your protocol promises to do..."
                  className="flex w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 resize-none"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Deadline *
                    </div>
                  </Label>
                  <Input
                    id="deadline"
                    placeholder="2026-06-30"
                    value={form.deadline}
                    onChange={(e) => update("deadline", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urls">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      Verification URLs
                    </div>
                  </Label>
                  <Input
                    id="urls"
                    placeholder="https://..."
                    value={form.verificationUrls}
                    onChange={(e) => update("verificationUrls", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="criteria">
                  <div className="flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" />
                    AI Evaluation Criteria
                  </div>
                </Label>
                <textarea
                  id="criteria"
                  rows={2}
                  placeholder="What should the AI check to verify this promise?"
                  className="flex w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 resize-none"
                  value={form.criteria}
                  onChange={(e) => update("criteria", e.target.value)}
                />
              </div>

              {/* Watcher Settings */}
              <div className="rounded-xl border border-border p-4 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Watcher Settings
                </h3>

                <Tabs
                  value={form.mode}
                  onValueChange={(v) => update("mode", v)}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="stake" className="flex-1">
                      Stake Mode
                    </TabsTrigger>
                    <TabsTrigger value="token_gated" className="flex-1">
                      Token Gated
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        Deposit (wei)
                      </div>
                    </Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="0"
                      value={form.depositAmount}
                      onChange={(e) => update("depositAmount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward">Reward %</Label>
                    <Input
                      id="reward"
                      type="number"
                      min="0"
                      max="100"
                      value={form.watcherRewardPct}
                      onChange={(e) => update("watcherRewardPct", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stake">Min Stake (wei)</Label>
                    <Input
                      id="stake"
                      type="number"
                      placeholder="0"
                      value={form.minWatcherStake}
                      onChange={(e) => update("minWatcherStake", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claim">Claim Window (days)</Label>
                  <Input
                    id="claim"
                    type="number"
                    placeholder="30"
                    value={form.claimWindowDays}
                    onChange={(e) => update("claimWindowDays", e.target.value)}
                  />
                </div>
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
                    <Spinner /> Creating Promise...
                  </>
                ) : (
                  <>
                    Create Promise
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
