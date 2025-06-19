import { db } from '../database/db'
import { ProductAmenitiesProducts, Rentals } from '../database/schemas'

export const createRentalHandler = async (data: any, productId: string) => {
  const {
    brand,
    model,
    year,
    condition = 'used',
    mileage,
    transmission,
    seating_capacity,
    pickup_location,
    max_delivery_distance_km = 15,
    base_delivery_fee = '2.00',
    fee_per_km = '1.00',
    offers_delivery = false,
    price_per_day,
    available_from,
    available_until,
    is_available = true,
    fuel_type,
    type_car,
    color,
    doors,
    engine,
    amenities = [],
  } = data

  // ✅ Parsear campos que vienen como JSON strings
  let parsedAmenities = amenities

  try {
    // Parsear amenities si es string
    if (typeof amenities === 'string') {
      parsedAmenities = JSON.parse(amenities)
    }
  } catch (error) {
    throw new Error('Error al parsear los datos JSON del rental.')
  }

  // ✅ Convertir números y fechas
  const numericYear = Number(year)
  const numericMileage = Number(mileage)
  const numericSeatingCapacity = Number(seating_capacity)
  const numericMaxDeliveryDistance = Number(max_delivery_distance_km)
  const numericDoors = Number(doors)

  // ✅ Convertir fechas
  const parsedAvailableFrom = new Date(available_from)
  const parsedAvailableUntil = new Date(available_until)

  // ✅ Validaciones obligatorias
  if (
    !brand ||
    !model ||
    !year ||
    isNaN(numericYear) ||
    !mileage ||
    isNaN(numericMileage) ||
    !transmission ||
    !seating_capacity ||
    isNaN(numericSeatingCapacity) ||
    !pickup_location ||
    !price_per_day ||
    !available_from ||
    !available_until ||
    !fuel_type ||
    !type_car ||
    !color ||
    !doors ||
    isNaN(numericDoors) ||
    !engine
  ) {
    throw new Error('Faltan campos obligatorios para el producto tipo Rental.')
  }

  // ✅ Validar enums
  const validConditions = ['new', 'used', 'refurbished']
  const validTransmissions = ['automatic', 'manual']
  const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid']
  const validCarTypes = ['sedan', 'SUV', 'pickup', 'truck', 'van']

  if (!validConditions.includes(condition)) {
    throw new Error(
      `Condición inválida. Debe ser: ${validConditions.join(', ')}`,
    )
  }

  if (!validTransmissions.includes(transmission)) {
    throw new Error(
      `Transmisión inválida. Debe ser: ${validTransmissions.join(', ')}`,
    )
  }

  if (!validFuelTypes.includes(fuel_type)) {
    throw new Error(
      `Tipo de combustible inválido. Debe ser: ${validFuelTypes.join(', ')}`,
    )
  }

  if (!validCarTypes.includes(type_car)) {
    throw new Error(
      `Tipo de carro inválido. Debe ser: ${validCarTypes.join(', ')}`,
    )
  }

  // ✅ Validar fechas
  if (isNaN(parsedAvailableFrom.getTime())) {
    throw new Error('La fecha de disponibilidad inicial no es válida.')
  }

  if (isNaN(parsedAvailableUntil.getTime())) {
    throw new Error('La fecha de disponibilidad final no es válida.')
  }

  if (parsedAvailableUntil <= parsedAvailableFrom) {
    throw new Error('La fecha final debe ser posterior a la fecha inicial.')
  }

  // ✅ Validar que no exceda 15 días
  const diffTime =
    parsedAvailableUntil.getTime() - parsedAvailableFrom.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 15) {
    throw new Error('El período de disponibilidad no puede exceder 15 días.')
  }

  // ✅ Validar rangos numéricos
  if (numericYear < 1900 || numericYear > new Date().getFullYear() + 1) {
    throw new Error('El año del vehículo no es válido.')
  }

  if (numericMileage < 0) {
    throw new Error('El kilometraje no puede ser negativo.')
  }

  if (numericSeatingCapacity < 1 || numericSeatingCapacity > 50) {
    throw new Error('La capacidad de asientos debe estar entre 1 y 50.')
  }

  if (numericDoors < 2 || numericDoors > 6) {
    throw new Error('El número de puertas debe estar entre 2 y 6.')
  }

  // ✅ Insertar en tabla rentals
  await db.insert(Rentals).values({
    product_id: productId,
    brand: brand.trim(),
    model: model.trim(),
    year: numericYear,
    condition,
    mileage: numericMileage,
    transmission,
    seating_capacity: numericSeatingCapacity,
    pickup_location: pickup_location.trim(),
    max_delivery_distance_km: numericMaxDeliveryDistance,
    base_delivery_fee,
    fee_per_km,
    offers_delivery,
    price_per_day,
    available_from: parsedAvailableFrom.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
    available_until: parsedAvailableUntil.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
    is_available,

    fuel_type,
    type_car,
    color: color.trim(),
    doors: numericDoors,
    engine: engine.trim(),
  })

  // ✅ Insertar amenities relacionados (solo si hay amenities)
  if (Array.isArray(parsedAmenities) && parsedAmenities.length > 0) {
    const amenityRows = parsedAmenities.map((amenityId: string) => ({
      productId: productId,
      productAmenityId: amenityId,
    }))

    await db.insert(ProductAmenitiesProducts).values(amenityRows).execute()
  }
}
