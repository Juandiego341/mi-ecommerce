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

const excelFileFilter = (req: any, file: any, cb: any) => {
  // Solo permitir archivos .xlsx
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos Excel (.xlsx)'), false)
  }
}

export const uploadExcel = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // máximo 5mb
  }
})