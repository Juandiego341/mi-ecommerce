import cloudinary from '../config/cloudinary'

export const uploadImage = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(buffer)
  })
}

export const deleteImage = async (imageUrl: string): Promise<void> => {
  const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0]
  await cloudinary.uploader.destroy(publicId)
}