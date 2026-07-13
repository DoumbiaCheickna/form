import { useState, useEffect, useCallback } from "react";

const images = ["/direction1.png", "/direction2.png"];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer"
        aria-label="Image précédente"
      >
        &#10094;
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer"
        aria-label="Image suivante"
      >
        &#10095;
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === current
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Aller au slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
