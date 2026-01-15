const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const register = async ({ username, email, password, password_confirmation }) => {
  if (password !== password_confirmation) {
    throw {
      status: 400,
      message: "Passwords do not match",
    }
  }

  const now = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from("User")
    .select("id")
    .or(`email.eq.${email},username.eq.${username}`);

  if (existing?.length) {
    throw { status: 400, message: "Email or username already exists" };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // tự động xác nhận email
    user_metadata: { display_name: username },
  });

  if (error) {
    throw { status: 400, message: error.message };
  }

  const authUser = data.user;

  const { error: userError } = await supabaseAdmin.from("User").insert({
    id: authUser.id,
    username,
    email,
    role: "CUSTOMER",
    createdAt: now,
    updatedAt: now,
  });

  if (userError) throw { status: 500, message: userError.message };

  const customerId = uuidv4();

  await supabaseAdmin.from("Customer").insert({
    id: customerId,
    userId: authUser.id,
    createdAt: now,
    updatedAt: now,
  });

  await supabaseAdmin.from("Cart").insert({
    id: uuidv4(),
    customerId,
    createdAt: now,
    updatedAt: now,
  });

  await supabaseAdmin.from("Membership").insert({
    id: uuidv4(),
    customerId,
    membership: "BRONZE",
    spent: 0,
    createdAt: now,
    updatedAt: now,
  });

  return {
    userId: authUser.id,
    email: authUser.email,
    role: "CUSTOMER",
  };
};

const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const authUser = data.user;
  const session = data.session;

  const { data: user } = await supabase
    .from("User")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!user) {
    throw { status: 404, message: "User profile not found" };
  }

  return {
    accessToken: session.access_token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

const logout = async (accessToken) => {
  await supabase.auth.signOut({
    accessToken,
  });
};

const forgotPassword = async (email) => {
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.RESET_PASSWORD_REDIRECT_URL,
  });
  return true;
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw { status: 400, message: "Token and newPassword are required" };
  }
  const { data, error } = await supabase.auth.updateUser(token, {
    password: newPassword,
  });

  if (error) {
    throw { status: 400, message: error.message };
  }

  return data;
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
