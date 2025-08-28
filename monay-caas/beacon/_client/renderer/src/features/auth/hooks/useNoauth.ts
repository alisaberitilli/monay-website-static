import { createContext, useContext } from "react";

import type { KybDocument } from "@prisma/client";
import { AuthError, AuthResponse } from "@supabase/supabase-js";

import { StageProps } from "#client/utils/types";
import { noop } from "#constants";

interface Kyb extends KybDocument {
  address?: {
    googlePlacesId: string;
    jsonAddress: Record<string, unknown>;
  };
}

export type NoauthActionType = "SIGNIN" | "SIGNUP" | "OTP";
export type NoauthStageProps = StageProps<NoauthActionType>;
export interface NoauthData {
  email?: string;
  name?: string;
  organization?: string;
  signedIn?: boolean;
  rawUserData?: { [k: string]: unknown };
  kybDocument?: Kyb;
}
export interface NoauthFunctions {
  auth: (
    type: NoauthActionType,
    email: string,
    authData?: { name?: string; organization?: string; token?: string }
  ) => Promise<{
    data: AuthResponse["data"] | null;
    error: AuthError | null | string;
  }>;
  setKyb: (kyb: Partial<Kyb>) => unknown;
  setRaw: (data: object) => void;
  submitOnboarding: (organizationId?: string) => void;
}
export type Noauth = NoauthData & NoauthFunctions;
const NoauthContext = createContext<Noauth>({
  auth: async () => ({ data: null, error: null }),
  setKyb: noop,
  setRaw: noop,
  submitOnboarding: noop,
});

export const NoauthProvider = NoauthContext.Provider;
const useNoauth = () => useContext(NoauthContext);

export default useNoauth;
