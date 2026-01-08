// backend/src/features/address/addressController.js
const addressService = require("./addressService");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelpers");

// lấy tất cả địa chỉ của mình
const getMyAddresses = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) {
      return errorResponse(res, 403, "Customer profile not found");
    }

    const addresses = await addressService.getAddressesByCustomer(customerId);
    successResponse(res, 200, addresses);
  } catch (error) {
    console.error("Get my addresses error:", error);
    errorResponse(res, 500, error.message || "Failed to get addresses");
  }
};

// lấy chi tiết một địa chỉ
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.customerId;

    if (!customerId) {
      return errorResponse(res, 403, "Customer profile not found");
    }

    const address = await addressService.getAddressById(id, customerId);
    successResponse(res, 200, address);
  } catch (error) {
    console.error("Get address error:", error);
    const statusCode = error.status || 500;
    errorResponse(res, statusCode, error.message || "Address not found");
  }
};

// tạo địa chỉ mới
const createAddress = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) {
      return errorResponse(res, 403, "Customer profile not found");
    }

    const { phoneNumber, address, street, ward, district, province } = req.body;

    // validate sdt, đc
    if (!phoneNumber || !address) {
      return errorResponse(res, 400, "Phone number and address are required");
    }

    const result = await addressService.createAddress({
      customerId,
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      street: street?.trim() || null,
      ward: ward?.trim() || null,
      district: district?.trim() || null,
      province: province?.trim() || null,
    });

    successResponse(res, 201, result, "Address created successfully");
  } catch (error) {
    console.error("Create address error:", error);
    errorResponse(res, 400, error.message || "Failed to create address");
  }
};

// customer cập nhật địa chỉ
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.customerId;

    if (!customerId) {
      return errorResponse(res, 403, "Customer profile not found");
    }
    const result = await addressService.updateAddress(id, customerId, updates);
    successResponse(res, 200, result, "Address updated successfully");
  } catch (error) {
    console.error("Update address error:", error);
    const statusCode = error.status || 400;
    errorResponse(res, statusCode, error.message || "Failed to update address");
  }
};

// customer xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.customerId;

    if (!customerId) {
      return errorResponse(res, 403, "Customer profile not found");
    }

    await addressService.deleteAddress(id, customerId);
    successResponse(res, 200, null, "Address deleted successfully");
  } catch (error) {
    console.error("Delete address error:", error);
    const statusCode = error.status || 400;
    errorResponse(res, statusCode, error.message || "Failed to delete address");
  }
};

// admin xem tất cả địa chỉ trong hệ thống
const getAllAddresses = async (req, res) => {
  try {
    const { page, limit, search, province, district } = req.query;
    const result = await addressService.getAllAddresses({
      page,
      limit,
      search,
      province,
      district,
    });
    successResponse(res, 200, result);
  } catch (error) {
    console.error("Get all addresses error:", error);
    errorResponse(res, 500, error.message || "Failed to get addresses");
  }
};

// admin xem thống kê địa chỉ
const getAddressStats = async (req, res) => {
  try {
    const stats = await addressService.getAddressStats();
    successResponse(res, 200, stats);
  } catch (error) {
    console.error("Get address stats error:", error);
    errorResponse(res, 500, "Failed to get address statistics");
  }
};

module.exports = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  getAddressStats,
};
