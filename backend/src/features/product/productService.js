// backend/src/features/product/productService.js - FIXED VERSION
const { supabase } = require("../../configs/supabase");
const { v4: uuidv4 } = require("uuid");
const {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} = require("../../utils/uploadHelper");
// thêm hàm extractVariantMetadata để tái sử dụng
const extractVariantMetadata = (variants) => {
  if (!variants || variants.length === 0) {
    return { variantTypes: [], variantOptions: {} };
  }

  const variantTypes = new Set();
  const variantOptions = {};

  variants.forEach((variant) => {
    Object.entries(variant.variantAttributes || {}).forEach(([key, value]) => {
      variantTypes.add(key);

      if (!variantOptions[key]) {
        variantOptions[key] = new Set();
      }
      variantOptions[key].add(value);
    });
  });

  return {
    variantTypes: Array.from(variantTypes),
    variantOptions: Object.fromEntries(
      Object.entries(variantOptions).map(([key, values]) => [
        key,
        Array.from(values),
      ]),
    ),
  };
};
const syncVariantMetadata = async (productId) => {
  const { data: variants } = await supabase
    .from("ProductVariant")
    .select("variantAttributes, quantity")
    .eq("productId", productId);

  const { variantTypes, variantOptions } = extractVariantMetadata(
    variants || [],
  );

  const totalStock = (variants || []).reduce(
    (sum, v) => sum + (v.quantity || 0),
    0,
  );

  await supabase
    .from("Product")
    .update({
      variantTypes,
      variantOptions,
      stockQuantity: totalStock,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", productId);
};

const createProduct = async ({
  name,
  description,
  price,
  stockQuantity,
  categoryId,
  files,
  variants,
  createdBy,
}) => {
  const now = new Date().toISOString();

  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", createdBy)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can create products" };
  }

  const { data: category } = await supabase
    .from("Category")
    .select("id")
    .eq("id", categoryId)
    .single();

  if (!category) {
    throw { status: 400, message: "Category not found" };
  }

  const productId = uuidv4();
  let imageUrls = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const url = await uploadImageToSupabase(
        file,
        "products",
        `${productId}/`,
      );
      imageUrls.push(url);
    }
  }

  let parsedVariants = [];
  if (variants) {
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (e) {
      throw { status: 400, message: "Invalid variants format" };
    }
  }

  const { variantTypes, variantOptions } =
    extractVariantMetadata(parsedVariants);

  const finalStockQuantity =
    parsedVariants.length > 0
      ? parsedVariants.reduce((sum, v) => sum + (v.quantity || 0), 0)
      : stockQuantity || 0;

  const { data: product, error } = await supabase
    .from("Product")
    .insert({
      id: productId,
      name,
      description,
      price,
      stockQuantity: finalStockQuantity,
      categoryId,
      images: imageUrls,
      variantTypes,
      variantOptions,
      createdBy: seller.id,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) {
    if (imageUrls.length > 0) {
      for (const img of imageUrls) {
        await deleteImageFromSupabase(img, "products").catch(() => {});
      }
    }
    throw error;
  }

  if (parsedVariants.length > 0) {
    const variantRecords = parsedVariants.map((v) => ({
      id: uuidv4(),
      productId,
      quantity: v.quantity || 0,
      variantAttributes: v.variantAttributes || {},
      images: v.images || [],
      priceAdjustment: v.priceAdjustment || 0,
      createdAt: now,
      updatedAt: now,
    }));

    const { error: variantError } = await supabase
      .from("ProductVariant")
      .insert(variantRecords);

    if (variantError) {
      await supabase.from("Product").delete().eq("id", productId);
      if (imageUrls.length > 0) {
        for (const img of imageUrls) {
          await deleteImageFromSupabase(img, "products").catch(() => {});
        }
      }
      throw variantError;
    }

    const { data: productWithVariants } = await supabase
      .from("Product")
      .select(
        `
        *,
        ProductVariant(*)
      `,
      )
      .eq("id", productId)
      .single();

    return productWithVariants;
  }

  return product;
};

const updateProduct = async (productId, updates, userId, files) => {
  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can update products" };
  }

  const { data: existing } = await supabase
    .from("Product")
    .select("id, createdBy, images, variantTypes")
    .eq("id", productId)
    .eq("is_deleted", false)
    .single();

  if (!existing) {
    throw { status: 404, message: "Product not found" };
  }

  if (existing.createdBy !== seller.id) {
    throw { status: 403, message: "You can only update your own products" };
  }

  if (
    updates.stockQuantity !== undefined &&
    existing.variantTypes &&
    existing.variantTypes.length > 0
  ) {
    throw {
      status: 400,
      message:
        "Cannot manually update stockQuantity for products with variants. Stock is auto-calculated from variant quantities.",
    };
  }

  if (files && files.length > 0) {
    if (existing.images && existing.images.length > 0) {
      for (const img of existing.images) {
        await deleteImageFromSupabase(img, "products").catch(() => {});
      }
    }

    const newImages = [];
    for (const file of files) {
      const url = await uploadImageToSupabase(
        file,
        "products",
        `${productId}/`,
      );
      newImages.push(url);
    }
    updates.images = newImages;
  }

  if (updates.categoryId) {
    const { data: category } = await supabase
      .from("Category")
      .select("id")
      .eq("id", updates.categoryId)
      .single();

    if (!category) {
      throw { status: 400, message: "Category not found" };
    }
  }

  const updateData = { updatedAt: new Date().toISOString() };

  const allowedFields = [
    "name",
    "description",
    "price",
    "stockQuantity",
    "categoryId",
    "images",
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const { data, error } = await supabase
    .from("Product")
    .update(updateData)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

const getAllProducts = async ({
  page = 1,
  limit = 10,
  categoryId,
  search,
  minPrice,
  maxPrice,
  sellerId,
}) => {
  let query = supabase
    .from("Product")
    .select(
      `
      id,
      name,
      description,
      price,
      stockQuantity,
      images,
      variantTypes,
      variantOptions,
      is_deleted,
      createdAt,
      updatedAt,
      createdBy,
      categoryId,
      Category!Product_categoryId_fkey(
        id,
        name,
        description
      ),
      Seller!Product_createdBy_fkey(
        id,
        email,
        image,
        User!Seller_userId_fkey(
          id,
          username,
          email
        )
      )
    `,
      { count: "exact" },
    )
    .eq("is_deleted", false);

  if (categoryId) query = query.eq("categoryId", categoryId);
  if (sellerId) query = query.eq("createdBy", sellerId);
  if (search)
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (minPrice !== undefined) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice !== undefined) query = query.lte("price", parseFloat(maxPrice));

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order("createdAt", { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    products: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getProductById = async (productId) => {
  const { data: product, error } = await supabase
    .from("Product")
    .select(
      `
      id,
      name,
      description,
      price,
      stockQuantity,
      images,
      variantTypes,
      variantOptions,
      is_deleted,
      createdAt,
      updatedAt,
      createdBy,
      categoryId,
      Category!Product_categoryId_fkey(
        id,
        name,
        description
      ),
      Seller!Product_createdBy_fkey(
        id,
        email,
        image,
        User!Seller_userId_fkey(
          id,
          username,
          email
        )
      ),
      ProductVariant(
        id,
        quantity,
        variantAttributes,
        images,
        priceAdjustment,
        createdAt,
        updatedAt
      )
    `,
    )
    .eq("id", productId)
    .eq("is_deleted", false)
    .single();

  if (error) throw error;
  if (!product) throw { status: 404, message: "Product not found" };

  return product;
};

const deleteProduct = async (productId, userId) => {
  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can delete products" };
  }

  const { data: product } = await supabase
    .from("Product")
    .select("id, createdBy")
    .eq("id", productId)
    .eq("is_deleted", false)
    .single();

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  if (product.createdBy !== seller.id) {
    throw { status: 403, message: "You can only delete your own products" };
  }

  const { error } = await supabase
    .from("Product")
    .update({
      is_deleted: true,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) throw error;

  return true;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  syncVariantMetadata,
};
