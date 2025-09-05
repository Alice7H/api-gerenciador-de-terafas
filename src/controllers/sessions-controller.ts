import { authConfig } from "@/configs/auth"
import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import { compare } from "bcrypt"
import { Request, Response } from "express"
import { sign, SignOptions } from "jsonwebtoken"
import z from "zod"

class SessionsController {
  async create(request: Request, response: Response) {
     const bodySchema = z.object({
      email: z.email(),
      password: z.string().min(6)
    })

    const { email, password } = bodySchema.parse(request.body)
    const user = await prisma.users.findFirst({where: { email }})

    if(!user){
      throw new AppError("Invalid email or password", 401)
    }

    const passwordMatched = await compare(password, user.password)

    if(!passwordMatched) {
      throw new AppError("Invalid email or password", 401)
    }

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({ role: user.role ?? "member" }, secret, {
      subject: user.id.toString(),
      expiresIn
    } as SignOptions)

    const {password: _, ...userWithoutPassword} = user

    return response.json({ token, user: userWithoutPassword })
  }
}

export { SessionsController }