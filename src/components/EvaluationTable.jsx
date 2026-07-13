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

function QuestionSelect({ name, value, onResponseChange, questionText }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{questionText}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onResponseChange(name, e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg text-sm font-bold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer ${
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
}

export default function EvaluationTable({ courses, responses, onResponseChange }) {
  if (!courses.length) return null;

  return (
    <>
      {/* MOBILE / TABLET: Cards */}
      <div className="lg:hidden space-y-3">
        {courses.map((cours, idx) => {
          const slug = getSlug(cours.matiere);
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm"
            >
              <div className="border-b border-slate-100 pb-2">
                <p className="font-semibold text-slate-800 text-sm">{cours.matiere}</p>
                <p className="text-xs text-slate-500">{cours.prof}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions.map((q) => {
                  const name = `${slug}_${q.id.toLowerCase()}`;
                  return (
                    <QuestionSelect
                      key={q.id}
                      name={name}
                      value={responses[name] || ""}
                      onResponseChange={onResponseChange}
                      questionText={q.id}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP: Table */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-xl border border-white/10">
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
                  className="px-3 py-3 text-center text-white font-semibold min-w-[80px]"
                  title={q.text}
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
    </>
  );
}
