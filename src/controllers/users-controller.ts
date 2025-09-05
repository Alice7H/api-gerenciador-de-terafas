import { UserRole } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"
import { hash } from "bcrypt"
import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import { env } from "@/env"

class UsersController {

  async create(request: Request, response: Response) {
    const querySchema = z.object({ key: z.string().optional() })
    const { key } = querySchema.parse(request.query)
    const validKey = env.ADMIN_HASH == key

    const bodySchema = z.object({
      name: z.string().min(3),
      email: z.email(),
      password: z.string().min(6),
      role: z.enum(UserRole).optional().default("member")
    })

    const {name, email, password, role } = bodySchema.parse(request.body)
    const userWithSameEmail = await prisma.users.findFirst({ where: { email } })

    if (userWithSameEmail) {
      throw new AppError("User with same email already exists")
    }

    const hashedPassword = await hash(password, 8)

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: validKey ? role : UserRole.member
      }
    })
    const { password: _, ...userWithoutPassword } = user;
    response.status(201).json(userWithoutPassword)
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const user = await prisma.users.findFirst({ where: { id }})
    if(!user) throw new AppError("User not found", 404)

    const bodySchema = z.object({
      name: z.string().min(3).optional().default(user.name),
      email: z.email().optional().default(user.email),
      password: z.string().optional(),
      role: z.enum(UserRole).optional().default(user.role)
    })
    const { name, email, password, role } = bodySchema.parse(request.body)

    const emailCounter = await prisma.users.count({ where: { email } })
    if (emailCounter > 1) throw new AppError("User with same email already exists")

    let hashedPassword;
    if(password) hashedPassword = await hash(password, 8)

    const newUser = await prisma.users.update({
      data: {
        name,
        email,
        password: hashedPassword ? hashedPassword : user.password,
        role
      },
      where: { id }
    })
    const { password: _, ...userWithoutPassword } = newUser;
    response.json({user: userWithoutPassword})
  }

  async index(request: Request, response: Response) {
    const querySchema = z.object({
      userId: z.coerce.number().optional(),
      role: z.enum(UserRole).optional(),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(10),
    })
    const { userId, role, page, perPage } = querySchema.parse(request.query)
    const skip = (page - 1) * perPage

    const users = await prisma.users.findMany({
      skip,
      take: perPage,
      where: { id: userId, role },
      omit: { password: true }
    })

    const totalRecords = await prisma.users.count({
      where: { id: userId, role }
    })
    const totalPages = Math.ceil(totalRecords / perPage)

    response.json({
      users,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      }
    })
  }
}

export { UsersController }