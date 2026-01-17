// backend/src/features/variant/variantService.js
const { supabase } = require("../../configs/supabase");
const { v4: uuidv4 } = require("uuid");

const createVariant = async ({
  productId,
  quantity,
  variantAttributes,
  images,
  priceAdjustment,
  userId,
}) => {
  const now = new Date().toISOString();

  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can create variants" };
  }

  const { data: product } = await supabase
    .from("Product")
    .select("id, createdBy, is_deleted")
    .eq("id", productId)
    .eq("is_deleted", false)
    .single();

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  if (product.createdBy !== seller.id) {
    throw {
      status: 403,
      message: "You can only create variants for your own products",
    };
  }

  const { data, error } = await supabase
    .from("ProductVariant")
    .insert({
      id: uuidv4(),
      productId,
      quantity,
      variantAttributes,
      images: images || [],
      priceAdjustment: priceAdjustment || 0,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

const updateVariant = async (variantId, updates, userId) => {
  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can update variants" };
  }

  const { data: variant } = await supabase
    .from("ProductVariant")
    .select(
      `
      id,
      productId,
      Product!ProductVariant_productId_fkey(
        id,
        createdBy,
        is_deleted
      )
    `
    )
    .eq("id", variantId)
    .single();

  if (!variant) {
    throw { status: 404, message: "Product variant not found" };
  }

  if (variant.Product.is_deleted) {
    throw { status: 400, message: "Cannot update variant of deleted product" };
  }

  if (variant.Product.createdBy !== seller.id) {
    throw {
      status: 403,
      message: "You can only update variants of your own products",
    };
  }

  const updateData = { updatedAt: new Date().toISOString() };

  if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
  if (updates.variantAttributes !== undefined)
    updateData.variantAttributes = updates.variantAttributes;
  if (updates.images !== undefined) updateData.images = updates.images;
  if (updates.priceAdjustment !== undefined)
    updateData.priceAdjustment = updates.priceAdjustment;

  const { data, error } = await supabase
    .from("ProductVariant")
    .update(updateData)
    .eq("id", variantId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

const deleteVariant = async (variantId, userId) => {
  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can delete variants" };
  }

  const { data: variant } = await supabase
    .from("ProductVariant")
    .select(
      `
      id,
      productId,
      Product!ProductVariant_productId_fkey(
        id,
        createdBy
      )
    `
    )
    .eq("id", variantId)
    .single();

  if (!variant) {
    throw { status: 404, message: "Product variant not found" };
  }

  if (variant.Product.createdBy !== seller.id) {
    throw {
      status: 403,
      message: "You can only delete variants of your own products",
    };
  }

  const { error } = await supabase
    .from("ProductVariant")
    .delete()
    .eq("id", variantId);

  if (error) throw error;

  return true;
};

module.exports = {
  createVariant,
  updateVariant,
  deleteVariant,
};
