import { TeamMembersController } from "@/controllers/team-members-controller"
import { verifyAuthorization } from "@/middlewares/verify-authorization"
import { Router } from "express"

const teamMembersRoutes = Router()
const teamMembersController = new TeamMembersController()

teamMembersRoutes.post("/", verifyAuthorization(["admin"]), teamMembersController.create)
teamMembersRoutes.delete("/:id", verifyAuthorization(["admin"]), teamMembersController.delete)

export { teamMembersRoutes}