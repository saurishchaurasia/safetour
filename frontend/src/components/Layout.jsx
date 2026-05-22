import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Bot, ContactRound, Home, LogOut, Map, Moon, QrCode, Shield, Siren, Sparkles, Sun, UserCog } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/map", label: "Map", icon: Map },
  { to: "/sos", label: "SOS", icon: Siren },
  { to: "/recommendations", label: "Explore", icon: Sparkles },
  { to: "/tourist-id", label: "ID", icon: QrCode },
  { to: "/assistant", label: "AI", icon: Bot },
  { to: "/contacts", label: "Contacts", icon: ContactRound },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: Shield }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-black">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-safety-green text-white"><Siren size={20} /></span>
            SafeTour AI
          </Link>
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link to="/admin" className="btn-secondary hidden sm:inline-flex"><UserCog size={18} /> Admin</Link>
            )}
            <button className="btn-secondary" type="button" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn-secondary" type="button" onClick={handleLogout}><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-slate-200 p-4 dark:border-slate-800 lg:block">
          <nav className="grid gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 font-semibold ${isActive ? "bg-safety-green text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
                <Icon size={18} /> {label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 font-semibold ${isActive ? "bg-safety-green text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
                <UserCog size={18} /> Admin Panel
              </NavLink>
            )}
          </nav>
        </aside>
        <Outlet />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `grid min-w-20 place-items-center gap-1 px-2 py-2 text-xs font-semibold ${isActive ? "text-safety-green" : "text-slate-500"}`}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
