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

const App = () => {
  const [step, setStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

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

  const handleNextStep = () => {
    if (step < 5 && step !== 3) {
      setStep(step + 1);
    } else if (step === 3) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setGeneratedImages(uploadedImages); // Replace with actual generated images
      }, 5000); // Simulate loading time
      setStep(4);
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
            className="bg-gradient-to-r self-start from-green-400 via-blue-500 to-purple-600 text-white gap-2 font-sans p-2 rounded-full hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition mt-0  flex items-center justify-center"
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
            <p className="mb-4 text-lg font-sans text-gray-700">
              Step 2: Upload 10 Images
            </p>
            <div className="w-[39%] flex justify-center items-center mx-auto">
              <ProgressBar
                progress={progress}
                uploadedImages={uploadedImages}
              />
            </div>
            <Upload onUpload={handleUpload} />
            <div className="upload-preview flex items-center justify-center">
              {uploadedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Upload Preview ${index}`}
                  onClick={() => handleRemove(index)}
                  className="w-24 h-24 object-cover rounded-lg shadow-md m-2 cursor-pointer"
                />
              ))}
            </div>
            <div className="flex items-center justify-center mt-4">
              {uploadedImages.length >= 10 && (
                <button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-72 font-sans py-3 px-4 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition mt-4 mb-2"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="card text-center">
            <p className="mb-4 text-lg font-sans text-gray-700">
              Step 3: Preview & Customize
            </p>
            <Preview
              images={uploadedImages}
              onRemove={handleRemove}
              styles={styles}
              onStyleChange={handleStyleChange}
            />
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white w-72 font-sans py-3 px-4 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition mt-4 mb-2"
              >
                Generate
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
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
