const { createChain } = require("./testHelpers");

const mockSupabase = { from: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

const ExcelJS = require("exceljs");
const reportService = require("../../src/features/report/reportService");

describe("reportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getRevenueReport aggregates income and refund", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({
          data: [
            {
              id: "p1",
              amount: 100000,
              paymentDate: "2026-01-01T10:00:00.000Z",
              orderId: "o1",
              Order: { id: "o1", status: "CONFIRMED", orderDate: "2026-01-01T00:00:00.000Z" },
            },
          ],
          error: null,
        }),
      )
      .mockImplementationOnce(() => createChain({ data: [], error: null }))
      .mockImplementationOnce(() => createChain({ data: [], error: null }));

    const result = await reportService.getRevenueReport({
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-31T23:59:59.999Z",
      groupBy: "day",
    });

    expect(result.summary.totalIncome).toBe(100000);
    expect(result.summary.netRevenue).toBe(100000);
  });

  test("exportRevenueToExcel returns buffer", async () => {
    const buffer = await reportService.exportRevenueToExcel({
      summary: { totalIncome: 1, totalRefund: 0, netRevenue: 1 },
      rows: [],
      details: {
        totalCompletedPayments: 1,
        totalApprovedReturns: 0,
        totalApprovedCancellations: 0,
      },
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
