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

jest.mock("../../src/features/system/systemService", () => ({
  getAllSystemConfigs: jest.fn(),
  getConfigByKey: jest.fn(),
  createConfig: jest.fn(),
  updateConfig: jest.fn(),
  deleteConfig: jest.fn(),
  getMembershipTiers: jest.fn(),
  upsertMembershipTier: jest.fn(),
  getMembershipBenefits: jest.fn(),
  upsertMembershipBenefit: jest.fn(),
  getVATRate: jest.fn(),
  updateVATRate: jest.fn(),
  getShippingFees: jest.fn(),
  upsertShippingFee: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const systemService = require("../../src/features/system/systemService");

describe("System routes", () => {
  test("GET /api/system returns grouped configs", async () => {
    systemService.getAllSystemConfigs.mockResolvedValue({
      membership: { tiers: [], benefits: [] },
      tax: { vat: null },
      shipping: { fees: [] },
    });

    const res = await request(app).get("/api/system");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("System configurations retrieved");
    expect(systemService.getAllSystemConfigs).toHaveBeenCalled();
  });

  test("POST /api/system/config rejects missing configValue", async () => {
    const res = await request(app).post("/api/system/config").send({
      configKey: "SITE_TITLE",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Config key and value are required");
    expect(systemService.createConfig).not.toHaveBeenCalled();
  });

  test("POST /api/system/config creates config when valid", async () => {
    systemService.createConfig.mockResolvedValue({
      id: "config-1",
      key: "SITE_TITLE",
      value: "ITech Shop",
    });

    const res = await request(app).post("/api/system/config").send({
      configKey: "SITE_TITLE",
      configValue: "ITech Shop",
      description: "Site title",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(systemService.createConfig).toHaveBeenCalledWith({
      configKey: "SITE_TITLE",
      configValue: "ITech Shop",
      description: "Site title",
    });
  });

  test("PUT /api/system/tax/vat rejects invalid rate type", async () => {
    const res = await request(app).put("/api/system/tax/vat").send({
      rate: "10",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("VAT rate must be a number between 0 and 100");
    expect(systemService.updateVATRate).not.toHaveBeenCalled();
  });

  test("PUT /api/system/tax/vat updates VAT rate when valid", async () => {
    systemService.updateVATRate.mockResolvedValue({
      key: "VAT_RATE",
      value: { rate: 8 },
    });

    const res = await request(app).put("/api/system/tax/vat").send({
      rate: 8,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(systemService.updateVATRate).toHaveBeenCalledWith(8);
  });
});
