import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { academicData, getAcademicYear, getSemester, getSemestersForPeriod, getClassesForSemester } from "../data/courses";
import StatsPanel from "../components/StatsPanel";

function StatCard({ label, value, color = "from-[var(--color-primary)] to-[var(--color-primary-dark)]" }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-2.5 sm:p-4 text-white shadow-lg`}>
      <p className="text-[10px] sm:text-xs font-medium opacity-80 truncate">{label}</p>
      <p className="text-lg sm:text-2xl sm:text-3xl font-bold">{value}</p>
    </div>
  );
}

function BarChart({ data, maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600 w-20 text-right truncate">{d.label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full rounded-full ${d.color || "bg-[var(--color-primary)]"} transition-all duration-500`}
              style={{ width: `${max > 0 ? (d.value / max) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 w-8 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(getAcademicYear());
  const [filterSemester, setFilterSemester] = useState(getSemester());
  const [filterClass, setFilterClass] = useState("");
  const [activeTab, setActiveTab] = useState("stats");
  const [formEnabled, setFormEnabled] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "form"));
        if (snap.exists()) {
          setFormEnabled(snap.data().enabled ?? true);
        }
      } catch (err) {
        console.error("Erreur chargement settings :", err);
      }
    };
    fetchSettings();
  }, []);

  const toggleForm = async () => {
    setToggling(true);
    try {
      const newValue = !formEnabled;
      await setDoc(doc(db, "settings", "form"), { enabled: newValue });
      setFormEnabled(newValue);
    } catch (err) {
      console.error("Erreur toggle formulaire :", err);
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "evaluations"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    const periodSems = getSemestersForPeriod(filterSemester);
    if (!periodSems.includes(ev.semester)) return false;
    if (filterClass && ev.classe !== filterClass) return false;
    return true;
  });

  const classList = getClassesForSemester(filterYear, filterSemester);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const totalAll = evaluations.length;
  const yearEvals = evaluations.filter((e) => e.academicYear === filterYear);
  const totalYear = yearEvals.length;
  const totalFiltered = filtered.length;
  const uniqueClasses = new Set(yearEvals.map((e) => e.classe)).size;

  const semesters = ["S1", "S2"];
  const semStats = semesters.map((s) => ({
    label: s,
    value: yearEvals.filter((e) => getSemestersForPeriod(s).includes(e.semester)).length,
    color: s === filterSemester ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]",
  }));

  const classStats = classList.map((c) => ({
    label: c,
    value: filtered.filter((e) => e.classe === c).length,
    color: c === filterClass ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]",
  }));

  const allYears = Object.keys(academicData);
  const yearStats = allYears.map((y) => ({
    label: y,
    value: evaluations.filter((e) => e.academicYear === y).length,
    color: y === filterYear ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]",
  }));

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold text-white">Tableau de bord</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 truncate">
              Connecte en tant que {user.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={toggleForm}
              disabled={toggling}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                formEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30"
              } disabled:opacity-50`}
            >
              {formEnabled ? "Formulaire actif" : "Formulaire desactive"}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border border-white/10 cursor-pointer"
            >
              Deconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "stats"
                ? "bg-white text-[var(--color-primary)] shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab("evals")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "evals"
                ? "bg-white text-[var(--color-primary)] shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Evaluations
          </button>
        </div>

        {activeTab === "stats" && (
          loading ? (
            <div className="text-center py-20 text-white/60">
              <svg className="animate-spin h-8 w-8 mx-auto mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Chargement des statistiques...
            </div>
          ) : (
            <StatsPanel evaluations={evaluations} />
          )
        )}

        {activeTab === "evals" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 sm:gap-4">
              <StatCard label="Total general" value={totalAll} />
              <StatCard label={`Annee ${filterYear}`} value={totalYear} color="from-emerald-600 to-emerald-700" />
              <StatCard label={`${filterSemester} - ${filterYear}`} value={totalFiltered} color="from-amber-500 to-amber-600" />
              <StatCard label="Classes actives" value={uniqueClasses} color="from-purple-500 to-purple-600" />
            </div>

            {/* Filters */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Annee
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                  >
                    {allYears.map((y) => (
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
                    {semesters.map((s) => (
                      <option key={s} value={s}>{s === "S1" ? "Semestre 1" : "Semestre 2"}</option>
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
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Evaluations par annee</h3>
                <BarChart data={yearStats} />
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Par semestre - {filterYear}
                </h3>
                <BarChart data={semStats} />
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Par classe - {filterSemester} {filterYear}
                  {filterClass && (
                    <span className="ml-2 text-[var(--color-primary)]">({filterClass})</span>
                  )}
                </h3>
                {classStats.length > 0 ? (
                  <BarChart data={classStats} />
                ) : (
                  <p className="text-sm text-slate-400">Aucune classe disponible pour ce semestre.</p>
                )}
              </div>
            </div>

            {/* Evaluations list */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Evaluations recentes
                <span className="ml-2 text-sm font-normal text-slate-400">({totalFiltered})</span>
              </h2>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-lg font-medium">Aucune evaluation</p>
                  <p className="text-sm">pour les filtres selectionnes.</p>
                </div>
              ) : (
                <>
                  <div className="lg:hidden space-y-3">
                    {filtered.map((ev) => (
                      <div key={ev.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 text-sm">{ev.classe}</span>
                          <span className="text-xs text-slate-400">
                            {ev.timestamp?.toDate?.()
                              ? ev.timestamp.toDate().toLocaleDateString("fr-FR")
                              : "—"}
                          </span>
                        </div>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>{ev.academicYear}</span>
                          <span>•</span>
                          <span>{ev.semester}</span>
                        </div>
                        {ev.commentaires && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.commentaires}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Classe</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Annee</th>
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
