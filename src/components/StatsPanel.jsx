import { useState, useEffect, useRef, useMemo } from "react";
import { Pie, Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler
);

const PIE_COLORS = ["#FF6384", "#FFCE56", "#36A2EB"];
const BAR_COLORS = ["#36A2EB", "#FF9800", "#4CAF50", "#9C27B0", "#FF6384", "#FFCE56", "#00BCD4", "#E91E63"];
const LEVEL_LABELS = { L1: "L1 - Licence 1", L2: "L2 - Licence 2", L3: "L3 - Licence 3" };
const LEVEL_SEMESTERS = { L1: ["S1", "S2"], L2: ["S3", "S4"], L3: ["S5", "S6"] };

function getScore(data) {
  const total = data.A + data.B + data.C;
  return total ? +((data.C * 3 + data.B * 2 + data.A * 1) / total).toFixed(2) : 0;
}

function getAppreciation(score) {
  if (score >= 2.5) return "Tres bon";
  if (score >= 1.5) return "Bon";
  return "Peut mieux faire";
}

function getAppreciationColor(score) {
  if (score >= 2.5) return "text-emerald-600 bg-emerald-50";
  if (score >= 1.5) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function getNiveau(classe) {
  const m = classe.match(/(L\d)/i);
  return m ? m[1] : "Autre";
}

function getFiliere(classe) {
  const m = classe.match(/L\d\s+(.+)/i);
  if (!m) return "Autre";
  const f = m[1].trim();
  return /GL|Data IA|DWM|CS|MPG|AD|MCD/i.test(f) ? "Informatique" : "Gestion";
}

function sumData(a, b) {
  return { A: a.A + b.A, B: a.B + b.B, C: a.C + b.C };
}

function emptyData() {
  return { A: 0, B: 0, C: 0 };
}

function analyze(evaluations) {
  const global = emptyData();
  const byTeacher = {};
  const teacherSet = new Set();
  const comments = [];
  const byClass = {};
  const byFiliere = {};
  const byNiveau = {};
  const bySemester = {};
  const byLevelSemester = {};

  evaluations.forEach((ev) => {
    if (ev.commentaires) comments.push(ev.commentaires);
    const sem = ev.semester || "S?";
    const niv = getNiveau(ev.classe || "");
    const fil = getFiliere(ev.classe || "");
    const cls = ev.classe || "Inconnue";

    if (!bySemester[sem]) bySemester[sem] = emptyData();
    if (!byLevelSemester[niv]) byLevelSemester[niv] = {};
    if (!byLevelSemester[niv][sem]) byLevelSemester[niv][sem] = emptyData();
    if (!byClass[cls]) byClass[cls] = emptyData();
    if (!byFiliere[fil]) byFiliere[fil] = emptyData();
    if (!byNiveau[niv]) byNiveau[niv] = emptyData();

    Object.entries(ev.reponses || {}).forEach(([key, val]) => {
      if (!val) return;
      const [prof] = key.split(/_(q\d+)/i);
      if (!byTeacher[prof]) byTeacher[prof] = emptyData();
      byTeacher[prof][val]++;
      global[val]++;
      byClass[cls][val]++;
      byFiliere[fil][val]++;
      byNiveau[niv][val]++;
      bySemester[sem][val]++;
      byLevelSemester[niv][sem][val]++;
      teacherSet.add(prof);
    });
  });

  const teachers = Array.from(teacherSet).sort();
  const classement = Object.entries(byTeacher)
    .map(([prof, data]) => ({ prof, score: getScore(data), data }))
    .sort((a, b) => b.score - a.score);

  return { global, byTeacher, teachers, classement, comments, byClass, byFiliere, byNiveau, bySemester, byLevelSemester };
}

function PieChart({ data, size = "normal" }) {
  const h = size === "small" ? "h-[130px] sm:h-[160px]" : "h-[180px] sm:h-[220px]";
  return (
    <div className={h}>
      <Pie
        data={{
          labels: ["Pas mal (A)", "Bon (B)", "Tres bien (C)"],
          datasets: [{ data: [data.A, data.B, data.C], backgroundColor: PIE_COLORS }],
        }}
        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { font: { size: 10 } } } } }}
      />
    </div>
  );
}

function BarChart({ labels, dataMap, options }) {
  const scores = labels.map((l) => getScore(dataMap[l] || emptyData()));
  const chartData = {
    labels,
    datasets: [{ label: "Score moyen", data: scores, backgroundColor: BAR_COLORS.slice(0, labels.length) }],
  };
  const opts = {
    scales: { y: { min: 0, max: 3, title: { display: true, text: "Score / 3" } } },
    plugins: { legend: { display: false } },
    ...options,
  };
  return (
    <div className="h-[180px] sm:h-[200px]">
      <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, ...opts }} />
    </div>
  );
}

function WordCloudCanvas({ comments }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function draw() {
      const WordCloud = (await import("wordcloud2")).default;
      if (cancelled || !canvasRef.current) return;
      const text = comments.join(" ").toLowerCase();
      const words = text.replace(/[.,;:!?()\-""''[\]{}]/g, " ").split(/\s+/).filter((w) => w.length > 3);
      const freq = {};
      words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
      const list = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 50);
      canvasRef.current.width = canvasRef.current.offsetWidth || 300;
      canvasRef.current.height = 200;
      if (list.length > 0) {
        WordCloud(canvasRef.current, { list, gridSize: 8, weightFactor: 6, backgroundColor: "#fff", color: "#004080", rotateRatio: 0.2, fontFamily: "Inter, Arial" });
      }
    }
    draw();
    return () => { cancelled = true; };
  }, [comments]);
  return <canvas ref={canvasRef} className="w-full h-[200px]" />;
}

function ScoreBadge({ score }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${getAppreciationColor(score)}`}>
      {getAppreciation(score)} — {score}/3
    </span>
  );
}

function LevelSection({ level, levelEvals, stats }) {
  const semesters = LEVEL_SEMESTERS[level];
  const semStats = semesters.map((s) => ({
    sem: s,
    data: stats.byLevelSemester[level]?.[s] || emptyData(),
    evals: levelEvals.filter((e) => e.semester === s),
  }));

  const classes = [...new Set(levelEvals.map((e) => e.classe))].sort();
  const classDataMap = {};
  classes.forEach((c) => {
    classDataMap[c] = emptyData();
    levelEvals.filter((e) => e.classe === c).forEach((e) => {
      Object.values(e.reponses || {}).forEach((v) => {
        if (v) classDataMap[c][v]++;
      });
    });
  });

  const filiereMap = {};
  levelEvals.forEach((e) => {
    const f = getFiliere(e.classe || "");
    if (!filiereMap[f]) filiereMap[f] = emptyData();
    Object.values(e.reponses || {}).forEach((v) => {
      if (v) filiereMap[f][v]++;
    });
  });

  const levelScore = getScore(semStats.reduce((acc, s) => sumData(acc, s.data), emptyData()));

  const teachersInLevel = {};
  levelEvals.forEach((e) => {
    Object.entries(e.reponses || {}).forEach(([key, val]) => {
      if (!val) return;
      const [prof] = key.split(/_(q\d+)/i);
      if (!teachersInLevel[prof]) teachersInLevel[prof] = emptyData();
      teachersInLevel[prof][val]++;
    });
  });
  const levelClassement = Object.entries(teachersInLevel)
    .map(([prof, data]) => ({ prof, score: getScore(data), data }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">{LEVEL_LABELS[level]}</h3>
        <ScoreBadge score={levelScore} />
      </div>

      {/* Semestres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {semStats.map(({ sem, data }) => (
          <div key={sem} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700">{sem}</h4>
              <span className="text-xs text-slate-400">{data.A + data.B + data.C} reponses</span>
            </div>
            <PieChart data={data} size="small" />
            <ScoreBadge score={getScore(data)} />
          </div>
        ))}
      </div>

      {/* Par classe */}
      {classes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Par classe</h4>
          <BarChart labels={classes} dataMap={classDataMap} />
        </div>
      )}

      {/* Par filiere */}
      {Object.keys(filiereMap).length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Par filiere</h4>
          <BarChart labels={Object.keys(filiereMap)} dataMap={filiereMap} />
        </div>
      )}

      {/* Top enseignants du niveau */}
      {levelClassement.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
            Enseignants ({levelClassement.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {levelClassement.map((t, i) => (
              <div key={t.prof} className="bg-white rounded-lg border border-slate-100 p-3 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 shrink-0">#{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 truncate">{t.prof}</p>
                  <p className="text-sm font-bold text-slate-800">{t.score}/3</p>
                </div>
                <ScoreBadge score={t.score} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatsPanel({ evaluations }) {
  const [activeLevel, setActiveLevel] = useState("all");
  const [profSelect, setProfSelect] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => analyze(evaluations), [evaluations]);
  const globalScore = getScore(stats.global);

  const filteredEvals = useMemo(() => {
    if (activeLevel === "all") return evaluations;
    return evaluations.filter((e) => getNiveau(e.classe || "") === activeLevel);
  }, [evaluations, activeLevel]);

  const filteredStats = useMemo(() => analyze(filteredEvals), [filteredEvals]);

  const profNF = useMemo(() => {
    if (!profSelect) return {};
    const map = {};
    filteredEvals.forEach((ev) => {
      const classe = ev.classe || "";
      const niveau = getNiveau(classe);
      const m = classe.match(/L\d\s+(.+)/i);
      const filiere = m ? m[1].trim() : "Autre";
      Object.entries(ev.reponses || {}).forEach(([key, val]) => {
        if (!val) return;
        const [p] = key.split(/_(q\d+)/i);
        if (p !== profSelect) return;
        const cle = `${niveau} - ${filiere}`;
        if (!map[cle]) map[cle] = emptyData();
        map[cle][val]++;
      });
    });
    return map;
  }, [filteredEvals, profSelect]);

  const radarData = useMemo(() => {
    const labels = Object.keys(profNF);
    const scores = labels.map((l) => getScore(profNF[l]));
    return {
      labels,
      datasets: [{ label: profSelect, data: scores, backgroundColor: "rgba(54,162,235,0.3)", borderColor: "#36A2EB", borderWidth: 2 }],
    };
  }, [profNF, profSelect]);

  const barOpts = { scales: { y: { min: 0, max: 3, title: { display: true, text: "Score / 3" } } }, plugins: { legend: { display: false } } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Statistiques des Evaluations</h2>
          <p className="text-sm text-slate-400 mt-1">
            {evaluations.length} reponses — {stats.teachers.length} enseignants
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all duration-200 border border-white/10 cursor-pointer"
        >
          Dashboard Global
        </button>
      </div>

      {/* Niveau tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "L1", "L2", "L3"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setActiveLevel(lvl)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeLevel === lvl
                ? "bg-white text-[var(--color-primary)] shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {lvl === "all" ? "Tous les niveaux" : lvl}
          </button>
        ))}
      </div>

      {/* Stats globales rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(stats.byNiveau).map(([niv, data]) => (
          <div key={niv} className="bg-white/95 rounded-xl p-3 text-center border border-white/20 shadow-sm">
            <p className="text-xs font-bold text-slate-500">{niv}</p>
            <p className="text-lg font-bold text-slate-800">{getScore(data)}/3</p>
            <p className="text-xs text-slate-400">{data.A + data.B + data.C} reponses</p>
          </div>
        ))}
      </div>

      {/* Content based on active level */}
      {activeLevel === "all" ? (
        <>
          {/* Global */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Statistique Globale</h3>
              <ScoreBadge score={globalScore} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Repartition A/B/C</h4>
                <PieChart data={stats.global} />
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Par niveau</h4>
                <BarChart labels={Object.keys(stats.byNiveau)} dataMap={stats.byNiveau} />
              </div>
            </div>
          </div>

          {/* Par semestre */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Par semestre</h3>
            <BarChart labels={Object.keys(stats.bySemester)} dataMap={stats.bySemester} />
          </div>

          {/* Par filiere */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Par filiere</h3>
            <BarChart labels={Object.keys(stats.byFiliere)} dataMap={stats.byFiliere} />
          </div>

          {/* Niveaux détaillés */}
          {["L1", "L2", "L3"].map((lvl) => {
            const levelEvals = evaluations.filter((e) => getNiveau(e.classe || "") === lvl);
            if (levelEvals.length === 0) return null;
            return <LevelSection key={lvl} level={lvl} levelEvals={levelEvals} stats={stats} />;
          })}
        </>
      ) : (
        <LevelSection
          key={activeLevel}
          level={activeLevel}
          levelEvals={evaluations.filter((e) => getNiveau(e.classe || "") === activeLevel)}
          stats={stats}
        />
      )}

      {/* Classement global */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-4">
        <h3 className="text-base font-bold text-slate-800">
          Classement des enseignants
          <span className="ml-2 text-xs font-normal text-slate-400">
            ({filteredStats.classement.length} enseignants)
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStats.classement.map((t, i) => (
            <div key={t.prof} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 shrink-0">#{i + 1}</span>
              <div className="hidden sm:block shrink-0">
                <PieChart data={t.data} size="small" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 truncate">{t.prof}</p>
                <p className="text-sm font-bold text-slate-800">{t.score}/3</p>
                <ScoreBadge score={t.score} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recherche enseignant */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-4">
        <h3 className="text-base font-bold text-slate-800">
          Appreciation d&apos;un enseignant par niveau et filiere
        </h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={profSelect}
            onChange={(e) => setProfSelect(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="">-- Choisir un enseignant --</option>
            {filteredStats.teachers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="bar">Barres</option>
            <option value="radar">Radar</option>
            <option value="pie">Camembert</option>
          </select>
        </div>
        {profSelect && Object.keys(profNF).length > 0 && (
          <div className="w-full max-w-[600px] h-[220px] sm:h-[250px]">
            {chartType === "bar" && <Bar data={{ labels: Object.keys(profNF), datasets: [{ label: "Score", data: Object.keys(profNF).map((l) => getScore(profNF[l])), backgroundColor: BAR_COLORS }] }} options={{ responsive: true, maintainAspectRatio: false, ...barOpts }} />}
            {chartType === "radar" && <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 3 } }, plugins: { legend: { display: false } } }} />}
            {chartType === "pie" && (
              <Pie data={{ labels: Object.keys(profNF), datasets: [{ data: Object.keys(profNF).map((l) => getScore(profNF[l])), backgroundColor: BAR_COLORS }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } } }} />
            )}
          </div>
        )}
        {profSelect && Object.keys(profNF).length === 0 && (
          <p className="text-sm text-slate-400">Aucune donnee pour cet enseignant.</p>
        )}
      </div>

      {/* Commentaires */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 space-y-4">
        <h3 className="text-base font-bold text-slate-800">
          Commentaires ({filteredStats.comments.length})
        </h3>
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {filteredStats.comments.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun commentaire.</p>
          ) : (
            filteredStats.comments.map((c, i) => (
              <div key={i} className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                {c}
              </div>
            ))
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Nuage de mots</h4>
          <WordCloudCanvas comments={filteredStats.comments} />
        </div>
      </div>

      {/* Modal Dashboard Global */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-2xl text-slate-400 hover:text-slate-600 cursor-pointer">&times;</button>
            <h2 className="text-lg font-bold text-slate-800 text-center">Dashboard Global de l&apos;Enseignement</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl p-3 sm:p-4 text-white">
                <p className="text-xs opacity-80">Evaluations</p>
                <p className="text-xl sm:text-2xl font-bold">{evaluations.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-3 sm:p-4 text-white">
                <p className="text-xs opacity-80">Enseignants</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.teachers.length}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-3 sm:p-4 text-white">
                <p className="text-xs opacity-80">Score global</p>
                <p className="text-xl sm:text-2xl font-bold">{globalScore}/3</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 sm:p-4 text-white">
                <p className="text-xs opacity-80">Top 3</p>
                <div className="text-xs mt-1 space-y-0.5">
                  {stats.classement.slice(0, 3).map((t) => (
                    <p key={t.prof} className="truncate">{t.prof} ({t.score})</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Repartition globale</h4>
                <PieChart data={stats.global} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Par filiere</h4>
                <BarChart labels={Object.keys(stats.byFiliere)} dataMap={stats.byFiliere} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Par niveau</h4>
                <BarChart labels={Object.keys(stats.byNiveau)} dataMap={stats.byNiveau} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Par semestre</h4>
                <BarChart labels={Object.keys(stats.bySemester)} dataMap={stats.bySemester} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
