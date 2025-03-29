import express from 'express'
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../../controllers/roles-controller'

const router = express.Router()

router.get('/', getRoles)            // GET /roles -> lista todos los roles
router.get('/:id', getRoleById)        // GET /roles/:id -> obtiene un rol por ID
router.post('/', createRole)           // POST /roles -> crea un nuevo rol
router.put('/:id', updateRole)         // PUT /roles/:id -> actualiza un rol existente
router.delete('/:id', deleteRole)      // DELETE /roles/:id -> elimina un rol por ID

export { router as rolesRoutes }
