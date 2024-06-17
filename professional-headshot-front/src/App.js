import React, { useState } from "react";
import Upload from "./components/Upload";
import Preview from "./components/Preview";
import Slideshow from "./components/Slideshow";
import Introduction from "./components/Introduction";
import Breadcrumb from "./components/Breadcrumb";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProgressBar from "./components/ProgressBar";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { Oval } from "react-loader-spinner";

const styles = ["Style 1", "Style 2", "Style 3"]; // Add more styles as needed
const modelTypes = ["men", "women"];
const prompts = ["corporate", "casual", "formal"];

const App = () => {
  const [step, setStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [modelType, setModelType] = useState(modelTypes[0]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [trainingName, setTrainingName] = useState("");

  const handleUpload = (files) => {
    const newImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemove = (index) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
  };

  const handleModelTypeChange = (type) => {
    setModelType(type);
  };

  const handlePromptChange = (prompt) => {
    setPrompt(prompt);
  };

  const handleTrainingNameChange = (event) => {
    setTrainingName(event.target.value);
  };

  const handleNextStep = () => {
    if (step < 6 && step !== 4) {
      setStep(step + 1);
    } else if (step === 4) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setGeneratedImages(uploadedImages); // Replace with actual generated images
      }, 5000); // Simulate loading time
      setStep(5);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (uploadedImages.length / 10) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center py-10">
      <h1 className="text-5xl font-extrabold text-gray-700 font-mono mb-6">
        AI Headshot Generator
      </h1>

      <div className="flex flex-col items-center mb-6">
        <Breadcrumb currentStep={step} />
        {step > 1 && (
          <button
            onClick={handlePreviousStep}
            className="bg-gradient-to-r self-start from-green-400 via-blue-500 to-purple-600 text-white gap-2 font-sans p-3 rounded-full hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition mt-0 flex items-center justify-center"
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
            <p className="mb-4 text-xl font-sans text-gray-700">
              Step 2: Upload 10 or more Images
            </p>
            <div className="w-[50%] flex justify-center items-center mx-auto">
              <ProgressBar
                progress={progress}
                uploadedImages={uploadedImages}
              />
            </div>
            <Upload onUpload={handleUpload} />
            <Preview
              images={uploadedImages}
              onRemove={handleRemove}
              styles={styles}
              onStyleChange={handleStyleChange}
            />
            <div className="flex items-center justify-center mt-4">
              {uploadedImages.length >= 10 && (
                <button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-80 font-sans py-3 px-6 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 mt-4 mb-2"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="card text-center">
            <p className="mb-9 text-3xl font-sans text-gray-700">
              Step 3: Review Images & Model Selection
            </p>
            <div className="flex flex-col items-center mb-6 w-full">
              <label className="mb-2 text-xl font-sans text-gray-700">
                Model Type:
              </label>
              <div className="flex space-x-4">
                {modelTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleModelTypeChange(type)}
                    className={`py-4 font-sans px-8 rounded-lg text-xl ${
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
            <div className="flex flex-col items-center mb-6 w-full">
              <label className="mb-2 text-xl font-sans text-gray-700">
                Training Name:
              </label>
              <input
                type="text"
                value={trainingName}
                onChange={handleTrainingNameChange}
                className="bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-80"
              />
            </div>
            <div className="flex items-center justify-center mt-0">
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-80 font-sans py-4 px-6 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 mt-2 mb-2"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="card text-center">
            <p className="mb-6 text-3xl font-sans text-gray-700">
              Step 4: Generate Training
            </p>
            <div className="flex flex-col items-center mb-6 w-full">
              <label className="mb-2 text-xl font-sans text-gray-700">
                Prompt:
              </label>
              <div className="flex space-x-4">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePromptChange(p)}
                    className={`py-4 px-8 font-sans rounded-lg text-xl ${
                      prompt === p
                        ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700"
                    } transition-transform transform hover:scale-105 hover:shadow-lg`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <label className="mt-6 mb-2 text-xl font-sans text-gray-700">
                Or enter your own prompt:
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="bg-white border font-sans font-medium border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-80"
              />
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-80 font-sans py-4 px-6 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 mt-4 mb-2"
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
                <Oval color="#00BFFF" height={80} width={80} />
                <p className="mt-4 text-lg font-sans text-gray-700">
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
