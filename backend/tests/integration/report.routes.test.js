jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      req.user = {
        userId: "admin-user-id",
        role: "ADMIN",
      };
      next();
    },
    checkRole:
      (...allowedRoles) =>
      (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource",
          });
        }

        next();
      },
  };
});

jest.mock("../../src/features/report/reportService", () => ({
  getRevenueReport: jest.fn(),
  getActivityReport: jest.fn(),
  exportRevenueToExcel: jest.fn(),
  exportActivityToExcel: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const reportService = require("../../src/features/report/reportService");

describe("Report routes", () => {
  test("GET /api/reports/revenue rejects missing dates", async () => {
    const res = await request(app).get("/api/reports/revenue");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("startDate and endDate are required");
    expect(reportService.getRevenueReport).not.toHaveBeenCalled();
  });

  test("GET /api/reports/revenue returns JSON report", async () => {
    reportService.getRevenueReport.mockResolvedValue({
      summary: {
        totalIncome: 1000000,
        totalRefund: 0,
        netRevenue: 1000000,
      },
      rows: [],
      details: {
        totalCompletedPayments: 1,
        totalApprovedReturns: 0,
        totalApprovedCancellations: 0,
      },
    });

    const res = await request(app)
      .get("/api/reports/revenue")
      .query({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Revenue report generated");
    const revenueArgs = reportService.getRevenueReport.mock.calls[0][0];
    expect(revenueArgs.groupBy).toBe("day");
    expect(revenueArgs.startDate).toMatch(/T17:00:00\.000Z$/);
    expect(revenueArgs.endDate).toMatch(/T16:59:59\.999Z$/);
  });

  test("GET /api/reports/revenue with excel format sets download headers", async () => {
    reportService.getRevenueReport.mockResolvedValue({
      summary: {
        totalIncome: 1000000,
        totalRefund: 0,
        netRevenue: 1000000,
      },
      rows: [],
      details: {
        totalCompletedPayments: 1,
        totalApprovedReturns: 0,
        totalApprovedCancellations: 0,
      },
    });
    reportService.exportRevenueToExcel.mockResolvedValue(Buffer.from("excel"));

    const res = await request(app)
      .get("/api/reports/revenue")
      .query({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        format: "excel",
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(res.headers["content-disposition"]).toContain(
      "revenue_report.xlsx",
    );
    expect(reportService.exportRevenueToExcel).toHaveBeenCalled();
  });

  test("GET /api/reports/activity returns JSON report", async () => {
    reportService.getActivityReport.mockResolvedValue({
      summary: {
        totalActiveUsers: 1,
        newUsers: 1,
        newOrders: 0,
        newReviews: 0,
        newUsersByRole: { CUSTOMER: 1 },
      },
      activities: {
        customers: [],
        sellers: [],
        admins: [],
      },
      statistics: {
        totalCustomers: 0,
        totalSellers: 0,
        totalAdmins: 0,
      },
    });

    const res = await request(app)
      .get("/api/reports/activity")
      .query({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Activity report generated");
    const activityArgs = reportService.getActivityReport.mock.calls[0][0];
    expect(activityArgs.startDate).toMatch(/T17:00:00\.000Z$/);
    expect(activityArgs.endDate).toMatch(/T16:59:59\.999Z$/);
  });
});
