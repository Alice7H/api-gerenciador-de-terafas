import request from "supertest"
import { app } from "@/app"
import { prisma } from "@/database/prisma"
import { env } from "@/env"

describe("The user", () => {
  let member_id: number
  let admin_id: number
  let admin_token: string
  let member_token: string

   beforeAll(async()=> {
      const adminResponse = await request(app).post("/users").send({
        name: "Admin User",
        email: "admin@email.com",
        password: "test123",
        role: "admin"
      }).query({ key: env.ADMIN_HASH })

      const memberResponse = await request(app).post("/users").send({
        name: "Member User",
        email: "member@email.com",
        password: "test123",
      })

      const adminSessionResponse = await request(app).post("/sessions").send({
        email: "admin@email.com",
        password: "test123",
      })

      const memberSessionResponse = await request(app).post("/sessions").send({
        email: "member@email.com",
        password: "test123",
      })

      admin_id = adminResponse.body.id
      member_id = memberResponse.body.id

      admin_token = adminSessionResponse.body.token
      member_token = memberSessionResponse.body.token

   })

    afterAll(async()=> {
    await prisma.users.delete({ where: { id: member_id }})
    await prisma.users.delete({ where: { id: admin_id }})
    await prisma.$disconnect()
  })

  it("should see the user list with admin role", async() => {
    const response = await request(app).get("/users").set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(200)
    expect(response.body.users.length).toBeGreaterThanOrEqual(2)
  })

  it("shouldn't see the user list with member role", async() => {
    const response = await request(app).get("/users").set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("shouldn't update the user with member role", async() => {
    const response = await request(app).patch(`/users/${member_id}`)
    .send({ role: "admin" })
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })
})