import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      onLogin(cred.user);
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6 border border-white/20">
        <div className="text-center">
          <img src="/IBS_NOIR.png" alt="IIBS" className="h-10 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Administration</h2>
          <p className="text-sm text-slate-500">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
              placeholder="admin@iibs-sn.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
