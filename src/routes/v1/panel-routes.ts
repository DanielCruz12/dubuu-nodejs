import express from 'express'
import {
  getSummary,
  getActiveReservations,
  getRevenue,
  getFrequentTravelers,
  getActivity,
  getUpcoming,
} from '../../controllers/panel-controller'

const router = express.Router()

/**
 * @openapi
 * /api/v1/panel/summary/{userId}:
 *   get:
 *     tags: [Panel]
 *     summary: Resumen completo del panel
 *     description: Devuelve todas las métricas del panel en una sola respuesta. userId en la URL (igual que bookings).
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, description: "ID del host (Clerk, ej. user_2wNKuz5STr5t4gumnybinqspjIV)" }
 *     responses:
 *       200: { description: "Resumen del panel" }
 *       400: { description: "userId required" }
 */
router.get('/summary/:userId', getSummary)

/**
 * @openapi
 * /api/v1/panel/active-reservations:
 *   get:
 *     tags: [Panel]
 *     summary: Reservas activas
 *     description: Cantidad de reservas activas (no canceladas) que otros usuarios tienen sobre los productos listados por el host. Incluye comparación con el mes pasado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: "ID del host" }
 *     responses:
 *       200: { description: "total, changeFromLastMonth, thisMonth, lastMonth" }
 *       400: { description: "userId es obligatorio en el body" }
 *   post:
 *     tags: [Panel]
 *     summary: Reservas activas (POST)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: "total, changeFromLastMonth, thisMonth, lastMonth" }
 */
router.get('/active-reservations', getActiveReservations)
router.post('/active-reservations', getActiveReservations)

/**
 * @openapi
 * /api/v1/panel/revenue:
 *   get:
 *     tags: [Panel]
 *     summary: Ingresos totales
 *     description: Suma de ingresos por reservas completadas en los productos listados por el host. Incluye comparación con el año pasado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: "ID del host" }
 *     responses:
 *       200: { description: "total, percentChangeFromLastYear, thisYearTotal, lastYearTotal" }
 *       400: { description: "userId es obligatorio en el body" }
 *   post:
 *     tags: [Panel]
 *     summary: Ingresos totales (POST)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: "total, percentChangeFromLastYear, etc." }
 */
router.get('/revenue', getRevenue)
router.post('/revenue', getRevenue)

/**
 * @openapi
 * /api/v1/panel/frequent-travelers:
 *   get:
 *     tags: [Panel]
 *     summary: Viajeros frecuentes
 *     description: Cantidad de personas que han reservado 2 o más veces en los productos del host (grupo habitual).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: "ID del host" }
 *     responses:
 *       200: { description: "Objeto con count" }
 *       400: { description: "userId es obligatorio en el body" }
 *   post:
 *     tags: [Panel]
 *     summary: Viajeros frecuentes (POST)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: "Objeto con count" }
 */
router.get('/frequent-travelers', getFrequentTravelers)
router.post('/frequent-travelers', getFrequentTravelers)

/**
 * @openapi
 * /api/v1/panel/activity:
 *   get:
 *     tags: [Panel]
 *     summary: Actividad de reservas (12 meses)
 *     description: Cantidad de reservas por mes en los últimos 12 meses sobre los productos del host. Para el gráfico del panel.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: "ID del host" }
 *     responses:
 *       200: { description: "Array de objetos con month, label, year, count" }
 *       400: { description: "userId es obligatorio en el body" }
 *   post:
 *     tags: [Panel]
 *     summary: Actividad 12 meses (POST)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: "Array por mes" }
 */
router.get('/activity', getActivity)
router.post('/activity', getActivity)

/**
 * @openapi
 * /api/v1/panel/upcoming:
 *   get:
 *     tags: [Panel]
 *     summary: Próximas reservas
 *     description: Lista de reservas con fecha futura sobre los productos del host. Opcional query limit (default 10, máx 50).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: "ID del host" }
 *     responses:
 *       200: { description: "Objeto con reservations (array) y total" }
 *       400: { description: "userId es obligatorio en el body" }
 *   post:
 *     tags: [Panel]
 *     summary: Próximas reservas (POST)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: "Objeto con reservations (array) y total" }
 */
router.get('/upcoming', getUpcoming)
router.post('/upcoming', getUpcoming)

export { router as panelRoutes }
