import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const ADMIN_EMAIL = "admin@iibs-sn.com";
const ADMIN_PASSWORD = "IIBS@2026";

export default function SetupPage() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setStatus("loading");
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      setStatus("success");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setStatus("exists");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("La création de compte par email/mot de passe n'est pas activée. Activez-la dans Firebase Console → Authentication → Sign-in method.");
        setStatus("error");
      } else {
        setError(err.message);
        setStatus("error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6 border border-white/20">
        <div className="text-center">
          <img src="/IBS_NOIR.png" alt="IIBS" className="h-10 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Configuration initiale</h2>
          <p className="text-sm text-slate-500">
            Créer le compte administrateur par défaut
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
          <p className="text-slate-600"><span className="font-semibold">Email :</span> {ADMIN_EMAIL}</p>
          <p className="text-slate-600"><span className="font-semibold">Mot de passe :</span> {ADMIN_PASSWORD}</p>
        </div>

        {status === "success" || status === "exists" ? (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-100">
            {status === "success"
              ? "Admin créé avec succès ! Vous pouvez vous connecter."
              : "Le compte admin existe déjà. Vous pouvez vous connecter."}
            <a href="/admin" className="block mt-2 text-emerald-700 underline font-bold">
              → Aller à la connexion
            </a>
          </div>
        ) : status === "error" ? (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        ) : null}

        {(status === "idle" || status === "error") && (
          <button
            onClick={handleCreate}
            disabled={status === "loading"}
            className="w-full py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {status === "loading" ? "Création en cours..." : "Créer l'admin"}
          </button>
        )}

        <p className="text-xs text-slate-400 text-center">
          Cette page est à usage unique. Supprimez-la après configuration.
        </p>
      </div>
    </div>
  );
}
