import { useState, useEffect } from "react";
import { Wallet, ArrowRight, Coins, AlertTriangle } from "lucide-react";
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
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { readContract, writeContract, toCalldataAddress } from "../lib/genlayer";
import toast from "react-hot-toast";

export function WithdrawPage() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  async function checkBalance() {
    if (!address.trim()) {
      toast.error("Enter an address");
      return;
    }
    setLoading(true);
    try {
      const bal = await readContract("get_claimable_balance", [toCalldataAddress(address)]);
      setBalance(String(bal));
    } catch (err: any) {
      toast.error("Failed to check balance");
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    setWithdrawLoading(true);
    try {
      await writeContract("withdraw");
      toast.success("Withdrawal successful!");
      setBalance("0");
    } catch (err: any) {
      toast.error(err?.message?.slice(0, 100) || "Withdrawal failed");
    } finally {
      setWithdrawLoading(false);
    }
  }

  return (
    <PageTransition>
    <div className="pb-16">
      <PageHeader
        title="Withdraw"
        description="Claim your earned rewards from watched promises"
      />

      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Check balance */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle>Check Balance</CardTitle>
                <CardDescription>
                  View your claimable rewards
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Button
              onClick={checkBalance}
              variant="outline"
              className="w-full gap-2"
              disabled={loading}
            >
              {loading ? <Spinner /> : <Coins className="w-4 h-4" />}
              Check Balance
            </Button>

            {balance !== null && (
              <div className="rounded-xl bg-secondary/50 p-4 text-center animate-fade-in">
                <p className="text-xs text-muted-foreground mb-1">
                  Claimable Balance
                </p>
                <p className="text-3xl font-bold">
                  {balance}
                  <span className="text-sm text-muted-foreground ml-2">wei</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>
                  Withdraw all claimable rewards to your wallet
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This will withdraw all claimable funds from the CertLayer
                contract to the connected wallet address.
              </p>
            </div>

            <Button
              onClick={handleWithdraw}
              variant="glow"
              size="lg"
              className="w-full gap-2"
              disabled={withdrawLoading}
            >
              {withdrawLoading ? (
                <>
                  <Spinner /> Processing...
                </>
              ) : (
                <>
                  Withdraw All
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
}
