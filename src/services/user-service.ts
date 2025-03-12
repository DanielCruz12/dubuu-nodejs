import { db } from "../database/db"
import { Users } from "../database/schemas"

export const getUsersService = async () => {
  return await db.select().from(Users)
}
