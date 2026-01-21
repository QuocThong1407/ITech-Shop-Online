// backend/src/features/membership/membershipRefundHandler.js
const { supabase } = require("../../configs/supabase");
const { calculateMembershipTier } = require("./membershipService");

//trừ spent khi order bị cancel/return, gọi từ orderService
const handleOrderRefund = async (orderId) => {
  const now = new Date().toISOString();

  try {
    // lấy order
    const { data: order, error: orderError } = await supabase
      .from("Order")
      .select(`id, customerId, Payment!Payment_orderId_fkey(amount)`)

      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderId);
      return { success: false, reason: "Order not found" };
    }

    // nếu order từng DELIVERED (đã tính spent)
    // kiểm tra xem order này đã được tính vào spent chưa
    const paymentAmount = order.Payment?.[0]?.amount || 0;

    if (paymentAmount <= 0) {
      return { success: false, reason: "No payment to refund" };
    }

    // lấy membership hiện tại
    const { data: membership, error: membershipError } = await supabase
      .from("Membership")
      .select("id, membership, spent")
      .eq("customerId", order.customerId)
      .single();

    if (membershipError || !membership) {
      console.error("Membership not found for customer:", order.customerId);
      return { success: false, reason: "Membership not found" };
    }

    // tính spent mới (trừ đi số tiền của order bị cancel/return)
    const newSpent = Math.max(0, membership.spent - paymentAmount);

    // tính tier mới
    const newTier = calculateMembershipTier(newSpent);

    // update membership
    const { data: updated, error: updateError } = await supabase
      .from("Membership")
      .update({
        spent: newSpent,
        membership: newTier,
        updatedAt: now,
      })
      .eq("id", membership.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update membership:", updateError);
      return { success: false, reason: updateError.message };
    }

    const wasDowngraded =
      ["BRONZE", "SILVER", "GOLD", "PLATINUM"].indexOf(newTier) <
      ["BRONZE", "SILVER", "GOLD", "PLATINUM"].indexOf(membership.membership);

    console.log(
      `Membership refunded for customer ${order.customerId}: ${paymentAmount} (${membership.membership} → ${newTier})`,
    );

    return {
      success: true,
      customerId: order.customerId,
      refundedAmount: paymentAmount,
      previousSpent: membership.spent,
      newSpent: newSpent,
      previousTier: membership.membership,
      newTier: newTier,
      downgraded: wasDowngraded,
    };
  } catch (error) {
    console.error("Handle order refund error:", error);
    return { success: false, reason: error.message };
  }
};

//xử lý khi order được restore (từ CANCELLED trở lại)
//trường hợp: admin restore order đã cancel
const handleOrderRestore = async (orderId) => {
  const now = new Date().toISOString();

  try {
    const { data: order } = await supabase
      .from("Order")
      .select(`id, customerId, Payment!Payment_orderId_fkey(amount)`)
      .eq("id", orderId)
      .single();

    if (!order) return { success: false };

    const paymentAmount = order.Payment?.[0]?.amount || 0;
    if (paymentAmount <= 0) return { success: false };

    const { data: membership } = await supabase
      .from("Membership")
      .select("id, membership, spent")
      .eq("customerId", order.customerId)
      .single();

    if (!membership) return { success: false };

    const newSpent = membership.spent + paymentAmount;
    const newTier = calculateMembershipTier(newSpent);

    await supabase
      .from("Membership")
      .update({
        spent: newSpent,
        membership: newTier,
        updatedAt: now,
      })
      .eq("id", membership.id);

    console.log(` Membership restored for customer ${order.customerId}`);

    return { success: true, newSpent, newTier };
  } catch (error) {
    console.error("Handle order restore error:", error);
    return { success: false };
  }
};

module.exports = {
  handleOrderRefund,
  handleOrderRestore,
};
