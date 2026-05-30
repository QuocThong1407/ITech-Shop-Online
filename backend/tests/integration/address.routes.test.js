jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      req.user = {
        userId: "customer-user-id",
        customerId: "customer-1",
        role: "CUSTOMER",
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
    upload: {
      any: () => (req, res, next) => {
        req.files = [];
        next();
      },
      single: () => (req, res, next) => {
        req.file = null;
        next();
      },
      array: () => (req, res, next) => {
        req.files = [];
        next();
      },
    },
  };
});

jest.mock("../../src/features/address/addressService", () => ({
  getAddressesByCustomer: jest.fn(),
  getAddressById: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const addressService = require("../../src/features/address/addressService");

describe("Address routes", () => {
  test("GET /api/addresses returns address list", async () => {
    addressService.getAddressesByCustomer.mockResolvedValue([
      { id: "address-1" },
    ]);

    const res = await request(app).get("/api/addresses");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(addressService.getAddressesByCustomer).toHaveBeenCalledWith(
      "customer-1",
    );
  });

  test("GET /api/addresses/:id returns address detail", async () => {
    addressService.getAddressById.mockResolvedValue({
      id: "address-1",
      address: "123 Main St",
    });

    const res = await request(app).get("/api/addresses/address-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(addressService.getAddressById).toHaveBeenCalledWith(
      "address-1",
      "customer-1",
    );
  });

  test("POST /api/addresses rejects missing fields", async () => {
    const res = await request(app).post("/api/addresses").send({
      phoneNumber: "",
      address: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Phone number and address are required");
    expect(addressService.createAddress).not.toHaveBeenCalled();
  });

  test("POST /api/addresses creates address", async () => {
    addressService.createAddress.mockResolvedValue({
      id: "address-1",
      address: "123 Main St",
    });

    const res = await request(app).post("/api/addresses").send({
      phoneNumber: "0900000000",
      address: "123 Main St",
      street: "Main",
      ward: "Ward 1",
      district: "District 1",
      province: "HCMC",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(addressService.createAddress).toHaveBeenCalledWith({
      customerId: "customer-1",
      phoneNumber: "0900000000",
      address: "123 Main St",
      street: "Main",
      ward: "Ward 1",
      district: "District 1",
      province: "HCMC",
    });
  });

  test("PUT /api/addresses/:id updates address", async () => {
    addressService.updateAddress.mockResolvedValue({
      id: "address-1",
      address: "456 Updated St",
    });

    const res = await request(app).put("/api/addresses/address-1").send({
      address: "456 Updated St",
      phoneNumber: "0911111111",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(addressService.updateAddress).toHaveBeenCalledWith(
      "address-1",
      "customer-1",
      {
        address: "456 Updated St",
        phoneNumber: "0911111111",
      },
    );
  });

  test("DELETE /api/addresses/:id deletes address", async () => {
    addressService.deleteAddress.mockResolvedValue(true);

    const res = await request(app).delete("/api/addresses/address-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(addressService.deleteAddress).toHaveBeenCalledWith(
      "address-1",
      "customer-1",
    );
  });
});
