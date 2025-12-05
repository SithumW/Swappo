// auth.js
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:3000`,
  trustedOrigins: [
    "http://localhost:5173", // Vite frontend
    "http://localhost:3000", // Backend itself
    "http://localhost:8080", // Alternative frontend port
    "http://localhost:8081", // Alternative frontend port
    "http://localhost:8082", // Alternative frontend port
    "http://localhost:8083"  // Alternative frontend port
  ],
});
