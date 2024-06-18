import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

//TODO: Use Process.env for access keys/secret. bad practice.

// Configure the AWS SDK use process.env laterr
const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIAXGMECJMXVJGJRM4Q",
    secretAccessKey: "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",
  },
});

export const uploadFileToS3 = async (file, folderName, bucketName) => {
  const fileName = `${folderName}/${Date.now()}-${file.name}.png`;
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file,
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    return {
      url: `https://${bucketName}.s3.us-east-1.amazonaws.com/${fileName}`,
      data,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

export const listFilesInS3Folder = async (folderName, bucketName) => {
  const params = {
    Bucket: bucketName,
    Prefix: folderName,
  };

  try {
    const command = new ListObjectsV2Command(params);
    const data = await s3.send(command);
    const files = data.Contents.map((item) => {
      return `https://${bucketName}.s3.us-east-1.amazonaws.com/${item.Key}`;
    });

    console.log("files", files);
    return files;
  } catch (err) {
    console.error("Error listing files in S3 folder:", err);
    throw err;
  }
};
