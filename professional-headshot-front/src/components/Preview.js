import React from "react";
import { TrashIcon } from "@heroicons/react/outline";

const Preview = ({ images, onRemove }) => {
  return (
    <div className="max-w-[70rem] mx-4 sm:mx-auto  bg-white shadow-lg rounded-lg p-6 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images?.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Preview ${index}`}
              className="mb-4 w-full h-96 object-cover rounded-lg transition-transform transform group-hover:scale-105"
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
