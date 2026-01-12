const authService = require("./authService");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelpers");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return errorResponse(res, 400, "Missing required fields");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(res, 400, "Invalid email format");
    }

    if (password.length < 8) {
      return errorResponse(res, 400, "Password must be at least 8 characters");
    }

    const result = await authService.register({ username, email, password });
    successResponse(res, 201, result, "Registration successful");
  } catch (err) {
    errorResponse(res, err.status || 500, err.message || "Registration failed");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    const result = await authService.login({ email, password });

    successResponse(res, 200, result, "Login successful");
  } catch (err) {
    errorResponse(res, err.status || 401, err.message || "Login failed");
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return errorResponse(res, 401, "Access token required");
    }

    await authService.logout(token);
    successResponse(res, 200, null, "Logout successful");
  } catch {
    errorResponse(res, 500, "Logout failed");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    await authService.forgotPassword(email);
    successResponse(
      res,
      200,
      null,
      "If the email exists, a reset link has been sent"
    );
  } catch {
    errorResponse(res, 500, "Failed to process password reset");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword({ token, newPassword });
    successResponse(res, 200, result, "Password has been reset successfully");
  } catch (err) {
    errorResponse(
      res,
      err.status || 500,
      err.message || "Failed to reset password"
    );
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
