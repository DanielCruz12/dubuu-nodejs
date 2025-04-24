/// <reference types="@clerk/express/env" />

// types/express/index.d.ts
import { Request } from 'express'
import '@clerk/express'

declare module 'express-serve-static-core' {
  interface Request {
    rawBody: string
  }
}

declare module '@clerk/express' {
  interface AuthUser {
    metadata?: {
      roles?: string[]
    }
  }
}
