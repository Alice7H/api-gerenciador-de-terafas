import { TasksController } from "@/controllers/tasks-controller"
import { verifyAuthorization } from "@/middlewares/verify-authorization"
import { Router } from "express"

const tasksRoutes = Router()
const tasksController = new TasksController()

tasksRoutes.get("/", verifyAuthorization(["admin"]) ,tasksController.index)
tasksRoutes.get("/:id", verifyAuthorization(["member", "admin"]) ,tasksController.show)
tasksRoutes.post("/", verifyAuthorization(["member", "admin"]) ,tasksController.create)
tasksRoutes.patch("/:id", verifyAuthorization(["member", "admin"]) ,tasksController.update)
tasksRoutes.delete("/:id", verifyAuthorization(["admin"]) ,tasksController.delete)

export { tasksRoutes }