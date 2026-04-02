import { Github, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useNetwork } from "@/contexts/network-context";

export function Footer() {
  const { network } = useNetwork();
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="CertLayer" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold">
                Cert<span className="text-primary">Layer</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              The protocol accountability layer. Holding Web3 protocols accountable
              through AI-verified promises, community watchers, and on-chain
              reputation scores.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Register Protocol
                </Link>
              </li>
              <li>
                <Link to="/promises" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore Promises
                </Link>
              </li>
              <li>
                <Link to="/withdraw" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Withdraw
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`${network.explorer}/address/${network.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contract <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={network.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  GenLayer Docs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CertLayer. Built on GenLayer.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-glow" />
              Network: {network.name}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
