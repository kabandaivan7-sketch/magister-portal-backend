const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const S3_BUCKET = process.env.S3_BUCKET;
const USE_S3 = S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

/**
 * Upload file to S3 or local filesystem
 * @param {string} fileBuffer - File buffer to upload
 * @param {string} fileName - Original filename
 * @param {string} fileMimeType - MIME type of file
 * @returns {Promise<string>} URL to the uploaded file
 */
async function uploadFile(fileBuffer, fileName, fileMimeType) {
    if (!USE_S3) {
        return uploadLocal(fileBuffer, fileName);
    }
    return uploadS3(fileBuffer, fileName, fileMimeType);
}

/**
 * Upload file to local filesystem
 */
function uploadLocal(fileBuffer, fileName) {
    return new Promise((resolve, reject) => {
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const localFileName = uniqueSuffix + path.extname(fileName);
        const filePath = path.join(uploadDir, localFileName);

        fs.writeFile(filePath, fileBuffer, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(`/uploads/${localFileName}`);
            }
        });
    });
}

/**
 * Upload file to AWS S3
 */
async function uploadS3(fileBuffer, fileName, fileMimeType) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const s3Key = `uploads/${uniqueSuffix}${path.extname(fileName)}`;

    const params = {
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: fileMimeType,
        ACL: 'public-read'
    };

    try {
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload file to S3');
    }
}

/**
 * Delete file from S3 or local filesystem
 */
async function deleteFile(fileUrl) {
    if (!USE_S3) {
        return deleteLocal(fileUrl);
    }
    return deleteS3(fileUrl);
}

function deleteLocal(fileUrl) {
    return new Promise((resolve, reject) => {
        const uploadDir = path.join(__dirname, '../uploads');
        const fileName = path.basename(fileUrl);
        const filePath = path.join(uploadDir, fileName);

        fs.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function deleteS3(fileUrl) {
    // Extract key from S3 URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const params = {
        Bucket: S3_BUCKET,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('Failed to delete file from S3');
    }
}

module.exports = {
    uploadFile,
    deleteFile,
    USE_S3
};
