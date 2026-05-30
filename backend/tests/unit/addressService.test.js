const { createChain } = require("./testHelpers");

const mockSupabase = {
  from: jest.fn(),
};

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-address"),
}));

const addressService = require("../../src/features/address/addressService");

describe("addressService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAddressesByCustomer returns array", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({ data: [{ id: "a1" }, { id: "a2" }], error: null }),
    );

    const result = await addressService.getAddressesByCustomer("customer-1");

    expect(result).toHaveLength(2);
    expect(mockSupabase.from).toHaveBeenCalledWith("Address");
  });

  test("createAddress throws 404 when customer does not exist", async () => {
    mockSupabase.from.mockImplementationOnce(() =>
      createChain({ data: null, error: null }),
    );

    await expect(
      addressService.createAddress({
        customerId: "customer-1",
        phoneNumber: "0900000000",
        address: "123 Main",
      }),
    ).rejects.toEqual({ status: 404, message: "Customer not found" });
  });

  test("updateAddress throws 404 when address is not owned", async () => {
    mockSupabase.from.mockImplementationOnce(() =>
      createChain({ data: null, error: null }),
    );

    await expect(
      addressService.updateAddress("address-1", "customer-1", {
        address: "Updated",
      }),
    ).rejects.toEqual({
      status: 404,
      message: "Address not found or you don't have permission",
    });
  });

  test("deleteAddress blocks deletion when address is linked to orders", async () => {
    mockSupabase.from
      .mockImplementationOnce(() => createChain({ data: { id: "a1" }, error: null }))
      .mockImplementationOnce(() =>
        createChain({ data: [{ id: "order-1" }], error: null }),
      );

    await expect(
      addressService.deleteAddress("address-1", "customer-1"),
    ).rejects.toEqual({
      status: 400,
      message: "Cannot delete address that is associated with orders",
    });
  });
});
