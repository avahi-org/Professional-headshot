import React, { useState, useEffect } from "react";
import Upload from "./components/Upload";
import Preview from "./components/Preview";
import Slideshow from "./components/Slideshow";
import Breadcrumb from "./components/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProgressBar from "./components/ProgressBar";
import { listFilesInS3Folder, uploadFileToS3 } from "./config/awsConfig";
import Select from "react-select";
import LottieAnimation from "./components/LottieAnimation";
import ProgressIndicator from "./components/ProgressIndicator";
import UserSelector from "./components/UserSelector";

const modelTypes = ["man", "woman"];

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

const convertEtaToMillis = (etaString) => {
  const [hours, minutes, secondsWithMillis] = etaString.split(":");

  // Extract only the first two digits for seconds
  const seconds = secondsWithMillis.slice(0, 2);

  return (
    (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000
  );
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
  const [userId, setUserId] = useState();
  const [phoneNumber, setPhoneNumber] = useState("");

  const simulateTraining = () => {
    startTraining();
  };

  const handleUpload = (files) => {
    setFolderName(`folder-${Date.now()}`);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
  };

  useEffect(() => {
    if (step === 2 && userId?.value) {
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
  }, [step, userId?.value, userId?.label]);

  const fetchIds = async (apiKey, userID, userEmail) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/api/get-ids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey, userID, userEmail }),
        }
      );
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
    setStep(3); // Move to step 3 immediately to show loading animation

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/api/generate-images`,
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
        if (uploadedImages.length < 10) {
          toast.error("Please upload at least 10 images.");
          return;
        }
        if (!trainingName) {
          toast.error("Please enter a training name.");
          return;
        }
        if (!userId) {
          toast.error("Please select a user.");
          return;
        }
        setIsLoading(true);
        await handleUploadAWS(); // Upload images to AWS
        simulateTraining();
        break;
      case 2:
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
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/api/start-training`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.eta) {
        const etaMillis = convertEtaToMillis(data.eta);
        setEtaDuration(etaMillis);

        console.log("etaMillis", etaMillis);

        console.log("data eta", data.eta);

        toast.success("Training started successfully.");

        // Set the timeout based on the ETA
        setTimeout(() => {
          setIsLoading(false);
          setStep(2);
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
    const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME;
    const newImages = [];

    try {
      for (const image of uploadedImages) {
        const file = await fetch(image).then((r) => r.blob());
        const { url } = await uploadFileToS3(file, folderName, bucketName);
        newImages.push(url);
      }

      if (newImages.length === uploadedImages.length) {
        toast.success("Images uploaded successfully.");
      } else {
        throw new Error("Not all images were uploaded successfully.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files. Please try again.");
      setIsLoading(false);
      throw error; // Re-throw to prevent training from starting
    }
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
      <header className="w-full flex justify-center items-center mb-12 mt-2">
        <div className="flex items-center">
          <img
            src="https://awsmp-logos.s3.amazonaws.com/69db6b10-223d-47a0-bb38-e501668f9188/6bac33d0ef3ecb9cc4e75f267d1ce3bf.png"
            alt="Logo"
            className="h-12 w-auto"
          />
          <h1 className="md:text-5xl sm:text-4xl text-3xl font-sans font-normal text-gray-700">
            Professional Headshot
          </h1>
        </div>
      </header>

      <div className="w-full flex mx-auto px-4">
        <Breadcrumb currentStep={step} onGoBack={handlePreviousStep} />
        <ProgressIndicator currentStep={step} onGoBack={handlePreviousStep} />
      </div>
      <div className="container">
        {step === 1 &&
          (isLoading ? (
            <LottieAnimation
              countdown={etaDuration}
              description={
                etaDuration ? "Training in progress..." : "Uploading images..."
              }
            />
          ) : (
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Prepare Model & Upload Images
              </h2>

              <div className="space-y-8">
                {/* User Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Select User
                  </label>
                  <UserSelector
                    onUserSelect={handleUserSelect}
                    onPhoneChange={handlePhoneNumberChange}
                  />
                </div>

                {/* Training Name */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Training Name
                  </label>
                  <input
                    type="text"
                    value={trainingName}
                    onChange={handleTrainingNameChange}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                    placeholder="Enter training name"
                  />
                </div>

                {/* Model Type Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Model Type
                  </label>
                  <div className="flex flex-wrap justify-start gap-4">
                    {modelTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleModelTypeChange(type)}
                        className={`py-2 px-6 text-lg font-medium rounded-full transition-all duration-200 ${
                          modelType === type
                            ? "bg-purple-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="mt-8 md:p-6 p-0 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-2xl font-semibold text-center text-gray-800 md:mt-0 mt-4 mb-4">
                    Upload Images
                  </h3>
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
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleNextStep}
                    disabled={
                      uploadedImages.length < 10 || !userId || !trainingName
                    }
                    className={`
              w-full py-4 px-6
              text-xl font-semibold
              rounded-full
              transition-all duration-300 ease-in-out
              ${
                uploadedImages.length >= 10 && userId && trainingName
                  ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
            `}
                  >
                    {uploadedImages.length >= 10 && userId && trainingName
                      ? "Upload Images & Start Training"
                      : "Complete All Fields to Continue"}
                  </button>

                  <button
                    onClick={() => {
                      if (userId) {
                        handleSkipStep(2);
                      } else {
                        toast.error(
                          "You should choose a user to advance to the next step!"
                        );
                      }
                    }}
                    className="w-full py-3 px-6 text-lg font-semibold text-purple-500 bg-white border border-purple-500 rounded-full hover:bg-purple-50 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          ))}
        {step === 2 &&
          (isLoading ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <LottieAnimation description="Generating photos..." />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Generate Training Model
              </h2>

              <div className="space-y-8">
                {/* Model of training */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Model of Training
                  </label>
                  <Select
                    value={selectedId}
                    onChange={handleIdChange}
                    options={idsOptions}
                    placeholder="Select a training model"
                    className="text-lg"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Prompt Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Select Prompt
                  </label>
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

                {/* Prompt Display */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Prompt Description
                  </label>
                  <textarea
                    value={prompt}
                    disabled={true}
                    rows={4}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out resize-none"
                    placeholder="Prompt description is shown here when selecting a prompt"
                  />
                </div>

                {/* Action Button */}
                <div className="mt-8">
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedId}
                    className={`
             w-full py-4 px-6
             text-xl font-semibold
             rounded-full
             transition-all duration-300 ease-in-out
             ${
               selectedId
                 ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl"
                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
             }
             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
           `}
                  >
                    {selectedId
                      ? "Generate Photos"
                      : "Select a Model to Continue"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        {step === 3 && (
          <div className="card text-center">
            {isLoading ? (
              <LottieAnimation
                description={"The photos will be generated in a few minutes..."}
              />
            ) : (
              <>
                <Slideshow images={generatedImages} loading={isLoading} />
                <div className="flex flex-col items-center justify-center mt-8">
                  <button
                    onClick={handleReset}
                    className="
              relative
              overflow-hidden
              bg-gradient-to-r from-purple-500 to-indigo-600
              text-white
              font-sans
              font-semibold
              w-full sm:w-64
              py-4
              text-lg
              px-6
              rounded-full
              shadow-lg
              hover:shadow-xl
              transition-all
              duration-300
              ease-in-out
              transform
              hover:scale-105
              focus:outline-none
              focus:ring-2
              focus:ring-purple-500
              focus:ring-opacity-50
            "
                  >
                    <span className="relative z-10">Reset & Start Over</span>
                    <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></span>
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </span>
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
