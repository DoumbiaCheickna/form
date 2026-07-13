import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/IBS_NOIR.png" alt="IIBS" className="h-8" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                Institut Informatique Business School
              </h1>
              <p className="text-xs text-slate-500">
                Évaluation des Enseignements
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isAdmin
                  ? "bg-[var(--color-primary)] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Formulaire
            </Link>
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isAdmin
                  ? "bg-[var(--color-primary)] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tableau de bord
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
