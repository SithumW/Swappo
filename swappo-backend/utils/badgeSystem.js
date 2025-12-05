// utils/badgeSystem.js
export const BADGE_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 51,
  GOLD: 151,
  DIAMOND: 301,
  RUBY: 601
};

export const LOYALTY_POINT_REWARDS = {
  SUCCESSFUL_TRADE: 20,
  RATING_5_STAR: 10,
  RATING_4_STAR: 5,
  RATING_3_STAR: 2,
  RATING_2_STAR: 0,
  RATING_1_STAR: -5
};

export function calculateBadge(loyaltyPoints) {
  if (loyaltyPoints >= BADGE_THRESHOLDS.RUBY) return 'RUBY';
  if (loyaltyPoints >= BADGE_THRESHOLDS.DIAMOND) return 'DIAMOND';
  if (loyaltyPoints >= BADGE_THRESHOLDS.GOLD) return 'GOLD';
  if (loyaltyPoints >= BADGE_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

export async function updateUserBadge(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyalty_points: true, badge: true }
  });

  if (!user) return null;

  const newBadge = calculateBadge(user.loyalty_points);
  
  if (newBadge !== user.badge) {
    return await prisma.user.update({
      where: { id: userId },
      data: { badge: newBadge },
      select: { id: true, badge: true, loyalty_points: true }
    });
  }
  
  return user;
}

export async function awardLoyaltyPoints(prisma, userId, points, reason) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        loyalty_points: { 
          increment: points 
        }
      }
    });

    // Update badge if needed
    await updateUserBadge(prisma, userId);
    
    console.log(`Awarded ${points} points to user ${userId} for: ${reason}`);
    return updatedUser;
  } catch (error) {
    console.error('Failed to award loyalty points:', error);
    throw error;
  }
}
