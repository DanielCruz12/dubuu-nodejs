import multer from 'multer'
import { allowedMimeTypes } from '../config/allowed-mime-types'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB por archivo
    files: 20, // Máximo 20 archivos
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
    }
  },
})
