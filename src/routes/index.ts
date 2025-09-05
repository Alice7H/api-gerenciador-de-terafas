import { Router } from "express"
import { usersRoutes } from "./users-routes"
import { sessionsRoutes } from "./sessions-routes"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { teamsRoutes } from "./teams-routes"
import { teamMembersRoutes } from "./team-members-routes"
import { tasksRoutes } from "./tasks-routes"

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)

routes.use(ensureAuthenticated)
routes.use("/teams", teamsRoutes)
routes.use("/team-members", teamMembersRoutes)
routes.use("/tasks", tasksRoutes)

export { routes }