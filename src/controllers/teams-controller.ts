import { Request, Response } from "express"
import { prisma } from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"

class TeamsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string(),
      description: z.string().optional().default("")
    })
    const { name, description } = bodySchema.parse(request.body)
    const team = await prisma.teams.create({
      data: {
        name,
        description
      }
    })
    response.status(201).json(team)
  }

  async update(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.coerce.number()
    })
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      name: z.string(),
      description: z.string().optional()
    })
    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.teams.findFirst({ where: { id } })

    if(!team){
      throw new AppError("Team not found", 404)
    }

    const updatedTeam = await prisma.teams.update({
      data : {
        name,
        description: description ? description : team.description
      },
      where: { id: team.id }
    })

    response.json(updatedTeam)
  }

  async index(request: Request, response: Response){
    const querySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(10),
    })

    const { name, description, page, perPage } = querySchema.parse(request.query)
    const skip = (page - 1) * perPage

    const teams = await prisma.teams.findMany({
      skip,
      take: perPage,
      where: {
        name: { contains: name, mode: "insensitive" },
        description: { contains: description, mode: "insensitive" }
      },
    })

    const totalRecords = await prisma.teams.count({
      where: {
        name: { contains: name, mode: "insensitive"},
        description: {  contains: description, mode: "insensitive" }
      }
    })
    const totalPages = Math.ceil(totalRecords / perPage)

    response.json({
      teams,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      }
    })
  }
}

export { TeamsController }