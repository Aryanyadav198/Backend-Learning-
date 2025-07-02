import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.toString(),
    api_key: process.env.CLOUDINARY_API_KEY.toString(),
    api_secret: process.env.CLOUDINARY_API_SECRET.toString() // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return;
        // upload file on cloudinary
        const response = await cloudinary.uploader
            .upload(
                localFilePath,
                {
                    resource_type: "auto"
                }
            );
        //    file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (err) {
        console.error("While uploading the file error :-", err)

        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload failed
    }
}
export default uploadOnCloudinary;

