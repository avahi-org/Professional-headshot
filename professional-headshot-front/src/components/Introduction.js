import React from "react";

const Introduction = ({ onNext }) => {
  const sampleImages = [
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36", // Sample image 1
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36", // Sample image 1
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36", // Sample image 1
  ];

  return (
    <div className="text-center bg-white shadow-lg p-6 max-w-4xl rounded-2xl mx-auto">
      <h2 className="text-5xl text-gray-700 font-semibold font-inter mb-4">
        Welcome to Headshot Pro
      </h2>
      <div className="w-full flex justify-center items-center">
        <p className="text-gray-500 mb-10 font-inter text-sm w-[80%] text-center leading-5">
          In publishing and graphic design, Lorem Ipsum is a placeholder text
          commonly used to demonstrate the visual form of a document or a
          typeface without relying on meaningful content.
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {sampleImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Sample ${index}`}
            className="w-1/3 h-96 rounded-3xl shadow-md"
          />
        ))}
      </div>
      <button
        onClick={onNext}
        className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-full font-sans py-2 px-4 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition mt-4 mb-2"
      >
        Get Started
      </button>
    </div>
  );
};

export default Introduction;
