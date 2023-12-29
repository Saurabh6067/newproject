import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodeONCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // uplode the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploded
    //console.log("file is uploded on cloudnary", response.url);
    fs.unlinkSync(localFilePath)
    return response;
    
  } catch (error) {
    fs.unlinkSync(localFilePath);
    /// remove the locallay save temporary file if we fail
    return null;
  }
};

export { uplodeONCloudinary };
