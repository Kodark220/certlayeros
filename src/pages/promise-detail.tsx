import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageTransition } from "@/components/motion";
import {
  ArrowLeft,
  Eye,
  Brain,
  Coins,
  CalendarDays,
  Link2,
  Users,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { readContract, writeContract, toCalldataAddress } from "../lib/genlayer";
import { PROMISE_STATUS } from "@/lib/contract";
import { useNetwork } from "@/contexts/network-context";
import toast from "react-hot-toast";

interface PromiseData {
  description: string;
  deadline: string;
  status: number;
  deposit_amount: number;
  watcher_count: number;
  total_watcher_stake: number;
  protocol_owner: string;
  mode: string;
  criteria: string;
  verification_urls: string;
  watcher_reward_pct: number;
  min_watcher_stake: number;
  claim_window_days: number;
  evaluation_summary: string;
}

export function PromiseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { networkId } = useNetwork();
  const [promise, setPromise] = useState<PromiseData | null>(null);
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [contributorHandle, setContributorHandle] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const raw = (await readContract("get_promise", [String(id)])) as string;
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        setPromise(data);

        if (data.protocol_owner) {
          try {
            const pRaw = (await readContract("get_protocol", [
              toCalldataAddress(data.protocol_owner),
            ])) as string;
            const pData = typeof pRaw === "string" ? JSON.parse(pRaw) : pRaw;
            setProtocol(pData);
          } catch {}
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load promise");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, networkId]);

  async function handleAction(action: string) {
    setActionLoading(action);
    try {
      switch (action) {
        case "watch":
          await writeContract(
            "watch_promise",
            [String(id), parseInt(stakeAmount) || 0],
            parseInt(stakeAmount) || 0
          );
          toast.success("You are now watching this promise!");
          break;
        case "evaluate":
          await writeContract("evaluate_promise", [String(id)]);
          toast.success("Evaluation triggered!");
          break;
        case "verify":
          if (!evidenceUrl.trim() || !contributorHandle.trim()) {
            toast.error("Evidence URL and handle are required");
            return;
          }
          await writeContract("verify_contributor", [
            String(id),
            evidenceUrl,
            contributorHandle,
          ]);
          toast.success("Contributor verification submitted!");
          break;
        case "finalize":
          await writeContract("finalize_contributor_claims", [String(id)]);
          toast.success("Claims finalized!");
          break;
      }
      // reload
      const raw = (await readContract("get_promise", [String(id)])) as string;
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setPromise(data);
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || `${action} failed`);
    } finally {
      setActionLoading("");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!promise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-4">Promise not found</p>
        <Link to="/promises">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Promises
          </Button>
        </Link>
      </div>
    );
  }

  const status = PROMISE_STATUS[promise.status] ?? PROMISE_STATUS[0];
  const StatusIcon =
    promise.status === 1
      ? CheckCircle2
      : promise.status === 2
      ? XCircle
      : Clock;

  return (
    <PageTransition>
    <div className="pb-16">
      <PageHeader title={`Promise #${id}`}>
        <Link to="/promises">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            All Promises
          </Button>
        </Link>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Status + description header */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  promise.status === 1
                    ? "bg-emerald-500/10"
                    : promise.status === 2
                    ? "bg-red-500/10"
                    : "bg-blue-500/10"
                }`}
              >
                <StatusIcon
                  className={`w-6 h-6 ${
                    promise.status === 1
                      ? "text-emerald-400"
                      : promise.status === 2
                      ? "text-red-400"
                      : "text-blue-400"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      promise.status === 1
                        ? "success"
                        : promise.status === 2
                        ? "destructive"
                        : "default"
                    }
                  >
                    {status.label}
                  </Badge>
                  <Badge variant="outline">{promise.mode}</Badge>
                </div>
                <p className="text-lg font-medium leading-relaxed">
                  {promise.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info grid */}
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={CalendarDays}
                    label="Deadline"
                    value={promise.deadline}
                  />
                  <InfoItem
                    icon={Coins}
                    label="Deposit"
                    value={`${promise.deposit_amount} wei`}
                  />
                  <InfoItem
                    icon={Eye}
                    label="Watchers"
                    value={String(promise.watcher_count)}
                  />
                  <InfoItem
                    icon={Coins}
                    label="Total Staked"
                    value={`${promise.total_watcher_stake} wei`}
                  />
                  <InfoItem
                    icon={Zap}
                    label="Watcher Reward"
                    value={`${promise.watcher_reward_pct}%`}
                  />
                  <InfoItem
                    icon={Shield}
                    label="Min Stake"
                    value={`${promise.min_watcher_stake} wei`}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Claim Window"
                    value={`${promise.claim_window_days} days`}
                  />
                  <InfoItem
                    icon={Link2}
                    label="Verification"
                    value={promise.verification_urls || "none"}
                    truncate
                  />
                </div>
              </CardContent>
            </Card>

            {/* Criteria */}
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Evaluation Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-lg p-4">
                  {promise.criteria || "No criteria specified"}
                </p>
              </CardContent>
            </Card>

            {/* Evaluation summary */}
            {promise.evaluation_summary && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    Evaluation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-lg p-4">
                    {promise.evaluation_summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Protocol info */}
            {protocol && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{protocol.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {protocol.website}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">
                          Reputation
                        </span>
                        <span className="text-xl font-bold">
                          {protocol.reputation_score}
                        </span>
                      </div>
                      <Progress
                        value={protocol.reputation_score}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {protocol.promises_kept} kept
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-400" />
                      {protocol.promises_broken} broken
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions panel */}
          <div className="space-y-4">
            {/* Watch */}
            {promise.status === 0 && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    Watch This Promise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Stake Amount (wei)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full gap-2"
                    variant="glow"
                    disabled={actionLoading === "watch"}
                    onClick={() => handleAction("watch")}
                  >
                    {actionLoading === "watch" ? (
                      <Spinner />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Watch Promise
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Evaluate */}
            {promise.status === 0 && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-400" />
                    Evaluate Promise
                  </CardTitle>
                  <CardDescription>
                    Trigger AI evaluation after deadline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    disabled={actionLoading === "evaluate"}
                    onClick={() => handleAction("evaluate")}
                  >
                    {actionLoading === "evaluate" ? (
                      <Spinner />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    Run Evaluation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Verify contributor */}
            {promise.status === 2 && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Verify as Contributor
                  </CardTitle>
                  <CardDescription>
                    Submit evidence of being affected
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Evidence URL</Label>
                    <Input
                      placeholder="https://..."
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Handle</Label>
                    <Input
                      placeholder="@yourhandle"
                      value={contributorHandle}
                      onChange={(e) => setContributorHandle(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    disabled={actionLoading === "verify"}
                    onClick={() => handleAction("verify")}
                  >
                    {actionLoading === "verify" ? (
                      <Spinner />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    Submit Verification
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Finalize */}
            {promise.status === 2 && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Finalize Claims
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    disabled={actionLoading === "finalize"}
                    onClick={() => handleAction("finalize")}
                  >
                    {actionLoading === "finalize" ? (
                      <Spinner />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Finalize
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* owner address */}
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Protocol Owner
                </p>
                <p className="text-xs font-mono truncate">
                  {promise.protocol_owner}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  truncate,
}: {
  icon: any;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <p
        className={`text-sm font-medium ${truncate ? "truncate" : ""}`}
        title={truncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}
