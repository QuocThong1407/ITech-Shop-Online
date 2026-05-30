const { errorHandler, notFoundHandler } = require("../../src/middleware/errorHandler");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("errorHandler", () => {
  test("uses validation error messages", () => {
    const res = createRes();
    const err = {
      name: "ValidationError",
      errors: {
        first: { message: "First invalid" },
        second: { message: "Second invalid" },
      },
    };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "First invalid, Second invalid",
    });
  });

  test("maps unique constraint errors to 409", () => {
    const res = createRes();

    errorHandler({ code: "23505", message: "duplicate" }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource already exists",
    });
  });

  test("maps foreign key errors to 400", () => {
    const res = createRes();

    errorHandler({ code: "23503", message: "fk" }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid reference to related resource",
    });
  });

  test("falls back to generic 500", () => {
    const res = createRes();

    errorHandler({ message: "Unexpected" }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected",
    });
  });
});

describe("notFoundHandler", () => {
  test("returns route not found", () => {
    const res = createRes();

    notFoundHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Route not found",
    });
  });
});
