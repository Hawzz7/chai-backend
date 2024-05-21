import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return "File Path not found"
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully to cloudinary
        // console.log("file uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath) //will remove the file from server(localstorage)
        
        return response;
    }//upto this line the localFilePath has been uploaded to the server(localstorage) and also to cloudinary. But it create some malicious file in the server(localstorage) which are harmful therefore it is necessary to remove the file from server
    catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


export { uploadOnCloudinary }