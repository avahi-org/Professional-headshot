import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { CloudUploadIcon } from "@heroicons/react/outline";

const Upload = ({ onUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const validFiles = [];
      const invalidFiles = [];

      acceptedFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error("Some files are not valid images and were not uploaded.");
      }

      if (validFiles.length > 0) {
        onUpload(validFiles);
        toast.success(`${validFiles.length} images uploaded successfully.`);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
  });

  return (
    <div className="upload-container p-6 border-dashed border-4 border-blue-600 rounded-lg text-center bg-white hover:bg-blue-50 transition">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} className="hidden" />
        <CloudUploadIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
        <p className="upload-text text-blue-600 font-semibold">
          Drag & drop some files here, or click to select files
        </p>
      </div>
    </div>
  );
};

export default Upload;
