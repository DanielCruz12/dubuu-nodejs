import { Request, Response } from 'express'
import { Webhook } from 'svix'
import { createUser, deleteUser, updateUser } from './user-controller'

export const handleWebHook = async (req: Request, res: Response) => {
  //* Retrieve the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    console.error('You need a WEBHOOK_SECRET in your .env')
    return res.status(500).json({ message: 'Internal server error' })
  }

  //* Extract the headers and raw payload
  const headers = req.headers
  const payload = req.body
  const rawBody = payload.toString('utf8')

  //* Extract Svix-specific headers
  const svix_id = headers['svix-id'] as string
  const svix_timestamp = headers['svix-timestamp'] as string
  const svix_signature = headers['svix-signature'] as string

  //* Check for missing Svix headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ message: 'Missing Svix headers' })
  }

  //* Create a new Svix webhook instance with the secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any = null

  try {
    //* Verify the webhook payload and headers
    evt = wh.verify(rawBody, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err: any) {
    console.error('Error verifying webhook:', err.message)
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  const { email_addresses, first_name, last_name, id, username } = evt.data
  const eventType = evt.type

  try {
    let result

    switch (eventType) {
      // User related events
      case 'user.created':
      case 'user.createdAtEdge':
        result = await createUser({
          body: {
            email: email_addresses[0].email_address,
            id,
            first_name: `${first_name}`,
            last_name: `${last_name}`,
            username,
          },
        } as Request)
        break

      case 'user.updated':
        result = await updateUser({
          params: { id },
          body: {
            email: email_addresses[0].email_address,
            first_name,
            last_name,
            username,
          },
        } as any)
        break

        case 'user.deleted':
          result = await deleteUser({
            params: { id },
          } as any)
          break
        

      // Session related events
      case 'session.ended':
      case 'session.removed':
      case 'session.revoked':
        // Handle session events if needed
        console.log(`Session event: ${eventType}`)
        break

      // Other events
      case 'email.created':
        console.log(`Event received: ${eventType}`)

        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }
    if (!res.headersSent) {
      res
        .status(200)
        .json(
          result || {
            success: true,
            message: 'Webhook processed successfully',
          },
        )
    }
  } catch (error) {
    console.error('Error handling event:', error)
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error handling webhook event' })
    }
  }
}