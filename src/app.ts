import express from "express"
import { routes } from "@/routes"
import { errorHandling } from "./middlewares/error-handling"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

app.use(routes)

app.use(errorHandling)

export { app }