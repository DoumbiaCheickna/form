import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { academicData, questions, getAcademicYear, getSemester } from "../data/courses";

export default function AdminDashboard({ user }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(getAcademicYear());
  const [filterSemester, setFilterSemester] = useState(getSemester());
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "evaluations"),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvaluations(data);
      } catch (err) {
        console.error("Erreur chargement :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const filtered = evaluations.filter((ev) => {
    if (ev.academicYear !== filterYear) return false;
    if (ev.semester !== filterSemester) return false;
    if (filterClass && ev.classe !== filterClass) return false;
    return true;
  });

  const semData = academicData[filterYear]?.[filterSemester] || {};
  const classList = Object.keys(semData);

  const stats = {
    total: filtered.length,
    uniqueClasses: [...new Set(filtered.map((e) => e.classe))].length,
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Tableau de bord
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Connecté en tant que {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all duration-200 border border-white/10 cursor-pointer"
          >
            Déconnexion
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Année
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              >
                {Object.keys(academicData).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Semestre
              </label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              >
                {Object.keys(academicData[filterYear] || {}).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Classe
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              >
                <option value="">Toutes les classes</option>
                {classList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl p-4 w-full text-white shadow-lg">
                <p className="text-xs font-medium opacity-80">Soumissions</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Évaluations récentes
          </h2>
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="animate-spin h-8 w-8 mx-auto mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg font-medium">Aucune évaluation</p>
              <p className="text-sm">pour les filtres sélectionnés.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Classe</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Année</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Semestre</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ev) => (
                    <tr key={ev.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">
                        {ev.timestamp?.toDate?.()
                          ? ev.timestamp.toDate().toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{ev.classe}</td>
                      <td className="px-4 py-3 text-slate-600">{ev.academicYear}</td>
                      <td className="px-4 py-3 text-slate-600">{ev.semester}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {ev.commentaires || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
