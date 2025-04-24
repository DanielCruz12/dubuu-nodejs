export const getRentalById = async (
  productId: string,
  baseProduct: { id: string; name: string },
) => {
  // Puedes agregar lógica específica si hay tabla Rentals u otros detalles
  return {
    ...baseProduct,
    // Aquí puedes agregar más campos específicos de la tabla Rental

    rental_details: {
      start_date: '2023-01-01',
      end_date: '2023-01-08',
      price_per_day: 100,
      total_price: 700,
    },
    // extra fields para rental si los hubiera
  }
}
