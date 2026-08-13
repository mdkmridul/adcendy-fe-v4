import type { Role } from "@/features/auth/types";

export type SubscriptionStatus =
  | "NOT_AVAILABLE"
  | "INACTIVE"
  | "CREATED"
  | "AUTHENTICATED"
  | "ACTIVE"
  | "PENDING"
  | "HALTED"
  | "PAUSED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export interface UserSubscription {
  provider: "RAZORPAY";
  available: boolean;
  status: SubscriptionStatus;
  planCode: string | null;
  providerSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  billing: {
    purchaseModel: "ONE_TIME_CREDITS";
    creditBalance: number;
    subscription: UserSubscription;
  };
}
