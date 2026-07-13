export default function ThankYouModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Merci !</h3>
        <p className="text-slate-500 mb-6">
          Votre évaluation a bien été enregistrée. Merci pour votre
          participation !
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
