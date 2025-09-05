import { TeamsController } from "@/controllers/teams-controller"
import { verifyAuthorization } from "@/middlewares/verify-authorization"
import { Router } from "express"

const teamsRoutes = Router()
const teamsController = new TeamsController()

teamsRoutes.post("/", verifyAuthorization(["admin"]), teamsController.create)
teamsRoutes.put("/:id", verifyAuthorization(["admin"]), teamsController.update)
teamsRoutes.get("/", verifyAuthorization(["admin"]), teamsController.index)

export { teamsRoutes }