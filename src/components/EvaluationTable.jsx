import { questions, ratingLabels } from "../data/courses";

function getSlug(matiere) {
  return matiere
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 50);
}

export default function EvaluationTable({ courses, responses, onResponseChange }) {
  if (!courses.length) return null;

  return (
    <>
      {/* MOBILE / TABLET */}
      <div className="lg:hidden space-y-3">
        {/* Récap des questions — au-dessus des cartes */}
        <div className="bg-white/90 rounded-xl border border-slate-200 p-3 space-y-1 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Questions</p>
          {questions.map((q) => (
            <p key={q.id} className="text-[11px] leading-snug text-slate-600">
              <span className="font-bold text-[var(--color-primary)]">{q.id}</span>{" "}
              {q.text}
            </p>
          ))}
        </div>

        {/* Cartes par matière */}
        {courses.map((cours, idx) => {
          const slug = getSlug(cours.matiere);
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm"
            >
              <p className="font-semibold text-slate-800 text-sm leading-tight mb-2.5">{cours.matiere}</p>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q) => {
                  const name = `${slug}_${q.id.toLowerCase()}`;
                  const value = responses[name] || "";
                  return (
                    <div key={q.id} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{q.id}</span>
                      <select
                        name={name}
                        value={value}
                        onChange={(e) => onResponseChange(name, e.target.value)}
                        className={`w-full px-1 py-2 rounded-lg text-xs font-bold border-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer min-h-[40px] ${
                          value === ""
                            ? "border-red-200 bg-red-50/50"
                            : value === "A"
                            ? "border-red-200 bg-red-50 text-red-600"
                            : value === "B"
                            ? "border-amber-200 bg-amber-50 text-amber-600"
                            : "border-emerald-200 bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        <option value="">--</option>
                        {Object.entries(ratingLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {key} ({label})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP: Table */}
      <div className="hidden lg:block space-y-4">
        <div className="bg-white/90 rounded-xl border border-slate-200 p-4 space-y-1 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Questions</p>
          {questions.map((q) => (
            <p key={q.id} className="text-xs leading-snug text-slate-600">
              <span className="font-bold text-[var(--color-primary)]">{q.id}</span>{" "}
              {q.text}
            </p>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]">
              <th className="px-4 py-3 text-left text-white font-semibold rounded-tl-2xl">
                Matière
              </th>
              <th className="px-4 py-3 text-left text-white font-semibold">
                Professeur
              </th>
              {questions.map((q) => (
                <th
                  key={q.id}
                  className="px-2 py-3 text-center text-white font-semibold min-w-[80px]"
                >
                  {q.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((cours, idx) => {
              const slug = getSlug(cours.matiere);
              return (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-blue-50/50 transition-colors duration-150`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800 border-b border-slate-100">
                    {cours.matiere}
                  </td>
                  <td className="px-4 py-3 text-slate-600 border-b border-slate-100">
                    {cours.prof}
                  </td>
                  {questions.map((q) => {
                    const name = `${slug}_${q.id.toLowerCase()}`;
                    const value = responses[name] || "";
                    return (
                      <td
                        key={q.id}
                        className="px-2 py-2 text-center border-b border-slate-100"
                      >
                        <select
                          name={name}
                          value={value}
                          onChange={(e) => onResponseChange(name, e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg text-center text-sm font-bold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer ${
                            value === ""
                              ? "border-red-200 bg-red-50/50"
                              : value === "A"
                              ? "border-red-200 bg-red-50 text-red-600"
                              : value === "B"
                              ? "border-amber-200 bg-amber-50 text-amber-600"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          <option value="">--</option>
                          {Object.entries(ratingLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {key} ({label})
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
