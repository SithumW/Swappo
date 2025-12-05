import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js"; //Better-auth
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// middleware/auth.js
export async function authMiddleware(req, res, next) {
  try {
    
    // Get session from BetterAuth
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
     
    

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user to request
    req.user = session.user;
    
    // Update last login (if User model has last_login field)
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { updatedAt: new Date() } // Using updatedAt since last_login might not exist
      });
    } catch (updateError) {
      // Continue even if update fails
      console.warn('Could not update user login time:', updateError.message);
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// Optional auth middleware (doesn't block if no auth)
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session && session.user) {
      req.user = session.user;
    }
    next();
  } catch (error) {
    next(); // Continue without auth
  }
}
