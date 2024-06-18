import React from "react";
import Lottie from "react-lottie-player";
import animationData from "../assets/lottie/reveal-loading.json"; // Replace with your Lottie JSON file path

const LottieAnimation = ({ etaDuration, description }) => {
  return (
    <div className="flex flex-col items-center">
      <Lottie
        loop
        animationData={animationData}
        play
        style={{ width: 200, height: 200 }}
      />
      <div className="text-2xl text-gray-700 font-semibold mt-10">
        <div className="animate-bounce"> {description}</div>
        {etaDuration && (
          <div className="animate-bounce">
            This may take approximately {etaDuration}.
          </div>
        )}
      </div>
    </div>
  );
};

export default LottieAnimation;
