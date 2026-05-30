process.env.NODE_ENV = "test";

process.env.SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1";
process.env.SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-role-key";

process.env.EMAIL_VERIFICATION_REDIRECT_URL =
  process.env.EMAIL_VERIFICATION_REDIRECT_URL ||
  "http://localhost:5173/verify-email";
process.env.RESET_PASSWORD_REDIRECT_URL =
  process.env.RESET_PASSWORD_REDIRECT_URL ||
  "http://localhost:5173/reset-password";
process.env.FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

process.env.VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || "TESTTMNCODE";
process.env.VNPAY_HASH_SECRET =
  process.env.VNPAY_HASH_SECRET || "test-vnpay-hash-secret";
process.env.VNPAY_URL =
  process.env.VNPAY_URL ||
  "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
