import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [images, setImages] = useState([]);
  const [details, setDetails] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://127.0.0.1:5000/api/image-updates"
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("data images", data.images);
      setImages(data.images);
      setDetails(data.details);
      setSelectedImages([]);
      setSubmissionMessage("");
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleImageSelect = (image) => {
    setSelectedImages((prev) =>
      prev.includes(image)
        ? prev.filter((img) => img !== image)
        : [...prev, image]
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    fetch("http://127.0.0.1:5000/api/verify-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validImages: selectedImages,
        userEmail: details.e_mail,
        userID: details.userID,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsSubmitting(false);
        setSubmissionMessage(data.message);
      });
  };

  return (
    <div className="App">
      <h1>Verify and Finalize Images</h1>
      <div className="details">
        <p>API Key: {details.apiKey}</p>
        <p>Prompt: {details.prompt}</p>
        <p>Job ID: {details.jobID}</p>
        <p>Classname: {details.classname}</p>
        <p>Email: {details.e_mail}</p>
        <p>User ID: {details.userID}</p>
      </div>
      <div className="image-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`image-wrapper ${
              selectedImages.includes(image) ? "selected" : ""
            }`}
            onClick={() => handleImageSelect(image)}
          >
            <img src={image} alt={`Generated ${index}`} className="image" />
          </div>
        ))}
      </div>
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={isSubmitting || selectedImages.length === 0}
      >
        {isSubmitting ? "Submitting..." : "Submit Valid Images"}
      </button>
      {submissionMessage && (
        <div className="submission-message">{submissionMessage}</div>
      )}
    </div>
  );
};

export default App;
