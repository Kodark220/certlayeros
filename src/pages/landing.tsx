import { Link } from "react-router-dom";
import {
  Eye,
  Brain,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
  Users,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition, FadeInView, motion, staggerContainer, staggerItem } from "@/components/motion";

const features = [
  {
    icon: Brain,
    title: "AI-Verified Promises",
    description:
      "Intelligent contracts use AI to autonomously evaluate whether protocols kept their promises, checking real-world data sources.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Eye,
    title: "Community Watchers",
    description:
      "Stake tokens to watch promises. Earn rewards when you help hold protocols accountable. Dual-mode: token-gated or open staking.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Star,
    title: "Reputation Scoring",
    description:
      "Every protocol gets an on-chain reputation score (0–100) that updates in real-time based on promises kept and broken.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Lock,
    title: "Deposit & Escrow",
    description:
      "Protocols lock deposits when making promises. Funds are redistributed to watchers and contributors if promises break.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Users,
    title: "Contributor Verification",
    description:
      "Community members submit evidence of being affected. Verified contributors claim a share from broken promise pools.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Globe,
    title: "Built on GenLayer",
    description:
      "Powered by GenLayer's Intelligent Contracts with non-deterministic AI operations and Optimistic Democracy consensus.",
    color: "from-indigo-500 to-blue-500",
  },
];

const stats = [
  { label: "AI Evaluations", value: "On-chain", icon: Brain },
  { label: "Watcher Reward", value: "70%", icon: TrendingUp },
  { label: "Contributor Pool", value: "30%", icon: Users },
  { label: "Network", value: "GenLayer", icon: Zap },
];

const steps = [
  {
    step: "01",
    title: "Register Your Protocol",
    description:
      "Set up your protocol identity with name, website, and token address. Start with a reputation score of 50.",
  },
  {
    step: "02",
    title: "Make Promises",
    description:
      "Create on-chain promises with deadlines, deposit funds as collateral, and set watcher reward parameters.",
  },
  {
    step: "03",
    title: "Community Watches",
    description:
      "Watchers stake tokens on active promises. When deadlines pass, AI evaluates the outcomes using real data.",
  },
  {
    step: "04",
    title: "Earn or Redistribute",
    description:
      "Kept promises boost reputation and return deposits. Broken promises reward watchers and verified contributors.",
  },
];

export function LandingPage() {
  return (
    <PageTransition>
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-[100px]" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Live on GenLayer Bradbury Testnet
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The Protocol
            <br />
            <span className="gradient-text">Accountability Layer</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Hold Web3 protocols accountable with AI-verified promises, community
            watchers, and immutable on-chain reputation scores. Trust, verified.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link to="/dashboard">
              <Button size="xl" variant="glow" className="gap-2 group">
                Launch App
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="xl" variant="outline" className="gap-2">
                Register Protocol
              </Button>
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} variants={staggerItem} className="glass rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInView className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <FileCheck className="w-3.5 h-3.5 mr-1.5" />
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need for
              <br />
              <span className="gradient-text">protocol accountability</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              A comprehensive system that combines AI evaluation, community
              governance, and economic incentives.
            </p>
          </FadeInView>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={staggerItem}>
                  <Card className="group hover:border-primary/30 transition-all duration-300 bg-card border border-border h-full">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <FadeInView className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Four steps to
              <br />
              <span className="gradient-text">trustless accountability</span>
            </h2>
          </FadeInView>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <FadeInView
                key={step.step}
                delay={i * 0.1}
              >
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary font-mono">
                      {step.step}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <FadeInView className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl border border-border p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/10" />
            <div className="relative">
              <img src="/logo.png" alt="CertLayer" className="w-12 h-12 rounded-xl mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to build trust?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
                Join the CertLayer ecosystem. Register your protocol, watch
                promises, or start contributing today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" variant="glow" className="gap-2 group">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/promises">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Explore Promises
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeInView>
      </section>
    </div>
    </PageTransition>
  );
}
