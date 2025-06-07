import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
})

// Función para subir archivos a S3
export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
  folder: 'banners' | 'images' | 'files' | 'videos',
  typeName: string,
  categoryName: string,
) => {
  return Promise.all(
    files.map(async (file) => {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.originalname}`

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `products/${typeName}/${categoryName}/${folder}/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      }

      const command = new PutObjectCommand(uploadParams)
      await s3.send(command)

      const baseUrl = process.env.CLOUDFRONT_DOMAIN
        ? `https://${process.env.CLOUDFRONT_DOMAIN}`
        : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`

      return `${baseUrl}/products/${typeName}/${categoryName}/${folder}/${fileName}`
    }),
  )
}

// Función para eliminar archivos de S3
export const deleteFilesFromS3 = async (fileUrls: string[]) => {
  if (!fileUrls || fileUrls.length === 0) return

  return Promise.all(
    fileUrls.map(async (fileUrl) => {
      try {
        const baseUrl = process.env.CLOUDFRONT_DOMAIN
          ? `https://${process.env.CLOUDFRONT_DOMAIN}/`
          : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`

        const key = fileUrl.replace(baseUrl, '')

        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
        }

        const command = new DeleteObjectCommand(deleteParams)
        await s3.send(command)
      } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error)
      }
    }),
  )
}
