import React from "react";

const ProgressBar = ({ progress, uploadedImages }) => {
  const getColor = () => {
    if (progress < 33) return "bg-red-500";
    if (progress < 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="relative w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden">
      <div
        className={`h-6 rounded-full transition-all duration-500 ${getColor()}`}
        style={{ width: `${progress}%` }}
      ></div>
      <div
        className="absolute top-0 left-0 font-sans right-0 bottom-0 flex items-center justify-center text-xs font-bold text-gray-700"
        style={{
          transition: "width 0.5s ease-in-out",
          whiteSpace: "nowrap",
        }}
      >
        {uploadedImages.length} / 10 images
      </div>
    </div>
  );
};

export default ProgressBar;
