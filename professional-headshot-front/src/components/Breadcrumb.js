import React, { useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { useSprings, animated } from "@react-spring/web";

const Breadcrumb = ({ currentStep }) => {
  const steps = useMemo(
    () => [
      { id: 1, name: "Introduction" },
      { id: 2, name: "Upload & Review Images" },
      { id: 3, name: "Model Selection" },
      { id: 4, name: "Generate Training Model" },
      { id: 5, name: "Summary" },
    ],
    []
  );

  const [springs, api] = useSprings(steps.length, (index) => {
    const isActive = currentStep === steps[index].id;
    const isCompleted = currentStep > steps[index].id;
    return {
      backgroundColor: isActive ? "rgb(59 130 246)" : "rgb(229 231 235)",
      borderColor: isActive ? "rgb(59 130 246)" : "rgb(209 213 219)",
      color: isActive
        ? "rgb(255 255 255)" // White color for active step number
        : isCompleted
        ? "rgb(34 211 146)" // Green color for completed step number
        : "rgb(107 114 128)",
      config: { duration: 300 }, // Adjust duration for smoother transition
    };
  });

  React.useEffect(() => {
    api.start((index) => {
      const isActive = currentStep === steps[index].id;
      const isCompleted = currentStep > steps[index].id;
      return {
        backgroundColor: isActive ? "rgb(59 130 246)" : "rgb(229 231 235)",
        borderColor: isActive ? "rgb(59 130 246)" : "rgb(209 213 219)",
        color: isActive
          ? "rgb(255 255 255)" // White color for active step number
          : isCompleted
          ? "rgb(34 211 146)" // Green color for completed step number
          : "rgb(107 114 128)",
        config: { duration: 300 }, // Adjust duration for smoother transition
      };
    });
  }, [currentStep, api, steps]);

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const springProps = springs[index];

          return (
            <li key={step.name} className="flex items-center">
              <animated.div
                className="relative flex items-center justify-center w-10 h-10 rounded-full border-4"
                style={{
                  backgroundColor: springProps.backgroundColor,
                  borderColor: springProps.borderColor,
                  transition: "background 0.3s, border-color 0.3s",
                }}
              >
                {isCompleted ? (
                  <CheckCircleIcon
                    className="w-6 h-6 text-green-600"
                    aria-hidden="true"
                  />
                ) : (
                  <animated.span
                    className={`text-lg font-semibold ${
                      isActive ? "text-white" : "text-gray-500"
                    } font-sans`}
                    style={{ color: springProps.color }}
                  >
                    {step.id}
                  </animated.span>
                )}
              </animated.div>
              <animated.span
                className={`ml-3 text-base font-medium ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                } font-sans`}
                style={{
                  color: isCompleted
                    ? "rgb(34 211 146)"
                    : isActive
                    ? "rgb(59 130 246)"
                    : "rgb(107 114 128)",
                }}
              >
                {step.name}
              </animated.span>
              {index !== steps.length - 1 && (
                <svg
                  className="w-6 h-6 text-gray-300 ml-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
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
    </nav>
  );
};

export default Breadcrumb;
