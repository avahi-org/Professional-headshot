import React, { useState, useEffect, useMemo } from "react";
import Lottie from "react-lottie-player";
import animationData from "../assets/lottie/reveal-loading.json";

const LottieAnimation = ({ countdown, description }) => {
  const [remainingTime, setRemainingTime] = useState(countdown);

  useEffect(() => {
    setRemainingTime(Math.max(0, countdown)); // Ensure non-negative value
  }, [countdown]);

  useEffect(() => {
    if (remainingTime <= 0) return;

    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => Math.max(0, prevTime - 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingTime]);

  const formatTime = useMemo(() => {
    if (remainingTime <= 0) return "";

    const totalSeconds = Math.floor(remainingTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

    return parts.join(", ");
  }, [remainingTime]);

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
        {formatTime && (
          <div className="animate-bounce">
            This may take approximately {formatTime}.
          </div>
        )}
      </div>
    </div>
  );
};

export default LottieAnimation;
