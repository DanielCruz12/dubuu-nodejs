import type { Request, Response, NextFunction } from 'express'
import {
  validateProductData,
  sanitizeProductData,
} from '../utils/product-validator'

export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Datos recibidos en middleware:', req.body)

    // Sanitizar datos
    const sanitizedData = sanitizeProductData(req.body)
    console.log('Datos sanitizados:', sanitizedData)

    // Validar datos
    const validation = validateProductData(sanitizedData)

    if (!validation.isValid) {
      console.error('Errores de validación:', validation.errors)
      return res.status(400).json({
        success: false,
        message: 'Datos de producto inválidos',
        errors: validation.errors,
      })
    }

    // Reemplazar req.body con datos sanitizados
    req.body = sanitizedData
    next()
  } catch (error) {
    console.error('Error en middleware de validación:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    })
  }
}
