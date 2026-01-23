import { get, put, post, del } from "../utils/request";

const getAllConfigs = () => {
    return get('/system');
};


const getMembershipTiers = () => {
    return get('/system/membership/tiers');
};

const updateMembershipTier = (tierName, data) => {
    return put(`/system/membership/tiers/${tierName}`, data);
};

const getMembershipBenefits = () => {
    return get('/system/membership/benefits');
};

const updateMembershipBenefit = (tierName, data) => {
    return put(`/system/membership/benefits/${tierName}`, data);
};

const getVatRate = () => {
    return get('/system/tax/vat');
};

const updateVatRate = (rate) => {
    return put('/system/tax/vat', { rate });
};

const getShippingFees = () => {
    return get('/system/shipping/fees');
};

const updateShippingFee = (type, data) => {
    return put(`/system/shipping/fees/${type}`, data);
};

const systemService = {
    getAllConfigs,
    getMembershipTiers,
    updateMembershipTier,
    getMembershipBenefits,
    updateMembershipBenefit,
    getVatRate,
    updateVatRate,
    getShippingFees,
    updateShippingFee
};

export default systemService;