export interface CreateProductData {
  name: string
  description: string
  price: number | string
  user_id: string
  address?: string
  country: string
  product_category_id: string
  target_product_audience_id: string
  product_type_id: string
  images?: string[]
  files?: string[]
  videos?: string[]
  banner?: string
  is_approved?: boolean
  is_active?: boolean
}

export const validateProductData = (
  data: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Campos obligatorios
  const requiredFields = [
    'name',
    'description',
    'price',
    'user_id',
    'product_category_id',
    'target_product_audience_id',
    'product_type_id',
    'country',
  ]

  // Verificar campos obligatorios
  requiredFields.forEach((field) => {
    if (!data[field] && data[field] !== 0) {
      errors.push(`El campo '${field}' es obligatorio`)
    }
  })

  // Validaciones específicas
  if (data.price !== undefined) {
    const price = Number(data.price)
    if (isNaN(price) || price < 0) {
      errors.push('El precio debe ser un número válido mayor o igual a 0')
    }
  }

  if (data.name && typeof data.name !== 'string') {
    errors.push('El nombre debe ser una cadena de texto')
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('La descripción debe ser una cadena de texto')
  }

  if (data.country && typeof data.country !== 'string') {
    errors.push('El país debe ser una cadena de texto')
  }

  // Validar UUIDs
  const uuidFields = [
    'product_category_id',
    'target_product_audience_id',
    'product_type_id',
    'user_id',
  ]
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  uuidFields.forEach((field) => {
    if (data[field] && !uuidRegex.test(data[field])) {
      errors.push(`El campo '${field}' debe ser un UUID válido`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const sanitizeProductData = (data: any): CreateProductData => {
  return {
    name: String(data.name || '').trim(),
    description: String(data.description || '').trim(),
    price: Number(data.price) || 0,
    user_id: String(data.user_id || '').trim(),
    address: data.address ? String(data.address).trim() : '',
    country: String(data.country || '').trim(),
    product_category_id: String(data.product_category_id || '').trim(),
    target_product_audience_id: String(
      data.target_product_audience_id || '',
    ).trim(),
    product_type_id: String(data.product_type_id || '').trim(),
    images: Array.isArray(data.images) ? data.images : [],
    files: Array.isArray(data.files) ? data.files : [],
    videos: Array.isArray(data.videos) ? data.videos : [],
    banner: data.banner ? String(data.banner) : '',
    is_approved: Boolean(data.is_approved),
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  }
}
