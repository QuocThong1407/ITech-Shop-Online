import { post, del } from "../utils/request.js";

/**
 * Upload a file (image)
 * @param {File} file - File to upload
 * @returns {Promise} { url: 'uploaded_file_url' }
 */
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return post('/upload', formData);
};

/**
 * Upload multiple files (images)
 * @param {File[]} files - Array of files to upload
 * @returns {Promise} { urls: ['url1', 'url2', ...] }
 */
const uploadMultipleFiles = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });
    return post('/upload/multiple', formData);
};

/**
 * Delete a file from storage
 * @param {string} url - URL of the file to delete
 * @returns {Promise} Success message
 */
const deleteFile = (url) => {
    return del('/upload', { url });
};

const uploadService = {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
};

export default uploadService;
