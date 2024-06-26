import React, { useMemo } from "react";
import { CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/solid";
import { useSpring, animated } from "@react-spring/web";

const Breadcrumb = ({ currentStep, onGoBack, totalSteps }) => {
  const steps = useMemo(
    () => [
      { id: 1, name: "Prepare Model & Upload Images" },
      { id: 2, name: "Generate Training Model" },
      { id: 3, name: "Summary" },
    ],
    []
  );

  const [props, api] = useSpring(
    () => ({
      from: { width: "0%" },
      to: { width: `${(currentStep / totalSteps) * 100}%` },
    }),
    [currentStep]
  );

  return (
    <div className="w-full mb-10 hidden customBreakpoint:flex flex-col items-center">
      <div className="flex flex-col items-center w-full max-w-4xl">
        <nav aria-label="Progress" className="w-full">
          <ol className="flex items-center justify-center">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <li key={step.name} className="flex items-center">
                  <animated.div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full border-4 transition-transform transform hover:scale-105 ${
                      isActive
                        ? "bg-purple-500 border-purple-500 text-white"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-gray-300 border-gray-300 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text- font-sans font-semibold">
                        {step.id}
                      </span>
                    )}
                  </animated.div>
                  <span
                    className={`ml-2 text-base text-center font-semibold ${
                      isActive
                        ? "text-purple-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index !== steps.length - 1 && (
                    <svg
                      className="w-6 h-6 text-gray-300 ml-2 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ol>
          {currentStep > 1 && (
            <button
              onClick={onGoBack}
              className="mt-4 flex items-start ml-[6.25rem] text-purple-500 hover:text-purple-600 transition"
            >
              <ArrowLeftIcon className="w-6 h-6 mr-2" />
              Go Back
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
