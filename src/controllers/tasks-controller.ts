import { prisma } from "@/database/prisma"
import { TaskPriority, TaskStatus, UserRole } from "@prisma/client"
import { AppError } from "@/utils/AppError"
import {Request, Response } from "express"
import z from "zod"

class TasksController {
  async create(request: Request, response: Response) {
    if(!request.user?.id) throw new AppError("User not found")

    const bodySchema = z.object({
      title: z.string(),
      description: z.string().optional().default(""),
      status: z.enum(TaskStatus),
      priority: z.enum(TaskPriority),
      assignedTo: z.number(),
      teamId: z.number()
    })

    const { title, description, status, priority, assignedTo, teamId } = bodySchema.parse(request.body)

    if(assignedTo != Number(request.user.id) && request.user.role == UserRole.member) throw new AppError("Unauthorized", 401)

    const teamMembers = await prisma.teamMembers.findMany({ where: { teamId, userId: assignedTo }})
    if(teamMembers.length == 0) throw new AppError("Member or team not found", 404)

    const newTask = await prisma.tasks.create({
      data: {
        title, description, status, priority, assignedTo, teamId,
        tasksHistory: {
          create: {
            changedBy: Number(request.user.id),
            oldStatus: status,
            newStatus: status
          },
        },
      },
    })
    response.status(201).json(newTask)
  }

  async index(request: Request, response: Response) {
    if(!request.user?.id) throw new AppError("User not found")

    const querySchema = z.object({
      teamId: z.coerce.number().optional(),
      userId: z.coerce.number().optional(),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(10),
    })
    const { teamId, userId, page, perPage } = querySchema.parse(request.query)
     const skip = (page - 1) * perPage

    const tasks = await prisma.tasks.findMany({
      skip,
      take: perPage,
      where: { teamId, assignedTo: userId },
      omit: {
        assignedTo: true,
      },
      include: {
        team: { select: { name: true } },
        user: { select: { name: true} },
        tasksHistory: true,
      },
      orderBy: { id : 'asc' }
    })
    const totalRecords = await prisma.tasks.count({
      where: { teamId, assignedTo: userId },
    })
    const totalPages = Math.ceil(totalRecords / perPage)

    response.json({
      tasks,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      }
    })
  }

  async show(request: Request, response: Response) {
    if(!request.user?.id) throw new AppError("User not found")

    const paramsSchema = z.object({ id: z.coerce.number()})
    const { id } = paramsSchema.parse(request.params)

    const querySchema = z.object({
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(10),
    })
    const {page, perPage} = querySchema.parse(request.query)
    const skip = (page - 1) * perPage

    if((!id || id !== Number(request.user.id)) && request.user.role == "member") throw new AppError("Unauthorized", 401)

    const tasks = await prisma.tasks.findMany({
      skip,
      take: perPage,
      where: { assignedTo: id },
      include: {
        team: { select: { name: true } },
        user: { select: { name: true} },
        tasksHistory: true,
      },
      orderBy: { id : 'asc' }
    })

    const totalRecords = await prisma.tasks.count({ where: { assignedTo: id }})
    const totalPages = Math.ceil(totalRecords / perPage)

    response.json({
      tasks,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      }
    })
  }

  async update(request: Request, response: Response) {
    if(!request.user?.id) throw new AppError("User not found")

    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.tasks.findFirst({ where: { id } })
    if(!task) throw new AppError("Task not found", 404)

    if(task.assignedTo != Number(request.user.id) && request.user.role == UserRole.member){
      throw new AppError("Unauthorized", 401)
    }

    if(task.status == "completed") throw new AppError("The task is already completed")

      const bodySchema = z.object({
      title: z.string().optional().default(task.title),
      description: z.string().optional().default(task.description ? task.description : ""),
      status: z.enum(TaskStatus),
      priority: z.enum(TaskPriority)
    })
    const { title, description, status, priority } = bodySchema.parse(request.body)

    const updatedTask = await prisma.tasks.update({
      data : {
        title,
        description,
        status,
        priority,
      },
      where: { id: task.id }
    })

    if(status != task.status) {
      await prisma.taskHistory.create({
        data: {
          changedBy: Number(request.user.id),
          oldStatus: task.status,
          newStatus: status,
          taskId: updatedTask.id
        },
      })
    }

    response.json(updatedTask)
  }

  async delete(request: Request, response: Response) {
    if(!request.user?.id) throw new AppError("User not found")

    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.tasks.findFirst({ where: { id } })
    if(!task){ throw new AppError("Task not found", 404) }

    await prisma.taskHistory.deleteMany({where: { taskId: task.id} })
    await prisma.tasks.delete({where: { id: task.id }})

    response.status(204).json()
  }

}

export { TasksController }