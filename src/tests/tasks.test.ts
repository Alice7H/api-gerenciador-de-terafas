import request from "supertest"
import { app } from "@/app"
import { prisma } from "@/database/prisma"
import { env } from '@/env';

describe("The user", () => {
  let member_id: number
  let member2_id: number
  let admin_id: number

  let admin_token: string
  let member_token: string

  let team_id: number

  let task_id: number
  let task2_id: number
  let task3_id: number

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
      password: "test123"
    })

    const member2Response = await request(app).post("/users").send({
      name: "Member2 User",
      email: "member2@email.com",
      password: "test123"
    })

    const adminSessionResponse = await request(app).post("/sessions").send({
      email: "admin@email.com",
      password: "test123"
    })

    const memberSessionResponse = await request(app).post("/sessions").send({
      email: "member@email.com",
      password: "test123"
    })

    admin_id = adminResponse.body.id
    member_id = memberResponse.body.id
    member2_id = member2Response.body.id

    admin_token = adminSessionResponse.body.token
    member_token = memberSessionResponse.body.token

    const teamResponse = await request(app).post("/teams").send({
      name: "Test 1",
      description: "Test 1 description"
    })
    .set("Authorization", `Bearer ${admin_token}`)
    team_id = teamResponse.body.id


    await request(app).post("/team-members").send({
      userId: member_id,
      teamId: team_id
    })
    .set("Authorization", `Bearer ${admin_token}`)

    await request(app).post("/team-members").send({
      userId: member2_id,
      teamId: team_id
    })
    .set("Authorization", `Bearer ${admin_token}`)

    const taskResponse = await request(app).post("/tasks")
    .send({
      title: "Task 3",
      description: "Description about task 3",
      status: "pending",
      priority: "low",
      assignedTo: member2_id,
      teamId: team_id
    })
    .set("Authorization", `Bearer ${admin_token}`)
    task_id = taskResponse.body.id
  })

  afterAll(async() => {
    await prisma.teamMembers.deleteMany({ where: { teamId: team_id }})
    await prisma.taskHistory.deleteMany({ where: { taskId: task_id }})
    await prisma.taskHistory.deleteMany({ where: { taskId: task3_id }})
    await prisma.tasks.delete({ where: { id: task_id }})
    await prisma.tasks.delete({ where: { id: task3_id }})
    await prisma.teams.delete({ where: { id: team_id }})
    await prisma.users.delete({ where: { id: member2_id }})
    await prisma.users.delete({ where: { id: member_id }})
    await prisma.users.delete({ where: { id: admin_id }})
    await prisma.$disconnect()
  })


 it("should list task with admin role", async() => {
    const response = await request(app).get("/tasks")
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(200)
    expect(response.body.tasks.length).toBeGreaterThanOrEqual(2)
  })

  it("should list their own tasks with member role", async() => {
    const response = await request(app).get(`/tasks/${member_id}`)
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(200)
    expect(response.body.tasks.length).toBeGreaterThanOrEqual(0)
  })

  it("shouldn't list task with another user with member role", async() => {
    const response = await request(app).get(`/tasks/${member2_id}`)
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("should create task with admin role", async() => {
    const response = await request(app).post("/tasks")
    .send({
      title: "Create tests",
      description: "Description about test scenario",
      status: "pending",
      priority: "high",
      assignedTo: member_id,
      teamId: team_id
    })
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.body).toHaveProperty("id")
    expect(response.status).toBe(201)

    task2_id = response.body.id
  })

  it("should create task for himself, with member role", async() => {
    const response = await request(app).post("/tasks")
    .send({
      title: "Report test",
      description: "Description about report test",
      status: "pending",
      priority: "medium",
      assignedTo: member_id,
      teamId: team_id
    })
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.body).toHaveProperty("id")
    expect(response.status).toBe(201)

    task3_id = response.body.id
  })

  it("shouldn't create task to another user with member role", async() => {
    const response = await request(app).post("/tasks")
    .send({
      title: "Another test",
      description: "Description about another test",
      status: "pending",
      priority: "low",
      assignedTo: admin_id,
      teamId: team_id
    })
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.body.message).toBe("Unauthorized")
    expect(response.status).toBe(401)
  })

  it("should update task with admin role", async() => {
    const response = await request(app).patch(`/tasks/${task2_id}`)
    .send({
      status: "in_progress",
	    priority: "high"
    }).set("Authorization", `Bearer ${admin_token}`)

    expect(response.body).toHaveProperty("id")
    expect(response.status).toBe(200)
  })

  it("should update task for himself, with member role", async() => {
    const response = await request(app).patch(`/tasks/${task3_id}`)
    .send({
      status: "in_progress",
	    priority: "medium"
    }).set("Authorization", `Bearer ${member_token}`)

    expect(response.body).toHaveProperty("id")
    expect(response.status).toBe(200)
  })

  it("shouldn't update task to another user with member role", async() => {
    const response = await request(app).patch(`/tasks/${task_id}`)
    .send({
      status: "in_progress",
	    priority: "low"
    }).set("Authorization", `Bearer ${member_token}`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Unauthorized")
  })

  it("should remove task with admin role", async() => {
    const response = await request(app).delete(`/tasks/${task2_id}`)
    .set("Authorization", `Bearer ${admin_token}`)

    expect(response.status).toBe(204)
  })

  it("shouldn't remove task for himself, with member role", async() => {
    const response = await request(app).delete(`/tasks/${task_id}`)
    .set("Authorization", `Bearer ${member_token}`)

    expect(response.body.message).toBe("Unauthorized")
    expect(response.status).toBe(401)
  })

})