// backend/src/features/promotion/promotionService.js
const { supabase } = require("../../configs/supabase");
const { v4: uuidv4 } = require("uuid");

const getAllPromotions = async ({ page = 1, limit = 10, status, search }) => {
  let query = supabase.from("Promotion").select(
    `
      id,
      name,
      description,
      startDate,
      endDate,
      status,
      createdAt,
      updatedAt,
      createdBy,
      Admin!Promotion_createdBy_fkey(
        id,
        User!Admin_userId_fkey(
          id,
          username,
          email
        )
      )
    `,
    { count: "exact" }
  );

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order("createdAt", { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    promotions: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getPromotionById = async (promotionId) => {
  const { data: promotion, error } = await supabase
    .from("Promotion")
    .select(
      `
      id,
      name,
      description,
      startDate,
      endDate,
      status,
      createdAt,
      updatedAt,
      createdBy,
      Admin!Promotion_createdBy_fkey(
        id,
        User!Admin_userId_fkey(
          id,
          username,
          email
        )
      ),
      Coupon(
        id,
        code,
        discountPercentage,
        maxUsage,
        usageCount
      ),
      ClearanceEvent(
        id,
        clearanceLevel
      )
    `
    )
    .eq("id", promotionId)
    .single();

  if (error) throw error;
  if (!promotion) throw { status: 404, message: "Promotion not found" };

  // Get associated products
  const { data: products } = await supabase
    .from("_PromotionProducts")
    .select(
      `
      Product!_PromotionProducts_A_fkey(
        id,
        name,
        price,
        images
      )
    `
    )
    .eq("B", promotionId);

  // Get associated categories
  const { data: categories } = await supabase
    .from("_PromotionCategories")
    .select(
      `
      Category!_PromotionCategories_A_fkey(
        id,
        name,
        description
      )
    `
    )
    .eq("B", promotionId);

  return {
    ...promotion,
    products: products?.map((p) => p.Product) || [],
    categories: categories?.map((c) => c.Category) || [],
  };
};

const createPromotion = async ({
  name,
  description,
  startDate,
  endDate,
  createdBy,
}) => {
  const now = new Date().toISOString();

  // Verify that createdBy is an admin
  const { data: admin } = await supabase
    .from("Admin")
    .select("id")
    .eq("userId", createdBy)
    .single();

  if (!admin) {
    throw { status: 403, message: "Only admins can create promotions" };
  }

  const { data, error } = await supabase
    .from("Promotion")
    .insert({
      id: uuidv4(),
      name,
      description: description || null,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      createdBy: admin.id,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

const updatePromotion = async (
  promotionId,
  { name, description, startDate, endDate }
) => {
  const { data: existing } = await supabase
    .from("Promotion")
    .select("id")
    .eq("id", promotionId)
    .single();

  if (!existing) {
    throw { status: 404, message: "Promotion not found" };
  }

  const updateData = { updatedAt: new Date().toISOString() };

  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (startDate) updateData.startDate = new Date(startDate).toISOString();
  if (endDate) updateData.endDate = new Date(endDate).toISOString();

  const { data, error } = await supabase
    .from("Promotion")
    .update(updateData)
    .eq("id", promotionId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

const updatePromotionStatus = async (promotionId, status) => {
  const { data: existing } = await supabase
    .from("Promotion")
    .select("id")
    .eq("id", promotionId)
    .single();

  if (!existing) {
    throw { status: 404, message: "Promotion not found" };
  }

  const { data, error } = await supabase
    .from("Promotion")
    .update({
      status,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", promotionId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

const deletePromotion = async (promotionId) => {
  const { data: promotion } = await supabase
    .from("Promotion")
    .select("id")
    .eq("id", promotionId)
    .single();

  if (!promotion) {
    throw { status: 404, message: "Promotion not found" };
  }

  // Delete related records first
  await supabase.from("Coupon").delete().eq("promotionId", promotionId);
  await supabase.from("ClearanceEvent").delete().eq("promotionId", promotionId);
  await supabase.from("_PromotionProducts").delete().eq("B", promotionId);
  await supabase.from("_PromotionCategories").delete().eq("B", promotionId);

  const { error } = await supabase
    .from("Promotion")
    .delete()
    .eq("id", promotionId);

  if (error) throw error;

  return true;
};

const applyPromotionToProducts = async (promotionId, productIds) => {
  const { data: promotion } = await supabase
    .from("Promotion")
    .select("id")
    .eq("id", promotionId)
    .single();

  if (!promotion) {
    throw { status: 404, message: "Promotion not found" };
  }

  // Verify all products exist
  const { data: products } = await supabase
    .from("Product")
    .select("id")
    .in("id", productIds);

  if (!products || products.length !== productIds.length) {
    throw { status: 400, message: "One or more products not found" };
  }

  // Delete existing associations
  await supabase.from("_PromotionProducts").delete().eq("B", promotionId);

  // Create new associations
  const associations = productIds.map((productId) => ({
    A: productId,
    B: promotionId,
  }));

  const { error } = await supabase
    .from("_PromotionProducts")
    .insert(associations);

  if (error) throw error;

  return {
    promotionId,
    appliedProductsCount: productIds.length,
  };
};

const applyPromotionToCategories = async (promotionId, categoryIds) => {
  const { data: promotion } = await supabase
    .from("Promotion")
    .select("id")
    .eq("id", promotionId)
    .single();

  if (!promotion) {
    throw { status: 404, message: "Promotion not found" };
  }

  // Verify all categories exist
  const { data: categories } = await supabase
    .from("Category")
    .select("id")
    .in("id", categoryIds);

  if (!categories || categories.length !== categoryIds.length) {
    throw { status: 400, message: "One or more categories not found" };
  }

  // Delete existing associations
  await supabase.from("_PromotionCategories").delete().eq("B", promotionId);

  // Create new associations
  const associations = categoryIds.map((categoryId) => ({
    A: categoryId,
    B: promotionId,
  }));

  const { error } = await supabase
    .from("_PromotionCategories")
    .insert(associations);

  if (error) throw error;

  return {
    promotionId,
    appliedCategoriesCount: categoryIds.length,
  };
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  updatePromotionStatus,
  deletePromotion,
  applyPromotionToProducts,
  applyPromotionToCategories,
};
