import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Shield,
  PlusCircle,
  Activity,
  Eye,
  Globe,
  Coins,
  Star,
  Copy,
  CheckCircle2,
  Wallet,
  ExternalLink,
  BarChart3,
  Crown,
  AlertTriangle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/spinner";
import { PageTransition, motion, staggerContainer, staggerItem } from "@/components/motion";
import { readContract, writeContract, toCalldataAddress } from "@/lib/genlayer";
import { PROMISE_STATUS } from "@/lib/contract";
import { useNetwork } from "@/contexts/network-context";
import { useAuth } from "@/contexts/auth-context";
import { useRole, type ProtocolData } from "@/hooks/use-role";
import toast from "react-hot-toast";

interface PromiseData {
  id: number;
  description: string;
  deadline: string;
  status: number;
  deposit_amount: number;
  watcher_count: number;
  protocol_owner: string;
  mode: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { role, loading: roleLoading, protocolData, refreshRole } = useRole();
  const { network, networkId } = useNetwork();
  const [allPromises, setAllPromises] = useState<PromiseData[]>([]);
  const [myPromises, setMyPromises] = useState<PromiseData[]>([]);
  const [watchedPromises, setWatchedPromises] = useState<PromiseData[]>([]);
  const [claimable, setClaimable] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Registration form (for watcher view)
  const [regForm, setRegForm] = useState({ name: "", website: "", tokenAddress: "none" });
  const [regLoading, setRegLoading] = useState(false);

  const addr = user?.address || "";

  const loadData = useCallback(async () => {
    if (!addr) return;
    setLoading(true);
    try {
      // Kick off balance + count in parallel
      const [balResult, countResult] = await Promise.allSettled([
        readContract("get_claimable_balance", [toCalldataAddress(addr)]),
        readContract("get_promise_count"),
      ]);

      if (balResult.status === "fulfilled") setClaimable(String(balResult.value));

      const count =
        countResult.status === "fulfilled" ? (countResult.value as number) : 0;
      const limit = Math.min(count, 50);

      if (limit > 0) {
        // Fetch all promises in parallel
        const promiseResults = await Promise.allSettled(
          Array.from({ length: limit }, (_, i) =>
            readContract("get_promise", [String(i)]).then((raw) => {
              const data = typeof raw === "string" ? JSON.parse(raw) : raw;
              return { ...data, id: i } as PromiseData;
            })
          )
        );

        const all: PromiseData[] = [];
        const mine: PromiseData[] = [];
        for (const r of promiseResults) {
          if (r.status === "fulfilled") {
            all.push(r.value);
            if (r.value.protocol_owner?.toLowerCase() === addr.toLowerCase()) {
              mine.push(r.value);
            }
          }
        }

        // Check is_watcher for all promises in parallel
        const watchResults = await Promise.allSettled(
          all.map((p) =>
            readContract("is_watcher", [String(p.id), toCalldataAddress(addr)])
              .then((isW) => (isW ? p : null))
          )
        );
        const watched = watchResults
          .filter((r): r is PromiseFulfilledResult<PromiseData | null> => r.status === "fulfilled")
          .map((r) => r.value)
          .filter((p): p is PromiseData => p !== null);

        setAllPromises(all);
        setMyPromises(mine);
        setWatchedPromises(watched);
      } else {
        setAllPromises([]);
        setMyPromises([]);
        setWatchedPromises([]);
      }
    } catch {
      // top-level catch — keep dashboard usable even on failure
    } finally {
      setLoading(false);
    }
  }, [addr, networkId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regForm.name.trim()) {
      toast.error("Protocol name is required");
      return;
    }
    setRegLoading(true);
    try {
      await writeContract("register_protocol", [
        regForm.name,
        regForm.website || "none",
        regForm.tokenAddress || "none",
      ]);
      toast.success("Protocol registered! Refreshing...");
      refreshRole();
      loadData();
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  }

  async function handleWithdraw() {
    try {
      await writeContract("withdraw");
      toast.success("Withdrawal successful!");
      setClaimable("0");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Withdrawal failed");
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const roleMeta = role === "admin"
    ? { label: "Admin", variant: "destructive" as const, icon: Crown }
    : role === "protocol"
    ? { label: "Protocol", variant: "success" as const, icon: Shield }
    : { label: "Watcher", variant: "default" as const, icon: Eye };

  const activeCount = allPromises.filter((p) => p.status === 0).length;
  const keptCount = allPromises.filter((p) => p.status === 1).length;
  const brokenCount = allPromises.filter((p) => p.status === 2).length;

  return (
    <PageTransition>
    <div className="min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {role === "admin"
                  ? "Admin Dashboard"
                  : role === "protocol"
                  ? protocolData?.name || "Protocol Dashboard"
                  : "Watcher Dashboard"}
              </h1>
              <Badge variant={roleMeta.variant} className="text-xs">
                {roleMeta.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {role === "admin"
                ? "Overview of the CertLayer ecosystem"
                : role === "protocol"
                ? "Manage your promises and reputation"
                : "Browse promises, watch & earn rewards"}
            </p>
          </div>
          {(role === "admin" || role === "protocol") && protocolData && (
            <Link to="/create-promise">
              <Button size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                New Promise
              </Button>
            </Link>
          )}
        </div>

        {/* Account info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {role === "admin"
                      ? "Contract Admin"
                      : role === "protocol"
                      ? protocolData?.name || "Unregistered Protocol"
                      : "Connected Wallet"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-muted-foreground truncate max-w-[260px]">
                      {addr}
                    </p>
                    <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`${network.explorer}/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                    <ExternalLink className="w-3 h-3" />
                    Explorer
                  </Button>
                </a>
                <Badge variant="outline" className="text-[11px] h-6 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {network.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================= ADMIN VIEW ======================= */}
        {role === "admin" && (
          <>
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { title: "Total Promises", value: allPromises.length, icon: FileText },
                { title: "Active", value: activeCount, icon: Activity },
                { title: "Kept", value: keptCount, icon: CheckCircle2 },
                { title: "Broken", value: brokenCount, icon: AlertTriangle },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.title} variants={staggerItem}>
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-semibold mt-1 tabular-nums">{stat.value}</p>
                          </div>
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  Contract Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contract</p>
                    <p className="font-mono text-xs bg-muted rounded-md px-3 py-2 truncate">{network.contractAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Network</p>
                    <p className="text-xs bg-muted rounded-md px-3 py-2">{network.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-xs bg-muted rounded-md px-3 py-2">{allPromises.length} promises tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All ({allPromises.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({keptCount + brokenCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <PromiseGrid promises={allPromises} emptyMsg="No promises have been created yet" />
              </TabsContent>
              <TabsContent value="active">
                <PromiseGrid promises={allPromises.filter(p => p.status === 0)} emptyMsg="No active promises" />
              </TabsContent>
              <TabsContent value="resolved">
                <PromiseGrid promises={allPromises.filter(p => p.status !== 0)} emptyMsg="No resolved promises yet" />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* ======================= PROTOCOL VIEW ======================= */}
        {role === "protocol" && !protocolData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Register Your Protocol</CardTitle>
              <CardDescription>
                Set up your on-chain identity to start making promises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Protocol Name *</Label>
                    <Input
                      id="reg-name"
                      placeholder="e.g. MyProtocol"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-website" className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      Website
                    </Label>
                    <Input
                      id="reg-website"
                      placeholder="https://myprotocol.xyz"
                      value={regForm.website}
                      onChange={(e) => setRegForm({ ...regForm, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-token" className="flex items-center gap-1.5">
                    <Coins className="w-3 h-3" />
                    Token Address
                  </Label>
                  <Input
                    id="reg-token"
                    placeholder="0x... or 'none'"
                    value={regForm.tokenAddress}
                    onChange={(e) => setRegForm({ ...regForm, tokenAddress: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">For token-gated mode. Leave as "none" for stake mode.</p>
                </div>
                <Button type="submit" className="gap-2" disabled={regLoading}>
                  {regLoading ? <Spinner /> : <ArrowUpRight className="w-4 h-4" />}
                  Register Protocol
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {role === "protocol" && protocolData && (
          <>
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-5 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { title: "Reputation", value: protocolData.reputation_score, suffix: "/100", icon: Star },
                { title: "My Promises", value: myPromises.length, icon: FileText },
                { title: "Active", value: myPromises.filter(p => p.status === 0).length, icon: Activity },
                { title: "Kept", value: protocolData.promises_kept, icon: CheckCircle2 },
                { title: "Broken", value: protocolData.promises_broken, icon: AlertTriangle },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.title} variants={staggerItem}>
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-semibold mt-1 tabular-nums">
                              {stat.value}
                              {"suffix" in stat && <span className="text-sm text-muted-foreground ml-0.5">{(stat as any).suffix}</span>}
                            </p>
                          </div>
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Reputation */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Reputation</span>
                  <span className="text-sm tabular-nums">
                    {protocolData.reputation_score}
                    <span className="text-muted-foreground">/100</span>
                  </span>
                </div>
                <Progress value={protocolData.reputation_score} className="h-2" />
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-muted-foreground">Poor</span>
                  <span className="text-[11px] text-muted-foreground">Average</span>
                  <span className="text-[11px] text-muted-foreground">Excellent</span>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="promises" className="space-y-4">
              <TabsList>
                <TabsTrigger value="promises">My Promises</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              <TabsContent value="promises">
                {myPromises.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">No promises yet</p>
                      <p className="text-xs text-muted-foreground/60 mb-4">Create your first on-chain promise</p>
                      <Link to="/create-promise">
                        <Button size="sm" className="gap-2">
                          <PlusCircle className="w-4 h-4" />
                          Create Promise
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <PromiseGrid promises={myPromises} />
                )}
              </TabsContent>

              <TabsContent value="earnings">
                <EarningsCard claimable={claimable} onWithdraw={handleWithdraw} />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* ======================= WATCHER VIEW ======================= */}
        {role === "watcher" && (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { title: "Watching", value: watchedPromises.length, icon: Eye },
                { title: "Claimable", value: claimable === "0" ? "0" : claimable, suffix: claimable !== "0" ? " wei" : "", icon: Wallet },
                { title: "Total Promises", value: allPromises.length, icon: FileText },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.title} variants={staggerItem}>
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-semibold mt-1 tabular-nums">
                              {stat.value}
                              {"suffix" in stat && stat.suffix && <span className="text-sm text-muted-foreground ml-0.5">{stat.suffix}</span>}
                            </p>
                          </div>
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Tabs defaultValue="promises" className="space-y-4">
              <TabsList>
                <TabsTrigger value="promises">All Promises</TabsTrigger>
                <TabsTrigger value="watching">
                  My Watching
                  {watchedPromises.length > 0 && (
                    <Badge variant="default" className="ml-1.5 text-[10px] h-5 px-1.5">
                      {watchedPromises.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              <TabsContent value="promises">
                <PromiseGrid promises={allPromises} emptyMsg="No promises have been created yet" />
              </TabsContent>

              <TabsContent value="watching">
                {watchedPromises.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Eye className="w-8 h-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Not watching any promises</p>
                      <p className="text-xs text-muted-foreground/60">Browse the All Promises tab to find promises to watch</p>
                    </CardContent>
                  </Card>
                ) : (
                  <PromiseGrid promises={watchedPromises} />
                )}
              </TabsContent>

              <TabsContent value="earnings">
                <EarningsCard claimable={claimable} onWithdraw={handleWithdraw} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
    </PageTransition>
  );
}

/* ============ Shared Components ============ */

function PromiseGrid({ promises, emptyMsg }: { promises: PromiseData[]; emptyMsg?: string }) {
  if (promises.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{emptyMsg || "No promises found"}</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {promises.map((p) => (
        <motion.div key={p.id} variants={staggerItem}>
          <PromiseCard promise={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function PromiseCard({ promise }: { promise: PromiseData }) {
  const status = PROMISE_STATUS[promise.status] ?? PROMISE_STATUS[0];

  return (
    <Link to={`/promises/${promise.id}`}>
      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge
              variant={
                promise.status === 1
                  ? "success"
                  : promise.status === 2
                  ? "destructive"
                  : "default"
              }
              className="text-[10px]"
            >
              {status.label}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">#{promise.id}</span>
          </div>
          <p className="text-sm font-medium line-clamp-2 mb-4">{promise.description}</p>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {promise.watcher_count} watchers
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {promise.deadline}
            </span>
          </div>
          {promise.deposit_amount > 0 && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <Wallet className="w-3 h-3" />
              {promise.deposit_amount} wei staked
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}

function EarningsCard({ claimable, onWithdraw }: { claimable: string; onWithdraw: () => void }) {
  const hasBalance = claimable !== "0";
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Claimable Balance</p>
            <p className="text-3xl font-semibold tabular-nums">{claimable} <span className="text-sm text-muted-foreground font-normal">wei</span></p>
          </div>
          <Button
            onClick={onWithdraw}
            className="gap-2"
            disabled={!hasBalance}
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw
          </Button>
        </div>
        {!hasBalance && (
          <p className="text-xs text-muted-foreground mt-3">No balance available to withdraw</p>
        )}
      </CardContent>
    </Card>
  );
}
