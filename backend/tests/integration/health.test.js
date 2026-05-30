const request = require("supertest");
const app = require("../../src/app");

describe("Health and fallback routes", () => {
  test("GET /health returns server status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "OK",
      message: "Server is running",
    });
  });

  test("GET unknown route returns 404", async () => {
    const res = await request(app).get("/this-route-does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });
});
