import React from "react";

import testImage1 from "../assets/images/testImage1.jpg";
import testImage2 from "../assets/images/testImage2.jpg";
import testImage3 from "../assets/images/testImage3.jpg";

const Introduction = ({ onNext }) => {
  const sampleImages = [testImage1, testImage2, testImage3];

  return (
    <div className="text-center bg-white shadow-lg p-6 max-w-4xl rounded-2xl mx-auto">
      <h2 className="text-5xl text-gray-700 font-bold font-sans mt-2 mb-4">
        Welcome to Headshot Pro
      </h2>
      <div className="w-full flex justify-center items-center">
        <p className="text-gray-500 mb-10 font-sans text-sm w-[80%] text-center leading-5">
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
        className="bg-purple-500 hover:bg-purple-600 text-white w-full  py-2 px-4 font-sans font-bold rounded-2xl hover:to-purple-700 transition mt-2 mb-2"
      >
        Get Started
      </button>
    </div>
  );
};

export default Introduction;
