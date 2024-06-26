import React, { useMemo, useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { ArrowLeftIcon } from "@heroicons/react/solid";

const ProgressIndicator = ({ currentStep, onGoBack }) => {
  const steps = useMemo(
    () => [
      { id: 1, name: "Prepare Model & Upload Images" },
      { id: 2, name: "Generate Training Model" },
      { id: 3, name: "Summary" },
    ],
    []
  );

  const totalSteps = steps.length;
  const [prevStep, setPrevStep] = useState(currentStep);

  const progress = (currentStep / totalSteps) * 100;

  const props = useSpring({
    width: `${progress}%`,
    config: { duration: 800 },
    immediate: prevStep > currentStep, // Immediate update if going backwards
  });

  useEffect(() => {
    setPrevStep(currentStep);
  }, [currentStep]);

  return (
    <div className="w-full customBreakpoint:hidden mt-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        {currentStep > 1 && (
          <button
            onClick={onGoBack}
            className="flex items-center text-purple-500 hover:text-purple-600 transition"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-2" />
            Go Back
          </button>
        )}
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="relative w-full bg-gray-300 h-8 rounded-full overflow-hidden">
        <animated.div
          style={props}
          className="absolute top-0 left-0 h-full bg-purple-500 transition-all"
        />
      </div>
      <div className="flex justify-end mt-2 text-sm text-gray-600">
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
