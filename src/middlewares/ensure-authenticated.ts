import { authConfig } from "@/configs/auth";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
  role: string,
  sub: string
}

function ensureAuthenticated (request: Request, response: Response, next: NextFunction) {
  try {
    const authHeader = request.headers.authorization

    if(!authHeader) {
      throw new AppError("JWT token not found", 404)
    }

    const [, token] = authHeader.split(" ")
    const { role, sub: user_id} = verify(token, authConfig.jwt.secret) as TokenPayload

    request.user = {
      id: user_id,
      role
    }

    next()
  } catch(error) {
    if(error instanceof AppError) next(error)

    next(new AppError("Invalid JWT Token", 401))
  }
}

export { ensureAuthenticated }