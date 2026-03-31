import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, PlusCircle, Search, Filter } from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { readContract } from "@/lib/genlayer";
import { PROMISE_STATUS } from "@/lib/contract";

interface PromiseData {
  description: string;
  deadline: string;
  status: number;
  deposit_amount: number;
  watcher_count: number;
  protocol_owner: string;
  mode: string;
  evaluation_summary: string;
}

export function PromisesPage() {
  const [promises, setPromises] = useState<(PromiseData & { id: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const count = (await readContract("get_promise_count")) as number;
        const loaded: (PromiseData & { id: number })[] = [];
        for (let i = 0; i < count; i++) {
          try {
            const raw = (await readContract("get_promise", [String(i)])) as string;
            const data = typeof raw === "string" ? JSON.parse(raw) : raw;
            loaded.push({ ...data, id: i });
          } catch {
            // skip
          }
        }
        setPromises(loaded);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = promises.filter((p) => {
    if (filter !== "all" && p.status !== parseInt(filter)) return false;
    if (search && !p.description.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <PageTransition>
    <div className="pb-16">
      <PageHeader
        title="Promises"
        description="Browse all on-chain protocol promises"
      >
        <Link to="/create-promise">
          <Button variant="glow" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Promise
          </Button>
        </Link>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search promises..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="0">Active</TabsTrigger>
              <TabsTrigger value="1">Kept</TabsTrigger>
              <TabsTrigger value="2">Broken</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {search || filter !== "all"
                  ? "No promises match your filters"
                  : "No promises created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((promise) => {
              const status = PROMISE_STATUS[promise.status] ?? PROMISE_STATUS[0];
              return (
                <Link key={promise.id} to={`/promises/${promise.id}`}>
                  <Card className="bg-card/50 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full animate-fade-in">
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
                        >
                          {status.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{promise.id}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 mb-3">
                        {promise.description}
                      </p>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {promise.watcher_count} watchers
                        </span>
                        <span>{promise.deadline}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          {promise.mode}
                        </Badge>
                        <span className="font-mono">
                          {promise.deposit_amount} wei
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
