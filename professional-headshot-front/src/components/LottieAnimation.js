import React, { useState, useEffect } from "react";
import Lottie from "react-lottie-player";
import animationData from "../assets/lottie/reveal-loading.json"; // Replace with your Lottie JSON file path

const LottieAnimation = ({ countdown, description }) => {
  const [remainingTime, setRemainingTime] = useState(countdown);

  useEffect(() => {
    setRemainingTime(countdown); // Reset remaining time when countdown prop changes
  }, [countdown]);

  useEffect(() => {
    if (remainingTime <= 0) return;

    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [remainingTime]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${
      seconds !== 1 ? "s" : ""
    }`;
  };

  return (
    <div className="flex flex-col items-center">
      <Lottie
        loop
        animationData={animationData}
        play
        style={{ width: 200, height: 200 }}
      />
      <div className="text-2xl text-gray-700 font-semibold mt-10">
        <div className="animate-bounce">{description}</div>
        {remainingTime > 0 && (
          <div className="animate-bounce">
            This may take approximately {formatTime(remainingTime)}.
          </div>
        )}
      </div>
    </div>
  );
};

export default LottieAnimation;
