const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads an image to Cloudinary in a specific folder.
 * @param {string} fileBuffer - Base64 string or file path
 * @param {string} folder - Folder name in Cloudinary (e.g., 'sems/profiles')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImage = async (fileBuffer, folder) => {
    try {
        const result = await cloudinary.uploader.upload(fileBuffer, {
            folder: folder,
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

module.exports = { cloudinary, uploadImage };
