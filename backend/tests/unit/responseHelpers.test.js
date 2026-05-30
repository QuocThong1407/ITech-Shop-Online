const { successResponse, errorResponse } = require("../../src/utils/responseHelpers");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("responseHelpers", () => {
  test("successResponse sends success payload", () => {
    const res = createRes();

    successResponse(res, 201, { id: "x" }, "Created");

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Created",
      data: { id: "x" },
    });
  });

  test("errorResponse sends error payload", () => {
    const res = createRes();

    errorResponse(res, 400, "Bad Request", [{ field: "name" }]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bad Request",
      errors: [{ field: "name" }],
    });
  });
});
