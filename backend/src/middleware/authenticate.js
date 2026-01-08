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

    const { data: customer, error: customerError } = await supabase
      .from("Customer")
      .select("id")
      .eq("userId", user.id)
      .maybeSingle();

    if (customerError) {
      return errorResponse(res, 500, "Failed to fetch customer profile");
    }

    req.user = {
      userId: user.id,
      customerId: customer?.id || null,
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
