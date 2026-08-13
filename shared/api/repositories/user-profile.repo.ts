import { createRuntimeRepositoryAdapter } from "@/lib/env";
import { userProfileMockAdapter } from "../mock/user-profile.mock";
import { userProfileRealAdapter } from "../real/user-profile.real";

const adapter = createRuntimeRepositoryAdapter(
  userProfileMockAdapter,
  userProfileRealAdapter,
);

export const userProfileRepository = {
  getMe: () => adapter.getMe(),
};
