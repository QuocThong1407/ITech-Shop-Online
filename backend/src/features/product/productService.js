// backend/src/features/product/productService.js
const { supabase } = require("../../configs/supabase");
const { v4: uuidv4 } = require("uuid");
const {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} = require("../../utils/uploadHelper");

//trích xuất metadata từ danh sách variants
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

//Đồng bộ metadata variant cho product (variantTypes, variantOptions, stockQuantity)
const syncVariantMetadata = async (productId) => {
  const { data: variants } = await supabase
    .from("ProductVariant")
    .select("variantAttributes, quantity")
    .eq("productId", productId);

  const { variantTypes, variantOptions } = extractVariantMetadata(
    variants || [],
  );

  // tổng stock = tổng quantity của tất cả variants
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

// Admin tạo product
const createProduct = async ({
  name,
  description,
  price,
  stockQuantity,
  categoryId,
  sellerUserId,
  files,
  variants,
  createdBy,
}) => {
  const now = new Date().toISOString();

  const { data: admin } = await supabase
    .from("Admin")
    .select("id")
    .eq("userId", createdBy)
    .single();

  if (!admin) {
    throw { status: 403, message: "Only admins can create products" };
  }

  // Kiểm tra seller
  const { data: seller, error: sellerError } = await supabase
    .from("Seller")
    .select("id, userId, User!Seller_userId_fkey(username, email)")
    .eq("userId", sellerUserId)
    .single();

  if (sellerError || !seller) {
    throw {
      status: 400,
      message: "Seller not found. Please provide a valid seller ID.",
    };
  }

  // kt category
  const { data: category } = await supabase
    .from("Category")
    .select("id")
    .eq("id", categoryId)
    .single();

  if (!category) {
    throw { status: 400, message: "Category not found" };
  }

  const productId = uuidv4();
  let productImages = [];

  // upload ảnh
  const mainFiles = files ? files.filter((f) => f.fieldname === "images") : [];

  if (mainFiles.length > 0) {
    for (const file of mainFiles) {
      const url = await uploadImageToSupabase(
        file,
        "products",
        `${productId}/`,
      );
      productImages.push(url);
    }
  }

  // xử lý variants
  let parsedVariants = [];
  if (variants) {
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (e) {
      throw { status: 400, message: "Invalid variants format" };
    }
  }

  const safeParsedVariants = Array.isArray(parsedVariants)
    ? parsedVariants
    : [];

  // tạo metadata variant
  const { variantTypes, variantOptions } =
    extractVariantMetadata(parsedVariants);

  // Nếu có variant thì stock = tổng quantity variant
  // Nếu không có variant thì dùng stockQuantity nhập vào
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
      images: productImages,
      variantTypes,
      variantOptions,
      createdBy: seller.id, // gán product cho seller
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) {
    for (const img of productImages)
      await deleteImageFromSupabase(img, "products").catch(() => {});
    throw error;
  }

  if (safeParsedVariants.length > 0) {
    const variantRecords = [];

    for (let i = 0; i < safeParsedVariants.length; i++) {
      const v = safeParsedVariants[i];
      let variantImageUrls = [];

      // upload ảnh variant nếu có
      const variantFileKey = `variant_image_${i}`;
      const specificFile = files
        ? files.find((f) => f.fieldname === variantFileKey)
        : null;

      if (specificFile) {
        const vId = uuidv4();
        const url = await uploadImageToSupabase(
          specificFile,
          "products",
          `variant-images/${productId}/${vId}/`,
        );
        variantImageUrls.push(url);
      }

      variantRecords.push({
        id: uuidv4(),
        productId,
        quantity: v.quantity || 0,
        variantAttributes: v.variantAttributes || v.attributes || {},
        images: variantImageUrls,
        priceAdjustment: v.priceAdjustment || 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    const { error: variantError } = await supabase
      .from("ProductVariant")
      .insert(variantRecords);

    if (variantError) {
      await supabase.from("Product").delete().eq("id", productId);
      throw variantError;
    }
  }

  return product;
};

// Admin cập nhật product
const updateProduct = async (productId, updates, userId, files) => {
  const { data: admin } = await supabase
    .from("Admin")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!admin) {
    throw { status: 403, message: "Only admins can update products" };
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
  // Cập nhật ảnh
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

  // kt category nếu có cập nhật
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
  //  k sửa stock nếu product có variant
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
  // các field admin được phép update
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

//seller chỉ cập nhật stock (ko có variant)
const updateProductStock = async (productId, stockQuantity, userId) => {
  const { data: seller } = await supabase
    .from("Seller")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!seller) {
    throw { status: 403, message: "Only sellers can update stock" };
  }

  const { data: existing } = await supabase
    .from("Product")
    .select("id, createdBy, variantTypes")
    .eq("id", productId)
    .eq("is_deleted", false)
    .single();

  if (!existing) {
    throw { status: 404, message: "Product not found" };
  }

  // có variant → không update ở đây
  if (existing.variantTypes && existing.variantTypes.length > 0) {
    throw {
      status: 400,
      message:
        "This product has variants. Please update variant quantities instead.",
    };
  }

  // chỉ sửa product của mình
  if (existing.createdBy !== seller.id) {
    throw {
      status: 403,
      message: "You can only update stock for products assigned to you",
    };
  }

  const { data, error } = await supabase
    .from("Product")
    .update({
      stockQuantity,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Lấy danh sách product với phân trang và lọc
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
      `id, name, description, price, stockQuantity, images, variantTypes, variantOptions, is_deleted, createdAt, updatedAt, createdBy, categoryId,
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

// Lấy chi tiết product theo ID
const getProductById = async (productId) => {
  const { data: product, error } = await supabase
    .from("Product")
    .select(
      `id, name, description, price, stockQuantity, images, variantTypes, variantOptions, is_deleted, createdAt, updatedAt, createdBy, categoryId,
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

// admin xóa product (soft delete)
const deleteProduct = async (productId, userId) => {
  const { data: admin } = await supabase
    .from("Admin")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!admin) {
    throw { status: 403, message: "Only admins can delete products" };
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

  // Soft delete
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
  updateProductStock,
  syncVariantMetadata,
};
