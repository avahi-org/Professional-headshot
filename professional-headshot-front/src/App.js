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

const modelTypes = ["man", "woman"];
const prompts = ["corporate", "casual", "formal"];

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
      const eta = "0:00:50"; // Replace with actual ETA fetched from API
      setEtaDuration(eta);

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
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (uploadedImages.length / 10) * 100;

  const promptOptions = prompts.map((p) => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
  }));

  return (
    <div className="min-h-screen max-w-[2000px] bg-cover bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center py-10 font-sans">
      <h1 className="text-5xl font-medium text-gray-700 mb-12 mt-2">
        AI Headshot Generator
      </h1>

      <div className="flex flex-col items-center mb-6">
        <Breadcrumb currentStep={step} />
        {step > 1 && (
          <button
            onClick={handlePreviousStep}
            className="bg-gradient-to-r self-start from-green-400 via-blue-500 to-purple-600 text-white gap-2 p-3 rounded-full hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition mt-0 flex items-center justify-center"
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
            <p className="mb-4 text-xl text-gray-700">
              Step 2: Upload 10 or more Images
            </p>
            <div className="w-[33%] flex justify-center items-center mx-auto">
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
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-80 py-3 px-6 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 mt-4 mb-2"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="card text-center">
            <p className="mb-9 text-3xl text-gray-700">
              Step 3: Model Selection
            </p>
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Oval color="#00BFFF" height={180} width={100} />
                <div className="animate-bounce text-2xl text-gray-700 mt-10">
                  Training the model... This may take approximately{" "}
                  {etaDuration}.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-md">
                  <div className="flex items-start mb-6">
                    <label className="text-xl text-gray-700">Model Type:</label>
                  </div>
                  <div className="flex space-x-4 mb-6">
                    {modelTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleModelTypeChange(type)}
                        className={`py-4 px-8 text-xl rounded-lg ${
                          modelType === type
                            ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700"
                        } transition-transform transform hover:scale-105 hover:shadow-lg`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-full max-w-md">
                  <div className="flex items-start mb-6">
                    <label className="text-xl text-gray-700">
                      Training Name:
                    </label>
                  </div>
                  <input
                    type="text"
                    value={trainingName}
                    onChange={handleTrainingNameChange}
                    className="bg-white font-sans font-medium border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-full transition-transform transform hover:scale-105 hover:shadow-lg"
                  />
                </div>
                <div className="flex items-center justify-center mt-4">
                  <button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-80 py-4 px-6 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 mt-4 mb-2"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="card justify-center items-center w-full text-center">
            <p className="mb-6 text-3xl text-gray-700">
              Step 4: Generate Training Model
            </p>
            <div className="flex flex-col items-center mb-6 w-full">
              <label className="mb-4 w-96 text-xl text-gray-700 text-start">
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
                  className="text-xl"
                  classNamePrefix="react-select"
                />
              </div>
              <label className="mt-6 mb-4 text-xl text-gray-700 w-96 text-start">
                Or enter your own prompt:
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-96 transition-transform transform hover:scale-105 hover:shadow-lg"
              />
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-80 py-4 px-6 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 mt-4 mb-2"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="card text-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Oval color="#00BFFF" height={180} width={100} />
                <p className="text-2xl text-gray-700 mt-2">
                  The photos will be generated in a few minutes...
                </p>
              </div>
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
