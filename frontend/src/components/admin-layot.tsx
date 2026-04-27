import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { LayoutDashboard, Users, Hotel, BedDouble, BookOpen, ChevronRight, LogOut, ArrowLeft, Tag } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/hotels", label: "Hotels", icon: Hotel },
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      navigate("/login");
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[hsl(222,47%,11%)] text-white flex flex-col fixed h-full z-30">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Hotel className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>LuxStay</span>
          </div>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-amber-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
                  <Icon className="w-4 h-4" />
                  {label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-all mb-1">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all w-full text-left">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        <div className="bg-white border-b border-border px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
