/// <reference types="@clerk/express/env" />

// types/express/index.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    rawBody: string;
  }
}
