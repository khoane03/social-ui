import { useState } from "react";
import { ImageModal } from "../common/ImageModal";

export const Images = ({ imgs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (!imgs || imgs.length === 0) return null;

  const openModal = (index) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const renderSingle = () => (
    <div className="mt-3 rounded-xl overflow-hidden bg-black/5 dark:bg-black">
      <img
        src={imgs[0]}
        alt="post"
        className="w-full max-h-[500px] object-cover cursor-pointer transition hover:brightness-95"
        onClick={() => openModal(0)}
      />
    </div>
  );

  const renderTwo = () => (
    <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-black/5 dark:bg-black">
      {imgs.slice(0, 2).map((img, i) => (
        <button
          key={i}
          type="button"
          className="relative aspect-[4/5] overflow-hidden"
          onClick={() => openModal(i)}
        >
          <img
            src={img}
            alt={`post-${i}`}
            className="w-full h-full object-cover cursor-pointer transition hover:scale-[1.02]"
          />
        </button>
      ))}
    </div>
  );

  const renderThree = () => (
    <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-black/5 dark:bg-black">
      <button
        type="button"
        className="relative col-span-2 aspect-video overflow-hidden"
        onClick={() => openModal(0)}
      >
        <img
          src={imgs[0]}
          alt="post-0"
          className="w-full h-full object-cover cursor-pointer transition hover:scale-[1.02]"
        />
      </button>
      {imgs.slice(1, 3).map((img, i) => (
        <button
          key={i + 1}
          type="button"
          className="relative aspect-square overflow-hidden"
          onClick={() => openModal(i + 1)}
        >
          <img
            src={img}
            alt={`post-${i + 1}`}
            className="w-full h-full object-cover cursor-pointer transition hover:scale-[1.02]"
          />
        </button>
      ))}
    </div>
  );

  const renderMany = () => {
    const shown = imgs.slice(0, 4);         // chỉ render tối đa 4 ảnh
    const moreCount = imgs.length - 4;

    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-black/5 dark:bg-black">
        {shown.map((img, i) => {
          const isLast = i === 3 && moreCount > 0;
          return (
            <button
              key={i}
              type="button"
              className={`relative overflow-hidden ${
                i === 0 ? "col-span-2 aspect-video" : "aspect-square"
              }`}
              // important: index theo mảng gốc, không phải `shown`
              onClick={() => openModal(i)}
            >
              <img
                src={img}
                alt={`post-${i}`}
                className="w-full h-full object-cover cursor-pointer transition hover:scale-[1.02]"
              />
              {isLast && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    +{moreCount}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const count = imgs.length;
  let content;
  if (count === 1) content = renderSingle();
  else if (count === 2) content = renderTwo();
  else if (count === 3) content = renderThree();
  else content = renderMany();

  return (
    <>
      {content}
      <ImageModal
        // CHỈNH: truyền cả list + index để modal xem hết ảnh
        images={imgs}
        currentIndex={modalIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};