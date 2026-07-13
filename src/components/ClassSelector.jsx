import { getClassesForSemester } from "../data/courses";

export default function ClassSelector({
  academicYear,
  semester,
  selectedClass,
  onClassChange,
}) {
  const classes = getClassesForSemester(academicYear, semester);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-1 w-full">
        <label
          htmlFor="classe"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Classe
        </label>
        <select
          id="classe"
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 shadow-sm appearance-none cursor-pointer"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: "right 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
          }}
        >
          <option value="">-- Choisir une classe --</option>
          {classes.map((classe) => (
            <option key={classe} value={classe}>
              {classe}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Grille d'évaluation
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          <span className="text-red-500">A = 50%</span>
          <span className="text-amber-500">B = 75%</span>
          <span className="text-emerald-500">C = 100%</span>
        </div>
      </div>
    </div>
  );
}
