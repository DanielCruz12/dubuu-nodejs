export const validateTourData = (data: any) => {
  const errors: string[] = []

  // Validar campos requeridos
  const requiredFields = [
    'name',
    'description',
    'departure_point',
    'address',
    'country',
    'max_people',
    'duration',
    'lat',
    'long',
    'highlight',
    'included',
    'difficulty',
    'available_dates',
    'product_type_id',
    'product_category_id',
    'target_product_audience_id',
    'price',
    'user_id',
  ]

  requiredFields.forEach((field) => {
    if (!data[field] && data[field] !== 0) {
      errors.push(`El campo ${field} es obligatorio`)
    }
  })

  // Validar tipos específicos
  if (
    data.max_people &&
    (isNaN(Number(data.max_people)) || Number(data.max_people) <= 0)
  ) {
    errors.push('max_people debe ser un número mayor a 0')
  }

  if (
    data.duration &&
    (isNaN(Number(data.duration)) || Number(data.duration) <= 0)
  ) {
    errors.push('duration debe ser un número mayor a 0')
  }

  if (data.price && (isNaN(Number(data.price)) || Number(data.price) < 0)) {
    errors.push('price debe ser un número mayor o igual a 0')
  }

  // Validar arrays
  if (
    data.available_dates &&
    (!Array.isArray(data.available_dates) || data.available_dates.length === 0)
  ) {
    errors.push('available_dates debe ser un array con al menos una fecha')
  }

  // Validar fechas
  if (data.available_dates && Array.isArray(data.available_dates)) {
    data.available_dates.forEach((date: string, index: number) => {
      const parsed = new Date(date)
      if (isNaN(parsed.getTime())) {
        errors.push(`La fecha en posición ${index} no es válida: ${date}`)
      }
    })
  }

  // Validar dificultad
  if (
    data.difficulty &&
    !['easy', 'medium', 'hard'].includes(data.difficulty)
  ) {
    errors.push('difficulty debe ser: easy, medium o hard')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
