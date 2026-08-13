import { http } from "../index";
import type { ApiResponse } from "../types";
import type { UserProfile } from "@/shared/types/user-profile";

export const userProfileRealAdapter = {
  async getMe(): Promise<UserProfile> {
    const response = await http<ApiResponse<UserProfile>>("/v1/users/me");
    return response.data;
  },
};
