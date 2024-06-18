import React from "react";
import { TrashIcon } from "@heroicons/react/outline";

const Preview = ({ images, onRemove, styles, onStyleChange }) => {
  return (
    <div className="max-w-[70rem] mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Preview ${index}`}
              className="mb-4 w-full h-full rounded-lg transition-transform transform group-hover:scale-105"
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-white border border-black text-black p-1 rounded-full hover:bg-gray-100 transition"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;
