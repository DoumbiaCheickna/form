import { useState, useCallback, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  getAcademicYear,
  getSemester,
  getCoursesForClass,
  getSemestersForPeriod,
} from "../data/courses";
import Carousel from "../components/Carousel";
import ClassSelector from "../components/ClassSelector";
import EvaluationTable from "../components/EvaluationTable";
import ThankYouModal from "../components/ThankYouModal";
import Toast from "../components/Toast";

export default function StudentForm() {
  const academicYear = getAcademicYear();
  const semester = getSemester();

  const [formEnabled, setFormEnabled] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [responses, setResponses] = useState({});
  const [commentaires, setCommentaires] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "form"));
        if (snap.exists()) {
          setFormEnabled(snap.data().enabled ?? true);
        }
      } catch {
        setFormEnabled(true);
      }
    };
    fetchSettings();
  }, []);

  const courses = getCoursesForClass(academicYear, semester, selectedClass);

  const handleResponseChange = useCallback((name, value) => {
    setResponses((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass) {
      setToast({ message: "Veuillez sélectionner une classe.", type: "error" });
      return;
    }

    if (!courses.length) {
      setToast({ message: "Aucun cours trouvé pour cette classe.", type: "error" });
      return;
    }

    const totalSelects = courses.length * 8;
    const answeredCount = Object.values(responses).filter((v) => v !== "").length;

    if (answeredCount < totalSelects) {
      setToast({
        message: "Merci de répondre à toutes les questions avant de soumettre.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "evaluations"), {
        academicYear,
        semester: getSemestersForPeriod(semester).find((s) => {
          const match = selectedClass.match(/L(\d)/i);
          if (!match) return false;
          const level = parseInt(match[1], 10);
          return s === `S${(level - 1) * 2 + (semester === "S2" ? 2 : 1)}`;
        }) || semester,
        classe: selectedClass,
        commentaires: commentaires.trim(),
        reponses: responses,
        timestamp: serverTimestamp(),
      });
      setShowModal(true);
      setSelectedClass("");
      setResponses({});
      setCommentaires("");
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      setToast({
        message: "Erreur lors de l'envoi. Veuillez réessayer.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!formEnabled) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-white/20 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Formulaire désactivé</h2>
          <p className="text-slate-500 text-sm">
            Le formulaire d'évaluation n'est pas disponible pour le moment. Veuillez revenir plus tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-300">
              Année {academicYear} — {semester}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Questionnaire d'Évaluation
            <br />
            <span className="text-[var(--color-accent)]">des Enseignements</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Votre évaluation nous aide à améliorer la qualité de l'enseignement.
            Merci de répondre à toutes les questions.
          </p>
        </div>

        <div className="hidden sm:block">
          <Carousel />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-white/20"
        >
          <ClassSelector
            academicYear={academicYear}
            semester={semester}
            selectedClass={selectedClass}
            onClassChange={(val) => {
              setSelectedClass(val);
              setResponses({});
            }}
          />

          {selectedClass && courses.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Évaluation — {selectedClass}
                </h2>
                <span className="text-xs text-slate-400">
                  {courses.length} matière{courses.length > 1 ? "s" : ""} • 8 questions chacune
                </span>
              </div>
              <EvaluationTable
                courses={courses}
                responses={responses}
                onResponseChange={handleResponseChange}
              />
            </div>
          )}

          {selectedClass && courses.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg font-medium">Aucun cours disponible</p>
              <p className="text-sm">pour cette classe ce semestre.</p>
            </div>
          )}

          {selectedClass && courses.length > 0 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="commentaires"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Commentaires
                </label>
                <textarea
                  id="commentaires"
                  value={commentaires}
                  onChange={(e) => setCommentaires(e.target.value)}
                  rows={4}
                  placeholder="Vos remarques ici..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 resize-y"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    "Envoyer"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <ThankYouModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
