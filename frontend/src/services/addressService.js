import { get, post, put, del, patch } from "../utils/request.js";

/**
 * Get all addresses for the current user
 * @returns {Promise} Array of address objects (default address first)
 */
const getAddresses = () => {
    return get('/addresses');
};

/**
 * Get a specific address by ID
 * @param {string} id - Address ID
 * @returns {Promise} Address object
 */
const getAddress = (id) => {
    return get(`/addresses/${id}`);
};

/**
 * Create a new address
 * @param {Object} data - Address data
 * @param {string} data.phoneNumber - Phone number
 * @param {string} data.address - House number, apartment
 * @param {string} data.street - Street name
 * @param {string} data.ward - Ward
 * @param {string} data.district - District
 * @param {string} data.province - Province
 * @returns {Promise} Created address object
 */
const createAddress = (data) => {
    return post('/addresses', data);
};

/**
 * Update an existing address
 * @param {string} id - Address ID
 * @param {Object} data - Address data to update
 * @returns {Promise} Updated address object
 */
const updateAddress = (id, data) => {
    return put(`/addresses/${id}`, data);
};

/**
 * Delete an address
 * @param {string} id - Address ID
 * @returns {Promise} Success message
 */
const deleteAddress = (id) => {
    return del(`/addresses/${id}`);
};

/**
 * Set an address as the default address
 * @param {string} id - Address ID
 * @returns {Promise} Updated address object
 */
const setDefaultAddress = (id) => {
    return patch(`/addresses/${id}/default`);
};

const addressService = {
    getAddresses,
    getAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};

export default addressService;
