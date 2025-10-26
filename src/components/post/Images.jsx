import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export const Images = ({ imgs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!imgs || imgs.length === 0) {
    return;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imgs.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-video dark:bg-black bg-white flex items-center justify-center rounded-xl overflow-hidden">
      <img
        src={imgs[currentIndex]}
        alt={`post-${currentIndex}`}
        className="max-h-full max-w-full object-contain transition duration-300"
      />

      {imgs.length > 1 && (
        <div className="absolute inset-0 flex justify-between items-center px-4">
          <button
            onClick={handlePrev}
            className="bg-black/40 hover:bg-black/70 text-white p-1 rounded-full transition duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="bg-black/40 hover:bg-black/70 text-white p-1 rounded-full transition duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {imgs.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {imgs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "dark:bg-white bg-black" : "bg-zinc-500 "
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
