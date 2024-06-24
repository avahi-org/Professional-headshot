import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { CloudUploadIcon } from "@heroicons/react/outline";
import heic2any from "heic2any";

const convertHeicToJpeg = async (file) => {
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
    try {
      const jpegBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });
      return new File([jpegBlob], file.name.replace(/\.heic$/i, ".jpg"), {
        type: "image/jpeg",
      });
    } catch (error) {
      console.error("Error converting HEIC to JPEG:", error);
      return null;
    }
  }
  return file;
};

const Upload = ({ onUpload }) => {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const validFiles = [];
      const invalidFiles = [];

      toast.info("Processing files...", {
        autoClose: false,
        toastId: "processing",
      });

      for (const file of acceptedFiles) {
        if (
          file.type.startsWith("image/") ||
          file.name.toLowerCase().endsWith(".heic")
        ) {
          const convertedFile = await convertHeicToJpeg(file);
          if (convertedFile) {
            validFiles.push(convertedFile);
          } else {
            invalidFiles.push(file);
          }
        } else {
          invalidFiles.push(file);
        }
      }

      toast.dismiss("processing");

      if (invalidFiles.length > 0) {
        toast.error(
          "Some files are not valid images or couldn't be converted and were not uploaded."
        );
      }
      if (validFiles.length > 0) {
        toast.success(`Successfully processed ${validFiles.length} file(s)`);
        onUpload(validFiles);
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
