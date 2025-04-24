import { Request, Response, NextFunction } from 'express'
import { getAuth, clerkClient } from '@clerk/express'

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = getAuth(req)

      if (!userId) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const user = await clerkClient.users.getUser(userId)

      const userRoles = user.publicMetadata?.roles

      if (!Array.isArray(userRoles)) {
        return res
          .status(403)
          .json({ message: 'El usuario no tiene roles asignados' })
      }

      const hasRole = userRoles.some((role) => roles.includes(role))

      if (!hasRole) {
        return res
          .status(403)
          .json({ message: 'Acceso denegado: rol no permitido' })
      }

      next()
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Error validando rol' })
    }
  }
}
