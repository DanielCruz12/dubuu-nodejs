import multer from 'multer'

// Configure memory storage for multer
const storage = multer.memoryStorage()

// Setup multer with storage, file type, and size limit (e.g., 5MB)
export const upload = multer({
  storage: storage,
})
