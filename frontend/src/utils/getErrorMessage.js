export const getErrorMessage = (err, fallback = 'Ocurrió un error, intenta de nuevo') => {
  const data = err?.response?.data

  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(', ')
  }

  if (data?.message) {
    return data.message
  }

  if (!err?.response) {
    return 'No se pudo conectar con el servidor'
  }

  return fallback
}
