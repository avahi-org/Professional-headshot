import React, { useState, useEffect } from "react";
import Upload from "./components/Upload";
import Preview from "./components/Preview";
import Slideshow from "./components/Slideshow";
import Introduction from "./components/Introduction";
import Breadcrumb from "./components/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProgressBar from "./components/ProgressBar";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { Oval } from "react-loader-spinner";
import Select from "react-select";
import LottieAnimation from "./components/LottieAnimation";

const modelTypes = ["man", "woman"];
const prompts = ["corporate", "casual", "formal"];

const formatEta = (eta) => {
  const [hours, minutes, seconds] = eta.split(":").map(Number);
  let result = "";

  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? "s" : ""} `;
  }
  if (minutes > 0) {
    result += `${minutes} minute${minutes > 1 ? "s" : ""} `;
  }
  if (seconds > 0) {
    result += `${seconds} second${seconds > 1 ? "s" : ""}`;
  }

  return result.trim();
};

const App = () => {
  const [step, setStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [modelType, setModelType] = useState(modelTypes[0]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [trainingName, setTrainingName] = useState("");
  const [etaDuration, setEtaDuration] = useState("");

  useEffect(() => {
    let interval;
    if (isLoading && step === 3) {
      // Start loading simulation for Step 3
      simulateTraining();
    } else if (isLoading && step === 4) {
      // Start loading simulation for Step 4
      simulateGeneration();
    }

    return () => {
      clearInterval(interval); // Clean up intervals
    };
  }, [isLoading, step]);

  const simulateTraining = () => {
    setIsLoading(true);

    // Simulate API call to fetch ETA
    setTimeout(() => {
      const eta = "0:00:10"; // Replace with actual ETA fetched from API
      setEtaDuration(formatEta(eta));

      // Simulate loading time based on ETA
      const [hours, minutes, seconds] = eta.split(":").map(Number);
      const etaInSeconds = hours * 3600 + minutes * 60 + seconds;

      setTimeout(() => {
        setIsLoading(false);
        setStep(4);
        setGeneratedImages(uploadedImages); // Replace with actual generated images
        resetState();
      }, etaInSeconds * 1000);
    }, 2000); // Simulate loading time for API call
  };

  const simulateGeneration = () => {
    setIsLoading(true);

    // Simulate loading time for generating images
    setTimeout(() => {
      setIsLoading(false);
      setGeneratedImages(uploadedImages); // Replace with actual generated images
    }, 10000);

    setStep(5);
  };

  const resetState = () => {
    setModelType(modelTypes[0]); // Reset model type
    setTrainingName(""); // Reset training name
    setPrompt(""); // Reset prompt
  };

  const handleUpload = (files) => {
    const newImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemove = (index) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleModelTypeChange = (type) => {
    setModelType(type);
  };

  const handlePromptChange = (selectedOption) => {
    setPrompt(selectedOption.value);
  };

  const handleTrainingNameChange = (event) => {
    setTrainingName(event.target.value);
  };

  const handleNextStep = () => {
    switch (step) {
      case 1:
        setStep(2);
        break;
      case 2:
        if (uploadedImages.length >= 10) {
          setStep(3);
        } else {
          toast.error("Please upload at least 10 images.");
        }
        break;
      case 3:
        if (!trainingName) {
          toast.error("Please enter a training name.");
          return;
        }
        simulateTraining();
        break;
      case 4:
        simulateGeneration();
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    if (!isLoading && step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (uploadedImages.length / 10) * 100;

  const promptOptions = prompts.map((p) => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
  }));

  return (
    <div className="min-h-screen h-full max-w-[2000px] bg-cover bg-[#efefe9] flex flex-col items-center py-10 font-sans">
      <h1 className="text-5xl font-poppins font-normal text-gray-700 mb-12 mt-2">
        Professional Headshot
      </h1>

      <div className="flex flex-col items-center mb-6">
        <Breadcrumb currentStep={step} />
        {step > 1 && (
          <button
            onClick={handlePreviousStep}
            className={`bg-purple-500 self-start font-semibold text-white gap-2 p-3 rounded-full transition mt-0 flex items-center justify-center ${
              isLoading
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-purple-600"
            }`}
            disabled={isLoading}
          >
            <ArrowLeftIcon className="w-6 h-6" />
            Go Back
          </button>
        )}
      </div>
      <div className="container">
        {step === 1 && (
          <div className="card">
            <Introduction onNext={handleNextStep} />
          </div>
        )}
        {step === 2 && (
          <div className="card text-center">
            <p className="mb-4 text-xl font-sans font-semibold text-gray-700">
              Step 2: Upload 10 or more Images
            </p>
            <div className="progress-bar flex justify-center items-center mx-auto">
              <ProgressBar
                progress={progress}
                uploadedImages={uploadedImages}
              />
            </div>
            <Upload onUpload={handleUpload} />
            {uploadedImages.length > 1 && (
              <Preview images={uploadedImages} onRemove={handleRemove} />
            )}
            <div className="flex items-center justify-center mt-6">
              {uploadedImages.length >= 10 && (
                <button
                  onClick={handleNextStep}
                  className="bg-purple-500 text-white text-lg font-sans w-80 py-3 px-6 rounded-2xl font-semibold hover:bg-purple-600 transition-transform transform hover:scale-105 mt-4 mb-2"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="card text-center">
            <p className="mb-14 text-3xl font-sans font-semibold text-gray-700">
              Step 3: Model Selection
            </p>
            {isLoading ? (
              <LottieAnimation
                etaDuration={etaDuration}
                description={"Training the model..."}
              />
            ) : (
              <div className="flex flex-col items-center w-full space-y-6">
                <div className="w-full max-w-md">
                  <div className="flex flex-col items-start mb-0">
                    <label className="text-xl font-sans font-semibold text-gray-700 mb-2">
                      Training Name:
                    </label>
                    <input
                      type="text"
                      value={trainingName}
                      onChange={handleTrainingNameChange}
                      className="bg-white font-sans font-medium border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl w-full transition-transform transform hover:scale-105 hover:shadow-lg"
                    />
                  </div>
                </div>
                <div className="w-full max-w-md">
                  <div className="flex flex-col items-start mb-12">
                    <label className="text-xl font-sans font-semibold text-gray-700 mb-2">
                      Model Type:
                    </label>
                    <div className="flex space-x-4">
                      {modelTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleModelTypeChange(type)}
                          className={`py-4 px-8 font-sans font-medium text-xl rounded-lg ${
                            modelType === type
                              ? "bg-purple-500 text-white font-semibold"
                              : "bg-white border border-gray-300 text-gray-700"
                          } transition-transform transform hover:scale-105 hover:shadow-lg`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <button
                    onClick={handleNextStep}
                    className="bg-purple-500 font-sans font-semibold text-white w-full py-4 px-6 rounded-2xl hover:bg-purple-600 text-lg transition-transform transform hover:scale-105"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="card text-center">
            <p className="mb-14 text-3xl font-semibold text-gray-700">
              Step 4: Generate Training Model
            </p>
            <div className="flex flex-col items-center mb-6 w-full">
              <label className="mb-4 w-96 font-sans font-semibold text-xl text-gray-700 text-start">
                Prompt:
              </label>
              <div className="w-96 mb-4">
                <Select
                  value={promptOptions.find(
                    (option) => option.value === prompt
                  )}
                  onChange={handlePromptChange}
                  options={promptOptions}
                  placeholder="Select a prompt"
                  className="text-lg"
                  classNamePrefix="react-select"
                />
              </div>
              <label className="mt-6 mb-4 text-xl font-sans font-semibold  text-gray-700 w-96 text-start">
                Or enter your own prompt:
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-96 transition-transform transform hover:scale-105 hover:shadow-lg"
              />
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={handleNextStep}
                className="bg-purple-500 text-white font-semibold w-96 py-4 text-lg px-6 rounded-2xl hover:bg-purple-600 transition-transform transform hover:scale-105 mt-4 mb-2"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="card text-center">
            {isLoading ? (
              <LottieAnimation
                description={"The photos will be generated in a few minutes..."}
              />
            ) : (
              <Slideshow images={generatedImages} loading={isLoading} />
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
