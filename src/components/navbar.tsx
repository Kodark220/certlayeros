import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Wallet,
  ExternalLink,
  Menu,
  X,
  LogOut,
  LogIn,
  Eye,
  Crown,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NETWORKS, type NetworkId } from "@/lib/contract";
import { useNetwork } from "@/contexts/network-context";
import { useAuth } from "@/contexts/auth-context";
import { useRole } from "@/hooks/use-role";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { role } = useRole();
  const { networkId, network, switchNetwork } = useNetwork();

  const navItems = !user
    ? [{ to: "/promises", label: "Promises", icon: FileText }]
    : role === "admin"
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/promises", label: "Promises", icon: FileText },
        { to: "/create-promise", label: "Create Promise", icon: PlusCircle },
        { to: "/withdraw", label: "Withdraw", icon: Wallet },
      ]
    : role === "protocol"
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/promises", label: "Promises", icon: FileText },
        { to: "/create-promise", label: "Create Promise", icon: PlusCircle },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/promises", label: "Promises", icon: FileText },
      ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const displayAddr = user?.address || "";
  const truncatedAddr = displayAddr
    ? `${displayAddr.slice(0, 6)}...${displayAddr.slice(-4)}`
    : null;

  const roleBadge = role === "admin"
    ? { label: "Admin", className: "bg-red-50 text-red-600 border-red-200" }
    : role === "protocol"
    ? { label: "Protocol", className: "bg-primary/10 text-primary border-primary/20" }
    : role === "watcher"
    ? { label: "Watcher", className: "bg-blue-50 text-blue-600 border-blue-200" }
    : null;

  const showFullNav = !!user || location.pathname !== "/login";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="CertLayer" className="w-9 h-9 rounded-lg" />
            <span className="text-lg font-bold tracking-tight">
              Cert<span className="text-primary">Layer</span>
            </span>
          </Link>

          {/* Desktop Nav - only on select-role */}
          {showFullNav && (
            <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 text-muted-foreground hover:text-foreground",
                      active && "text-foreground bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {showFullNav && (
              <div className="flex items-center gap-2">
                <select
                  value={networkId}
                  onChange={(e) => { switchNetwork(e.target.value as NetworkId); }}
                  className="text-xs bg-secondary/50 border border-border rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.values(NETWORKS).map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <a
                  href={network.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-glow" />
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                {showFullNav && roleBadge && (
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleBadge.className)}>
                    {roleBadge.label}
                  </Badge>
                )}
                <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  {truncatedAddr}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-muted-foreground hover:text-red-600"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-1.5 ml-2">
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          {showFullNav && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-border animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-muted-foreground",
                      active && "text-foreground bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-border">
              <div className="px-4 py-2">
                <select
                  value={networkId}
                  onChange={(e) => { switchNetwork(e.target.value as NetworkId); }}
                  className="w-full text-sm bg-secondary/50 border border-border rounded-md px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.values(NETWORKS).map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <a
                href={network.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {network.name}
                <ExternalLink className="w-3 h-3" />
              </a>
              {user ? (
                <div className="px-4 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-muted-foreground">{truncatedAddr}</p>
                    {roleBadge && (
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleBadge.className)}>
                        {roleBadge.label}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground mt-1">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
