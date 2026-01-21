// backend/src/features/membership/membershipService.js
const { supabase } = require("../../configs/supabase");

// Membership tiers và ngưỡng
const MEMBERSHIP_TIERS = {
  BRONZE: { min: 0, max: 999999, name: "BRONZE" },
  SILVER: { min: 1000000, max: 4999999, name: "SILVER" },
  GOLD: { min: 5000000, max: 9999999, name: "GOLD" },
  PLATINUM: { min: 10000000, max: Infinity, name: "PLATINUM" },
};

//xd membership tier dựa trên tổng spent
const calculateMembershipTier = (totalSpent) => {
  if (totalSpent >= MEMBERSHIP_TIERS.PLATINUM.min) {
    return "PLATINUM";
  } else if (totalSpent >= MEMBERSHIP_TIERS.GOLD.min) {
    return "GOLD";
  } else if (totalSpent >= MEMBERSHIP_TIERS.SILVER.min) {
    return "SILVER";
  } else {
    return "BRONZE";
  }
};

//lấy thông tin membership của customer hiện tại
const getMyMembership = async (userId) => {
  const { data: customer, error: customerError } = await supabase
    .from("Customer")
    .select("id")
    .eq("userId", userId)
    .single();

  if (customerError || !customer) {
    throw { status: 404, message: "Customer not found" };
  }

  // lấy membership info
  const { data: membership, error } = await supabase
    .from("Membership")
    .select(
      `
      id,
      customerId,
      membership,
      spent,
      createdAt,
      updatedAt,
      Customer!Membership_customerId_fkey(
        id,
        User!Customer_userId_fkey(
          id,
          username,
          email
        )
      )
    `,
    )
    .eq("customerId", customer.id)
    .single();

  if (error) throw error;
  if (!membership) throw { status: 404, message: "Membership not found" };

  // tính thông tin bổ sung
  const nextTier = getNextTier(membership.membership);

  return {
    ...membership,
    tierInfo: {
      current: membership.membership,
      spent: membership.spent,
      nextTier: nextTier ? nextTier.name : null,
      spentToNextTier: nextTier
        ? Math.max(0, nextTier.min - membership.spent)
        : 0,
      benefits: getMembershipBenefits(membership.membership),
    },
  };
};

//lấy tier tiếp theo
const getNextTier = (currentTier) => {
  const tiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null;
  }

  const nextTierName = tiers[currentIndex + 1];
  return MEMBERSHIP_TIERS[nextTierName];
};

//lấy benefits của từng tier
const getMembershipBenefits = (tier) => {
  const benefits = {
    BRONZE: {
      discountPercentage: 0,
      freeShipping: false,
      prioritySupport: false,
      earlyAccess: false,
    },
    SILVER: {
      discountPercentage: 5,
      freeShipping: false,
      prioritySupport: false,
      earlyAccess: false,
    },
    GOLD: {
      discountPercentage: 10,
      freeShipping: true,
      prioritySupport: true,
      earlyAccess: false,
    },
    PLATINUM: {
      discountPercentage: 15,
      freeShipping: true,
      prioritySupport: true,
      earlyAccess: true,
    },
  };

  return benefits[tier] || benefits.BRONZE;
};

//lấy danh sách top spent members (Admin)
const getTopSpentMembers = async (limit = 10) => {
  const { data, error } = await supabase
    .from("Membership")
    .select(
      `id, customerId, membership, spent, createdAt, updatedAt,
      Customer!Membership_customerId_fkey(
        id,
        image,
        User!Customer_userId_fkey(
          id,
          username,
          email
        )
      )
    `,
    )
    .order("spent", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Thêm rank và benefit info
  return data.map((member, index) => ({
    rank: index + 1,
    ...member,
    benefits: getMembershipBenefits(member.membership),
  }));
};

//lấy membership theo customerId (helper gọi ở order)
const getMembershipByCustomerId = async (customerId) => {
  const { data, error } = await supabase
    .from("Membership")
    .select("id, membership, spent")
    .eq("customerId", customerId)
    .single();

  if (error) throw error;
  if (!data) throw { status: 404, message: "Membership not found" };

  return data;
};
// Admin - lấy membership theo membershipId
const getMembershipById = async (id) => {
  const { data, error } = await supabase
    .from("Membership")
    .select(
      `id,customerId,membership,spent,createdAt,updatedAt,
      Customer!Membership_customerId_fkey(
        id,
        User!Customer_userId_fkey(
          id,
          username,
          email
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    throw { status: 404, message: "Membership not found" };
  }

  return {
    ...data,
    benefits: getMembershipBenefits(data.membership),
  };
};
// Admin - lấy danh sách memberships
const getAllMemberships = async ({
  page = 1,
  limit = 10,
  tier,
  sort = "spent_desc",
}) => {
  let query = supabase.from("Membership").select(
    `id, customerId, membership, spent, createdAt, updatedAt,
      Customer!Membership_customerId_fkey(
        id,
        User!Customer_userId_fkey(
          id,
          username,
          email
        )
      )
    `,
    { count: "exact" },
  );

  // filter theo tier
  if (tier) {
    query = query.eq("membership", tier);
  }

  // sort
  if (sort === "spent_asc") {
    query = query.order("spent", { ascending: true });
  } else {
    query = query.order("spent", { ascending: false });
  }

  // pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data.map((m) => ({
      ...m,
      benefits: getMembershipBenefits(m.membership),
    })),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  getMyMembership,
  getTopSpentMembers,
  getMembershipByCustomerId,
  calculateMembershipTier,
  getMembershipBenefits,
  getMembershipById,
  getAllMemberships,
};
