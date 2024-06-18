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
import { listFilesInS3Folder, uploadFileToS3 } from "./config/awsConfig"; // Import your AWS S3 configuration
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
  const [folderName, setFolderName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [trainingName, setTrainingName] = useState("");
  const [etaDuration, setEtaDuration] = useState("");
  const [idsOptions, setIdsOptions] = useState([]);
  const [selectedId, setSelectedId] = useState();

  const simulateTraining = () => {
    startTraining();
  };

  const handleUpload = (files) => {
    setFolderName(`folder-${Date.now()}`);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
  };

  useEffect(() => {
    if (step === 4) {
      const loadData = async () => {
        try {
          const idsData = await fetchIds("sd_seG3wWBvCbzNyAKZ3wG8QRaox5qrn2");
          const options = Object.entries(idsData).map(([key, value]) => ({
            value: value,
            label: key,
          }));

          setIdsOptions(options);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching IDs:", error);
          toast.error("Error fetching IDs.");
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [step]);

  const fetchIds = async (apiKey) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/get-ids", {
        method: "POST", // Change method to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json();
      return data?.available_models;
    } catch (error) {
      console.error("Error fetching IDs:", error);
      toast.error("Error fetching IDs.");
    }
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

  const startGeneratingPhotos = async () => {
    const payload = {
      apiKey: "sd_seG3wWBvCbzNyAKZ3wG8QRaox5qrn2",
      classname: modelType,
      prompt: prompt,
      jobID: selectedId?.value,
    };

    console.log("payload", prompt, selectedId?.value);

    setIsLoading(true);
    setStep(5); // Move to step 5 immediately to show loading animation

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/generate-images",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Image generation started successfully:", data);

      if (data.link_to_images) {
        // Extract the prefix from the link_to_images
        const url = new URL(data.link_to_images);
        const prefix = url.pathname.substring(1); // Remove the leading '/'

        // Fetch the images from the S3 folder
        const images = await listFilesInS3Folder(
          prefix,
          "backend-professional-headshot-test-avahi"
        );

        setGeneratedImages(images);
        toast.success("Image generation completed successfully.");
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error starting image generation:", error);
      toast.error("Error starting image generation.");
      setIsLoading(false);
    }
  };
  const handleNextStep = async () => {
    switch (step) {
      case 1:
        setStep(2);
        break;
      case 2:
        if (uploadedImages.length >= 10) {
          await handleUploadAWS(); // Upload images to AWS before proceeding
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
        await startGeneratingPhotos();
        break;
      default:
        break;
    }
  };

  const handleSkipStep = (targetStep) => {
    setStep(targetStep);
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

  const startTraining = async () => {
    const payload = {
      apiKey: "sd_seG3wWBvCbzNyAKZ3wG8QRaox5qrn2",
      jobName: trainingName,
      classname: modelType,
      imagesInBucketPath: folderName,
    };

    console.log("payload", payload, folderName);

    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:5000/api/start-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Training started successfully:", data);
      toast.success("Training started successfully.");

      // Simulate 10 minutes loading time
      setTimeout(() => {
        setIsLoading(false);
        setStep(4);
      }, 600000); // 600000 milliseconds = 10 minutes
    } catch (error) {
      console.error("Error starting training:", error);
      toast.error("Error starting training.");
      setIsLoading(false);
    }
  };

  const handleUploadAWS = async () => {
    setIsLoading(true);
    const bucketName = "backend-professional-headshot-test-avahi";
    const newImages = [];

    for (const image of uploadedImages) {
      try {
        const file = await fetch(image).then((r) => r.blob());
        const { url } = await uploadFileToS3(file, folderName, bucketName);
        newImages.push(url);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Error uploading file.");
      }
    }

    setIsLoading(false);
    toast.success("Images uploaded successfully.");
    setStep(3);
  };

  const handleIdChange = (selectedOption) => {
    setSelectedId(selectedOption);
  };

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
            {isLoading ? (
              <LottieAnimation description={"Uploading images..."} />
            ) : (
              <>
                <div className="progress-bar flex justify-center items-center mx-auto">
                  <ProgressBar
                    progress={progress}
                    uploadedImages={uploadedImages}
                  />
                </div>
                <Upload onUpload={handleUpload} />
                {uploadedImages.length >= 1 && (
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
                  <button
                    onClick={() => handleSkipStep(3)}
                    className="bg-blue-500 text-white text-lg font-sans w-80 py-3 px-6 rounded-2xl font-semibold hover:bg-blue-600 transition-transform transform hover:scale-105 mt-4 mb-2 ml-4"
                  >
                    Skip
                  </button>
                </div>
              </>
            )}
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
                  <button
                    onClick={() => handleSkipStep(4)}
                    className="bg-blue-500 font-sans font-semibold text-white w-full py-4 px-6 rounded-2xl hover:bg-blue-600 text-lg transition-transform transform hover:scale-105 mt-4"
                  >
                    Skip
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
              <label className="mt-6 mb-4 text-xl font-sans font-semibold text-gray-700 w-96 text-start">
                Or enter your own prompt:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4} // Adjust the number of rows as needed
                className="bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-96 transition-transform transform hover:scale-105 hover:shadow-lg resize-none"
                placeholder="Enter your prompt here..."
              />
              <label className="mt-6 mb-4 text-xl font-sans font-semibold text-gray-700 w-96 text-start">
                Model of training
              </label>
              <div className="w-96 mb-4">
                <Select
                  value={selectedId}
                  onChange={handleIdChange}
                  options={idsOptions}
                  placeholder="Select a training model"
                  className="text-lg"
                  classNamePrefix="react-select"
                />
              </div>
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
