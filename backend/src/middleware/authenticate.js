const { createClient } = require("@supabase/supabase-js");
const { errorResponse } = require("../utils/responseHelpers");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "No token provided");
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return errorResponse(res, 401, "Invalid token");
    }

    req.user = {
      userId: user.id,
      role: user.user_metadata?.role || "CUSTOMER",
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Supabase auth error:", err);
    return errorResponse(res, 401, "Authentication failed");
  }
};

module.exports = { authenticate };
