import type { UserProfile } from "@/shared/types/user-profile";

export const userProfileMockAdapter = {
  async getMe(): Promise<UserProfile> {
    const now = new Date().toISOString();
    return {
      id: "mock-client",
      email: "user@adcendy.com",
      role: "CLIENT",
      displayName: "AdCendy Client",
      phone: null,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
      billing: {
        purchaseModel: "ONE_TIME_CREDITS",
        creditBalance: 3,
        subscription: {
          provider: "RAZORPAY",
          available: false,
          status: "NOT_AVAILABLE",
          planCode: null,
          providerSubscriptionId: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      },
    };
  },
};
