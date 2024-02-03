const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
   try {
      if (!localFilePath) {
         return null;
      }
      // next step upload the file on cloudinary.
      const response = await cloudinary.uploader.upload(localFilePath, {
         // could be anything like img,vid, so put auto.
         resource_type: "auto",
      });
      console.log("File uploaded on cloudinary: " + response.url);
      fs.unlinkSync(localFilePath);
      return response;
   } catch (error) {
      // fs has this unlink option. this will remove the locally saved temporary file
      // as the upload operation got failed.
      // unlink is deleting the file.
      fs.unlinkSync(localFilePath);
      return null;
   }
};

// to delete a file from cloudinary

const deleteFromCloudinary = async (cloudinaryPublicId) => {
   // cloudinary.v2.api
   //    .delete_resources(["roolsspdvod7nydyawnd"], {
   //       type: "upload",
   //       resource_type: "auto",
   //    })
   //    .then(console.log);
   try {
      if (!cloudinaryPublicId) {
         return null;
      }
      const response = await cloudinary.uploader.destroy(cloudinaryPublicId);
      return response;
   } catch (error) {
      throw new Error("Deletion from cloudinary failed :" + error);
   }
};

const retrievePublicIdFromUrl = (url) => {
   let n = url.length;
   let publicId = "";
   for (let i = n - 1; i >= 0; i--) {
      if (url[i] == ".") {
         i--;
         while (url[i] != "/") {
            publicId += url[i];
            i--;
         }
         break;
      }
   }
   return publicId.split("").reverse().join("");
};

module.exports = {
   uploadOnCloudinary,
   deleteFromCloudinary,
   retrievePublicIdFromUrl,
};
