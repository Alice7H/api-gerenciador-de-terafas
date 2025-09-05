import request from "supertest"
import { app } from "@/app"
import { prisma } from "@/database/prisma"
import jwt, { SignOptions } from "jsonwebtoken"
import { authConfig } from "@/configs/auth"
import { env } from "@/env"

describe("The user", () => {
  let user_id: number
  let admin_id: number

  afterAll(async()=> {
    await prisma.users.delete({ where: { id: user_id }})
    await prisma.users.delete({ where: { id: admin_id }})
    await prisma.$disconnect()
  })

  it("should create a new user", async() => {
    const response = await request(app).post("/users").send({
      name: "Test User",
      email: "test@email.com",
      password: "test123",
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe("Test User")

    user_id = Number(response.body.id)
  })

  it("should receive an error registering with an email that already exists", async() => {
    const response = await request(app).post("/users").send({
      name: "Another test user",
      email: "test@email.com",
      password: "other123",
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("User with same email already exists")
  })

  it("should create an admin user", async() => {
    const response = await request(app).post(`/users`)
    .send({
      name: "Test Admin User",
      email: "admin@email.com",
      password: "admin123",
      role: "admin"
    })
    .query({ key: env.ADMIN_HASH })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe("Test Admin User")
    expect(response.body.role).toBe("admin")

    admin_id = Number(response.body.id)
  })

  it("should login with valid credentials", async() => {
    const response = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "test123",
    })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
    expect(typeof response.body.token).toBe('string')
  })

  it("shouldn't login with invalid user", async() => {
    const response = await request(app).post("/sessions").send({
      email: "anotherTest@email.com",
      password: "test123",
    })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Invalid email or password")
  })

  it("shouldn't login with invalid password", async() => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "wrong_password"
    })

    expect(sessionResponse.status).toBe(401)
    expect(sessionResponse.body.message).toBe("Invalid email or password")
  })

  it("shouldn't login with expired token", async() => {
    const {secret} = authConfig.jwt
    const expiredToken = jwt.sign({role: "admin"}, secret, {
      subject: admin_id.toString(),
      expiresIn: '0s'
    } as SignOptions)

    const response = await request(app)
    .get("/users")
    .set("Authorization", `Bearer ${expiredToken}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Invalid JWT Token")
  })
})
