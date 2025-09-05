import request from "supertest"
import { app } from "@/app"
import { prisma } from "@/database/prisma"
import { env } from "@/env"

describe("The user", () => {
  let member_id: number
  let admin_id: number
  let admin_token: string
  let member_token: string
  let team_id: number
  let team_members_id: number

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

  afterAll(async() => {
    await prisma.users.delete({ where: { id: member_id }})
    await prisma.users.delete({ where: { id: admin_id }})
    await prisma.teams.delete({ where: { id: team_id }})

    await prisma.$disconnect()
  })

  it("should create a team with admin role", async() => {
    const response = await request(app)
    .post("/teams")
    .send({
      name: "Squad test",
	    description: "Test with description"
    })
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")

    team_id = response.body.id
  })

  it("should update a team with admin role", async() => {
    const response = await request(app).put(`/teams/${team_id}`)
    .send({
      name: "Squad test modified",
	    description: "Test changed with description"
    })
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(200)
    expect(response.body.name).toBe("Squad test modified")
  })

  it("should list a team with admin role", async() => {
    const response = await request(app).get("/teams").set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("teams")
    expect(response.body.teams.length).toBeGreaterThanOrEqual(1)
  })

  it("shouldn't list a team with member role", async() => {
    const response = await request(app).get("/teams").set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("should add a member with admin role", async() => {
    const response = await request(app)
    .post("/team-members")
    .send({
      	userId: member_id,
	      teamId: team_id
    })
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")

    team_members_id = response.body.id
  })

  it("shouldn't create a team with member role", async() => {
    const response = await request(app)
    .post("/teams")
    .send({
      name: "Squad test 2",
	    description: "Test 2 with description"
    })
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

   it("shouldn't update a team with member role", async() => {
    const response = await request(app).put(`/teams/${team_id}`)
    .send({
      name: "Squad test 2 modified",
	    description: "Test 2 changed with description"
    })
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("shouldn't add another member with member role", async() => {
    const response = await request(app)
    .post("/team-members")
    .send({
      	"userId": admin_id,
	      "teamId": team_id
    })
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("shouldn't remove a member with member role", async() => {
    const response = await request(app)
    .delete(`/team-members/${team_members_id}`)
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("should remove a member with admin role", async() => {
    const response = await request(app)
    .delete(`/team-members/${team_members_id}`)
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(204)
  })

})