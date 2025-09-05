import { Request, Response } from "express"
import { prisma } from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"

class TeamMembersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      userId: z.number(),
      teamId: z.number()
    })
    const { userId, teamId } = bodySchema.parse(request.body)

    const user = await prisma.users.findFirst({where: {id: userId }})
    if(!user) throw new AppError("Member not found", 404)

    const team = await prisma.teams.findFirst({where: {id: teamId }})
    if(!team) throw new AppError("Team not found", 404)

    const teamsMember = await prisma.teamMembers.create({
      data: {
        userId,
        teamId
      }
    })

    response.status(201).json(teamsMember)
  }

  async delete(request: Request, response: Response){
    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const teamMember = await prisma.teamMembers.findFirst({ where: { id } })
    if(!teamMember) throw new AppError("Team Member not found", 404)

    await prisma.teamMembers.delete({ where : { id: teamMember.id } })
    response.status(204).json()
  }
}
export { TeamMembersController }