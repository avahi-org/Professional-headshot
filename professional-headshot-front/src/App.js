import React, { useState, useEffect, useCallback } from "react";
import Upload from "./components/Upload";
import Preview from "./components/Preview";
import Slideshow from "./components/Slideshow";
import Breadcrumb from "./components/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProgressBar from "./components/ProgressBar";
import { listFilesInS3Folder, uploadFileToS3 } from "./config/awsConfig"; // Import your AWS S3 configuration
import Select from "react-select";
import LottieAnimation from "./components/LottieAnimation";
import ProgressIndicator from "./components/ProgressIndicator";
import UserSelector from "./components/UserSelector";

const modelTypes = ["man", "woman"];

const formatEta = (eta) => {
  const [hours, minutes, seconds] = eta.split(":").map(Number);
  let totalSeconds = hours * 3600 + minutes * 60 + seconds;
  let result = "";

  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

  if (displayMinutes > 0) {
    result += `${displayMinutes} minute${displayMinutes > 1 ? "s" : ""} `;
  }
  if (displaySeconds > 0) {
    result += `${displaySeconds} second${displaySeconds > 1 ? "s" : ""}`;
  }

  return result.trim();
};

const predefinedPrompts = [
  {
    value:
      "headshot of a banking professional wearing a nice suit with an office in the background",
    label: "professional",
  },
  {
    value:
      "headshot of a lawyer wearing formal attire with a study that has bookcases in the back",
    label: "lawyer",
  },
  {
    value:
      "headshot of a corporate businessperson wearing a nice suit with an office in the background",
    label: "businessperson",
  },
];

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
  const [userId, setUserId] = useState();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countdown, setCountdown] = useState(null);

  const simulateTraining = () => {
    startTraining();
  };

  const handleUpload = (files) => {
    setFolderName(`folder-${Date.now()}`);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
  };

  useEffect(() => {
    if (step === 2 && etaDuration) {
      const [hours, minutes, seconds] = etaDuration.split(":").map(Number);
      let totalSeconds = hours * 3600 + minutes * 60 + seconds;

      const interval = setInterval(() => {
        totalSeconds -= 1;
        if (totalSeconds <= 0) {
          clearInterval(interval);
          setCountdown(null); // Clear countdown when finished
        } else {
          const displayHours = Math.floor(totalSeconds / 3600);
          const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
          const displaySeconds = totalSeconds % 60;
          setCountdown(
            `${displayHours}:${displayMinutes
              .toString()
              .padStart(2, "0")}:${displaySeconds.toString().padStart(2, "0")}`
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, etaDuration]);

  useEffect(() => {
    if (step === 3 && userId?.value) {
      const loadData = async () => {
        try {
          const idsData = await fetchIds(
            process.env.REACT_APP_ASTRIA_API_KEY,
            userId?.value,
            userId?.label
          );
          if (idsData) {
            const options = Object.entries(idsData).map(([key, value]) => ({
              value: value,
              label: key,
            }));
            setIdsOptions(options);
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching IDs:", error);
          toast.error("Error fetching IDs.");
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [step, userId?.value]);

  const fetchIds = async (apiKey, userID, userEmail) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/get-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey, userID, userEmail }),
      });
      const data = await response.json();
      console.log("data?", data);
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
      apiKey: process.env.REACT_APP_ASTRIA_API_KEY,
      classname: modelType,
      prompt: prompt,
      jobID: selectedId?.value,
      userID: userId?.value,
      userEmail: userId?.label,
    };
    setIsLoading(true);
    setStep(4); // Move to step 4 immediately to show loading animation

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

      if (data.link_to_images) {
        // Extract the prefix from the link_to_images
        const url = new URL(data.link_to_images);
        const prefix = url.pathname.substring(1); // Remove the leading '/'

        // Fetch the images from the S3 folder
        const images = await listFilesInS3Folder(
          prefix,
          process.env.REACT_APP_AWS_BUCKET_NAME
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
        if (uploadedImages.length >= 10) {
          await handleUploadAWS(); // Upload images to AWS before proceeding
        } else {
          toast.error("Please upload at least 10 images.");
        }
        break;
      case 2:
        if (!trainingName) {
          toast.error("Please enter a training name.");
          return;
        }

        simulateTraining();
        break;
      case 3:
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

  const handleUserSelect = (userId) => {
    setUserId(userId);
  };

  const progress = (uploadedImages.length / 10) * 100;

  const startTraining = async () => {
    const payload = {
      apiKey: process.env.REACT_APP_ASTRIA_API_KEY,
      jobName: trainingName,
      classname: modelType,
      imagesInBucketPath: folderName,
      userID: userId?.value,
      userEmail: userId?.label,
      phoneNumber: phoneNumber || "", // Include phone number in payload
    };

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

      if (data.eta) {
        const etaMillis =
          data.eta.split(":").reduce((acc, time) => 60 * acc + +time) * 1000;
        setEtaDuration(formatEta(data.eta));

        toast.success("Training started successfully.");

        // Set the timeout based on the ETA
        setTimeout(() => {
          setIsLoading(false);
          setStep(3);
        }, etaMillis);
      } else {
        toast.error("Failed to get ETA from the server.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error starting training:", error);
      toast.error("Error starting training.");
      setIsLoading(false);
    }
  };

  const handleUploadAWS = async () => {
    setIsLoading(true);
    const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME;
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
    setStep(2);
  };

  const handleIdChange = (selectedOption) => {
    setSelectedId(selectedOption);
  };

  const handlePhoneNumberChange = (phone) => {
    setPhoneNumber(phone);
  };

  const handleReset = () => {
    setUploadedImages([]);
    setGeneratedImages([]);
    setPhoneNumber("");
    setTrainingName("");
    setStep(1);
  };

  return (
    <div className=" container min-h-screen h-full max-w-[2000px] w-full bg-cover bg-[#efefe9] flex flex-col items-center py-10 font-sans">
      <h1 className="md:text-5xl sm:text-4xl text-3xl font-sans font-normal text-gray-700 mb-12 mt-2">
        Professional Headshot
      </h1>

      <div className="w-full flex mx-auto px-4">
        <Breadcrumb currentStep={step} onGoBack={handlePreviousStep} />
        <ProgressIndicator currentStep={step} onGoBack={handlePreviousStep} />
      </div>
      <div className="container">
        {step === 1 && (
          <div className="card text-center">
            <p className="mb-10 text-2xl sm:text-3xl font-sans font-semibold text-gray-700">
              Step 1: Upload 10 or more Images
            </p>
            {isLoading ? (
              <LottieAnimation description={"Uploading images..."} />
            ) : (
              <>
                <div className="progress-bar mx-auto px-4 sm:px-0 flex justify-center items-center">
                  <ProgressBar
                    progress={progress}
                    uploadedImages={uploadedImages}
                  />
                </div>
                <div className="sm:mx-auto mx-4">
                  <Upload onUpload={handleUpload} />
                </div>

                {uploadedImages.length >= 1 && (
                  <Preview images={uploadedImages} onRemove={handleRemove} />
                )}
                <div className="flex flex-col items-center justify-center mt-4">
                  {uploadedImages.length >= 10 && (
                    <button
                      onClick={handleNextStep}
                      className="bg-purple-500 text-white text-lg font-sans w-80 py-3 px-6 rounded-2xl font-semibold hover:bg-purple-600 transition-transform transform hover:scale-105 mt-4 mb-2"
                    >
                      Next
                    </button>
                  )}
                  <p
                    onClick={() => handleSkipStep(2)}
                    className="text-blue-500 text-lg font-sans w-80 py-3 px-6 rounded-2xl font-semibold transition-transform transform mt-2 mb-2 cursor-pointer hover:underline"
                  >
                    Skip
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="card text-center max-w-3xl mx-auto">
            <div className="w-full ">
              <p className="mb-14 text-2xl sm:text-3xl  w-full font-sans font-semibold text-gray-700 text-center">
                Step 2: Model Selection
              </p>
            </div>

            {isLoading ? (
              <LottieAnimation
                countdown={countdown}
                description={"Training the model..."}
              />
            ) : (
              <div className="flex flex-col items-center w-full space-y-6">
                <div className="w-full max-w-md">
                  <UserSelector
                    onUserSelect={handleUserSelect}
                    onPhoneChange={handlePhoneNumberChange}
                  />
                </div>

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
                    <div className="flex flex-wrap justify-center gap-4">
                      {modelTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleModelTypeChange(type)}
                          className={`py-4 px-8 font-sans font-medium text-xl rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg ${
                            modelType === type
                              ? "bg-purple-500 text-white"
                              : "bg-white border border-purple-500 text-purple-500"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <button
                    disabled={!userId && !trainingName}
                    onClick={handleNextStep}
                    className={`bg-purple-500 font-sans font-semibold text-white w-full py-4 px-6 rounded-2xl transition-transform transform hover:scale-105 ${
                      !userId && !trainingName
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-purple-600"
                    }`}
                  >
                    Next
                  </button>
                  <p
                    onClick={() => {
                      if (userId) {
                        handleSkipStep(3);
                      }
                    }}
                    className={`font-sans font-semibold text-blue-500 w-full py-4 px-6 rounded-2xl transition-transform transform text-lg mt-4 text-center ${
                      !userId
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-blue-600 hover:scale-105 cursor-pointer hover:underline"
                    }`}
                    disabled={!userId}
                  >
                    Skip
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="w-full text-center items-center">
            <p className="mb-6 sm:text-3xl text-start sm:text-center text-2xl font-semibold text-gray-700">
              Step 3: Generate Training Model
            </p>
            <div className="flex flex-col items-center mb-6 w-full">
              <label className="mt-6 mb-4 text-xl font-sans font-semibold text-gray-700 w-full sm:w-96 text-start">
                Model of training
              </label>
              <div className="w-full sm:w-96 mb-4">
                <Select
                  value={selectedId}
                  onChange={handleIdChange}
                  options={idsOptions}
                  placeholder="Select a training model"
                  className="text-lg"
                  classNamePrefix="react-select"
                />
              </div>
              <label className="mt-6 mb-4 text-xl font-sans font-semibold text-gray-700 w-full sm:w-96 text-start">
                Enter your prompt:
              </label>
              <div className="w-full sm:w-96 mb-4">
                <Select
                  value={predefinedPrompts.find(
                    (option) => option.value === prompt
                  )}
                  onChange={handlePromptChange}
                  options={predefinedPrompts}
                  placeholder="Select a prompt"
                  className="text-lg"
                  classNamePrefix="react-select"
                />
              </div>
              <textarea
                value={prompt}
                disabled={true}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4} // Adjust the number of rows as needed
                className="bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-lg text-xl mb-4 w-full sm:w-96 transition-transform transform hover:scale-105 hover:shadow-lg resize-none"
                placeholder="Enter your prompt here..."
              />
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={handleNextStep}
                className={`bg-purple-500 text-white font-semibold w-full sm:w-96 py-4 text-lg px-6 rounded-2xl transition-transform transform hover:scale-105 mt-4 mb-2 ${
                  !selectedId
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-purple-600"
                }`}
                aria-label="Proceed to next step"
                disabled={!selectedId}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="card text-center">
            {isLoading ? (
              <LottieAnimation
                description={"The photos will be generated in a few minutes..."}
              />
            ) : (
              <>
                <Slideshow images={generatedImages} loading={isLoading} />
                <div className="flex flex-col items-center justify-center mt-4">
                  <button
                    onClick={handleReset}
                    className="bg-purple-500 text-white  font-sans font-semibold w-full sm:w-52 py-4 text-lg px-6 rounded-2xl hover:bg-purple-600 transition-transform transform hover:scale-105 mt-4 mb-2"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
