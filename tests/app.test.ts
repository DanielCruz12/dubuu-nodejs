import request from 'supertest'
import app from '../src/app'
describe('GET /api/v1/users/', () => {
  test('should return an array', async () => {
    const response = await request(app).get('/api/v1/users/')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  test('should return products with correct structure', async () => {
    const response = await request(app).get('/api/v1/users/')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(0)
  })
})
