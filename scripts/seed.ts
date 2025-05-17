// scripts/seed.ts
import { faker } from '@faker-js/faker'
import { db } from '../src/database/db'
import {
  ProductTypes,
  ProductCategories,
  TargetProductAudiences,
  Products,
  Ratings,
  Tours,
  TourDates,
  ProductAmenities,
  ProductAmenitiesProducts,
  Users,
} from '../src/database/schemas'

// Puedes ajustar cuántos items quieres crear por cada tabla
const NUM_TYPES = 1
const NUM_CATEGORIES = 5
const NUM_AUDIENCES = 300
const NUM_PRODUCTS = 1000
const NUM_USERS = 50
const NUM_RATINGS = 1000
const NUM_TOURS = 1000
const NUM_TOUR_DATES = 2000
const NUM_AMENITIES = 5000

async function seed() {
  console.log('🚀 Seeding...')

  // Insert Product Types
  const types = Array.from({ length: NUM_TYPES }).map(() => ({
    name: faker.commerce.productAdjective(),
    description: faker.lorem.sentence(),
  }))
  const insertedTypes = await db.insert(ProductTypes).values(types).returning()

  // Insert Categories
  const categories = Array.from({ length: NUM_CATEGORIES }).map(() => ({
    name: 'tours',
    description: 'Tours category',
    product_type_id: faker.helpers.arrayElement(insertedTypes).id,
  }))
  const insertedCategories = await db
    .insert(ProductCategories)
    .values(categories)
    .returning()

  // Insert Audiences
  const audiences = Array.from({ length: NUM_AUDIENCES }).map(() => ({
    name: faker.company.name(),
    description: faker.lorem.sentence(),
  }))
  const insertedAudiences = await db
    .insert(TargetProductAudiences)
    .values(audiences)
    .returning()

  // Insert fake Users (IDs como string para ejemplo)
  const users = Array.from({ length: NUM_USERS }).map(() => ({
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    bank_name: faker.company.name(),
    account_number: faker.finance.accountNumber(),
    account_type: faker.helpers.arrayElement(['Ahorro', 'Corriente']),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    id_region: faker.location.countryCode(),
  }))
  const userIds = users.map((u) => u.id)
  await db.insert(Users).values(users)

  // Insert Products
  const products = Array.from({ length: NUM_PRODUCTS }).map(() => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    user_id: faker.helpers.arrayElement(userIds),
    price: faker.commerce.price(),
    address: faker.location.streetAddress(),
    country: faker.location.country(),
    is_approved: true,
    is_active: true,
    images: [faker.image.url()],
    files: [],
    videos: [],
    banner: faker.image.url(),
    average_rating: faker.number.float({ min: 1, max: 5 }),
    total_reviews: faker.number.int({ min: 0, max: 200 }),
    target_product_audience_id:
      faker.helpers.arrayElement(insertedAudiences).id,
    product_category_id: faker.helpers.arrayElement(insertedCategories).id,
    product_type_id: faker.helpers.arrayElement(insertedTypes).id,
  }))
  const insertedProducts = await db
    .insert(Products)
    .values(
      products.map((product) => ({
        ...product,
        average_rating: product.average_rating.toString(),
      })),
    )
    .returning()

  // Insert Ratings
  const ratings = Array.from({ length: NUM_RATINGS }).map(() => ({
    user_id: faker.helpers.arrayElement(userIds),
    product_id: faker.helpers.arrayElement(insertedProducts).id,
    status: true,
    rating: faker.number.int({ min: 1, max: 5 }),
    review: faker.lorem.sentences(2),
  }))
  await db.insert(Ratings).values(ratings)

  // Insert Tours
  const tours = insertedProducts.slice(0, NUM_TOURS).map((p) => ({
    product_id: p.id,
    departure_point: faker.location.city(),
    lat: faker.location.latitude().toString(),
    long: faker.location.longitude().toString(),
    itinerary: [faker.lorem.words(3), faker.lorem.words(4)],
    highlight: faker.lorem.sentence(),
    included: faker.lorem.words(4),
    duration: faker.number.int({ min: 1, max: 10 }),
  }))
  const insertedTours = await db.insert(Tours).values(tours).returning()

  // Insert Tour Dates
  const dates = Array.from({ length: NUM_TOUR_DATES }).map(() => ({
    tour_id: faker.helpers.arrayElement(insertedTours).product_id,
    date: faker.date.future(),
    max_people: faker.number.int({ min: 5, max: 50 }),
    people_booked: faker.number.int({ min: 0, max: 50 }),
  }))
  await db.insert(TourDates).values(dates)

  // Insert Amenities
  const amenities = Array.from({ length: NUM_AMENITIES }).map(() => ({
    name: faker.word.adjective(),
    description: faker.lorem.sentence(),
    category_id: faker.helpers.arrayElement(insertedCategories).id,
  }))
  const insertedAmenities = await db
    .insert(ProductAmenities)
    .values(amenities)
    .returning()

  // Link Amenities with Products
  const amenitiesProducts = insertedAmenities.flatMap((amenity) =>
    insertedProducts.slice(0, 5).map((product) => ({
      productAmenityId: amenity.id,
      productId: product.id,
    })),
  )
  await db.insert(ProductAmenitiesProducts).values(amenitiesProducts)

  console.log('✅ Seed completo.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
