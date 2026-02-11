import multer from 'multer';

// Configure storage
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

export default upload;
