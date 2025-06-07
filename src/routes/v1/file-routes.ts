import { Router } from 'express'
import { deleteFile } from '../../controllers/upload-controller'
import { uploadArray } from '../../controllers/upload-controller'
import { upload } from '../../middlewares/multer'

const fileRoutes = Router()

fileRoutes.post('/upload', upload.array('files', 10), uploadArray)
fileRoutes.delete('/upload/:filename', deleteFile)

export { fileRoutes }
