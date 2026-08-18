import multer from 'multer'

// Guardar en memoria en lugar de disco
const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: any) => {
  // Solo permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // máximo 10mb
  }
})