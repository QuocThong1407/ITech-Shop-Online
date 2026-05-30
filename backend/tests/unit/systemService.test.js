const { createChain } = require("./testHelpers");

const mockSupabase = { from: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-system"),
}));

const systemService = require("../../src/features/system/systemService");

describe("systemService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createConfig stringifies object values", async () => {
    mockSupabase.from
      .mockImplementationOnce(() => createChain({ data: null, error: null }))
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "config-1",
            key: "SHIPPING_STANDARD",
            value: JSON.stringify({ baseFee: 30000 }),
          },
          error: null,
        }),
      );

    const result = await systemService.createConfig({
      configKey: "SHIPPING_STANDARD",
      configValue: { baseFee: 30000 },
      description: "Shipping",
    });

    expect(result.value).toEqual({ baseFee: 30000 });
  });

  test("getVATRate auto-creates default config when missing", async () => {
    mockSupabase.from
      .mockReturnValueOnce(
        createChain({
          data: null,
          error: { code: "PGRST116" },
        }),
      )
      .mockReturnValueOnce(createChain({ data: null, error: null }))
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "vat-1",
            key: "VAT_RATE",
            value: JSON.stringify({ rate: 10 }),
          },
          error: null,
        }),
      );

    const result = await systemService.getVATRate();

    expect(result.key).toBe("VAT_RATE");
    expect(result.value).toEqual({ rate: 10 });
  });

  test("updateVATRate rejects invalid range", async () => {
    await expect(systemService.updateVATRate(120)).rejects.toEqual({
      status: 400,
      message: "VAT rate must be between 0 and 100",
    });
  });

  test("deleteConfig blocks protected VAT_RATE", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "config-1",
          key: "VAT_RATE",
        },
        error: null,
      }),
    );

    await expect(systemService.deleteConfig("config-1")).rejects.toEqual({
      status: 403,
      message: "Cannot delete protected configuration",
    });
  });
});
