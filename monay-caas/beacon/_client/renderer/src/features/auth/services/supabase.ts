import {
  type Session,
  type SupabaseClient,
  createClient,
} from "@supabase/supabase-js";
import { LoaderFunction, LoaderFunctionArgs, redirect } from "react-router-dom";

import { EPHEMERAL_KEYS } from "#client/store/_kv";

const supabaseClient: SupabaseClient = import.meta.env.STORYBOOK
  ? ({} as SupabaseClient)
  : createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_KEY,
      {
        auth: {
          autoRefreshToken: true,
          storageKey: import.meta.env.VITE_SUPABASE_STORAGE_KEY,
          flowType: "implicit",
        },
      }
    );

export const getSession = async () => {
  const { error, data } = await supabaseClient.auth.getSession();
  return { error, session: data.session };
};

export const loaderWithSession = (
  cb: (
    args: LoaderFunctionArgs,
    session: Session | null
  ) => ReturnType<LoaderFunction>,
  redirectUri?: string
): LoaderFunction => {
  const loader: LoaderFunction = async (args) => {
    const { session } = await getSession();
    if (!session && redirectUri) return redirect(redirectUri);
    return cb(args, session);
  };
  return loader;
};

export const getStoredSession = () => {
  try {
    const session = JSON.parse(
      localStorage.getItem(import.meta.env.VITE_SUPABASE_STORAGE_KEY) ?? "null"
    );
    return session as Session;
  } catch (e) {
    return null;
  }
};

export const updateMetadata = (meta: Record<string, unknown>) =>
  supabaseClient.auth.updateUser({ data: meta });

export const storedSession = getStoredSession();
if (storedSession) {
  try {
    supabaseClient.auth.setSession({
      access_token: storedSession.access_token,
      refresh_token: storedSession.refresh_token,
    });
  } catch (e) {
    console.log("Set supabase session from storage failed", e);
  }
}

export const clearStoredSession = () => {
  localStorage.removeItem(import.meta.env.VITE_SUPABASE_STORAGE_KEY);
  localStorage.removeItem(EPHEMERAL_KEYS.NOAUTH_DATA);
};

export default supabaseClient;
