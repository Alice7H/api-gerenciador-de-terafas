import { UsersController } from "@/controllers/users-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyAuthorization } from "@/middlewares/verify-authorization"
import { Router } from "express"

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post("/", usersController.create)

usersRoutes.use(ensureAuthenticated)
usersRoutes.patch("/:id", verifyAuthorization(["admin"]), usersController.update)
usersRoutes.get("/", verifyAuthorization(["admin"]), usersController.index)

export { usersRoutes }