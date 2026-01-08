// backend/src/features/address/addressService.js
const { supabase } = require("../../configs/supabase");
const { v4: uuidv4 } = require("uuid");

// tất cả địa chỉ của một customer
const getAddressesByCustomer = async (customerId) => {
  const { data, error } = await supabase
    .from("Address")
    .select(
      "id, phoneNumber, address, street, ward, district, province, createdAt, updatedAt"
    )
    .eq("customerId", customerId)
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return data || [];
};

// chi tiết một địa chỉ
const getAddressById = async (addressId, customerId) => {
  const { data, error } = await supabase
    .from("Address")
    .select(
      "id, phoneNumber, address, street, ward, district, province, createdAt, updatedAt"
    )
    .eq("id", addressId)
    .eq("customerId", customerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw {
      status: 404,
      message: "Address not found or you don't have permission",
    };
  }

  return data;
};

// tạo địa chỉ mới
const createAddress = async ({
  customerId,
  phoneNumber,
  address,
  street,
  ward,
  district,
  province,
}) => {
  // kiểm tra customer tồn tại
  const { data: customer, error: customerError } = await supabase
    .from("Customer")
    .select("id")
    .eq("id", customerId)
    .maybeSingle();

  if (customerError) throw customerError;
  if (!customer) {
    throw { status: 404, message: "Customer not found" };
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("Address")
    .insert({
      id: uuidv4(),
      customerId,
      phoneNumber,
      address,
      street,
      ward,
      district,
      province,
      createdAt: now,
      updatedAt: now,
    })
    .select(
      "id, phoneNumber, address, street, ward, district, province, createdAt, updatedAt"
    )
    .single();

  if (error) throw error;

  return data;
};

// cập nhật địa chỉ
const updateAddress = async (addressId, customerId, updates) => {
  // kiểm tra địa chỉ có tồn tại và thuộc về customer này
  const { data: existingAddress, error } = await supabase
    .from("Address")
    .select("id")
    .eq("id", addressId)
    .eq("customerId", customerId)
    .maybeSingle();

  if (error) throw error;
  if (!existingAddress) {
    throw {
      status: 404,
      message: "Address not found or you don't have permission",
    };
  }

  const { data, error: updateError } = await supabase
    .from("Address")
    .update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", addressId)
    .select(
      "id, phoneNumber, address, street, ward, district, province, createdAt, updatedAt"
    )
    .single();

  if (updateError) throw updateError;

  return data;
};

// xóa địa chỉ
const deleteAddress = async (addressId, customerId) => {
  // kiểm tra địa chỉ có tồn tại và thuộc về customer này
  const { data: address, error } = await supabase
    .from("Address")
    .select("id")
    .eq("id", addressId)
    .eq("customerId", customerId)
    .maybeSingle();

  if (error) throw error;
  if (!address) {
    throw {
      status: 404,
      message: "Address not found or you don't have permission",
    };
  }

  // kiểm tra xem địa chỉ có đang được sử dụng trong đơn hàng nào k
  const { data: orders } = await supabase
    .from("Order")
    .select("id")
    .eq("addressId", addressId)
    .limit(1);

  if (orders?.length) {
    throw {
      status: 400,
      message: "Cannot delete address that is associated with orders",
    };
  }

  const { error: deleteError } = await supabase
    .from("Address")
    .delete()
    .eq("id", addressId);

  if (deleteError) throw deleteError;

  return true;
};

// admin xem tất cả địa chỉ trong hệ thống
const getAllAddresses = async ({
  page = 1,
  limit = 10,
  search,
  province,
  district,
}) => {
  page = parseInt(page);
  limit = parseInt(limit);

  let query = supabase.from("Address").select(
    `
      id, 
      phoneNumber, 
      address, 
      street, 
      ward, 
      district, 
      province, 
      createdAt, 
      updatedAt,
      customerId,
      Customer:customerId (
        id,
        User:userId (
          id,
          username,
          email
        )
      )
      `,
    { count: "exact" }
  );

  // Search filter
  if (search) {
    query = query.or(
      `address.ilike.%${search}%,phoneNumber.ilike.%${search}%,street.ilike.%${search}%,ward.ilike.%${search}%,district.ilike.%${search}%,province.ilike.%${search}%`
    );
  }

  // Province filter
  if (province) {
    query = query.eq("province", province);
  }

  // District filter
  if (district) {
    query = query.eq("district", district);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return {
    addresses: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// admin xem thống kê địa chỉ
const getAddressStats = async () => {
  // Tổng số địa chỉ
  const { count: totalCount, error: countError } = await supabase
    .from("Address")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  // thống kê theo tỉnh/tp
  const { data: provinceData, error: provinceError } = await supabase
    .from("Address")
    .select("province");

  if (provinceError) throw provinceError;

  const provinceStats = {};
  provinceData.forEach((addr) => {
    const prov = addr.province || "Unknown";
    provinceStats[prov] = (provinceStats[prov] || 0) + 1;
  });

  const topProvinces = Object.entries(provinceStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Thống kê theo quận/huyện
  const { data: districtData, error: districtError } = await supabase
    .from("Address")
    .select("district");

  if (districtError) throw districtError;

  const districtStats = {};
  districtData.forEach((addr) => {
    const dist = addr.district || "Unknown";
    districtStats[dist] = (districtStats[dist] || 0) + 1;
  });

  const topDistricts = Object.entries(districtStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total: totalCount || 0,
    topProvinces,
    topDistricts,
  };
};

module.exports = {
  getAddressesByCustomer,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  getAddressStats,
};
