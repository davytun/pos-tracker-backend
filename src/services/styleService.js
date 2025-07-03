import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs/promises';
import Style from '../models/StyleModel.js'; // May not be strictly needed here if only handling cloud part

/**
 * Uploads an image file to Cloudinary.
 * @param {string} filePath - Path to the local file to upload.
 * @param {string} [folder='fashion_styles'] - Folder in Cloudinary to upload to.
 * @returns {Promise<object>} Cloudinary upload result object.
 * @throws {Error} If Cloudinary upload fails.
 */
export const uploadImageToCloudinary = async (filePath, folder = 'fashion_styles') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    return result;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    // Rethrow or handle as a specific application error
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  } finally {
    // Clean up the temporary local file
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn(`Failed to delete temporary file: ${filePath}`, unlinkError);
        // This is a cleanup error, usually not critical to the main operation's success/failure
      }
    }
  }
};

/**
 * Deletes an image from Cloudinary.
 * @param {string} publicId - The public_id of the image in Cloudinary.
 * @returns {Promise<object>} Cloudinary deletion result.
 * @throws {Error} If Cloudinary deletion fails.
 */
export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) {
    // console.log('No publicId provided for Cloudinary deletion, skipping.');
    return { result: 'ok', message: 'No publicId provided, skipped deletion.' };
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    // console.log(`Cloudinary deletion result for ${publicId}:`, result);
    if (result.result !== 'ok' && result.result !== 'not found') {
        // 'not found' is also an acceptable outcome for deletion if it was already gone
        console.warn(`Cloudinary deletion for ${publicId} did not return 'ok':`, result);
    }
    return result;
  } catch (error) {
    console.error(`Cloudinary deletion failed for ${publicId}:`, error);
    // Depending on policy, you might rethrow or just log and continue
    // For a "delete" operation, if the main record is deleted, a failed cloud deletion might be acceptable with logging.
    throw new Error(`Cloudinary deletion failed for ${publicId}: ${error.message}`);
  }
};

/**
 * Helper to attempt deletion from Cloudinary without throwing an error that would stop a larger process.
 * Useful for cleanup tasks where the primary operation should still succeed if cleanup fails.
 * @param {string} publicId - The public_id of the image in Cloudinary.
 */
export const attemptCloudinaryDelete = async (publicId) => {
    if (publicId) {
        try {
            await deleteImageFromCloudinary(publicId);
        } catch (error) {
            console.error(`Non-critical: Failed to delete image ${publicId} from Cloudinary during cleanup: ${error.message}`);
        }
    }
};
