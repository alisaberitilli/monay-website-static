import {
  SessionContextProvider,
  useSession as useSupabaseSession,
} from "@supabase/auth-helpers-react";

import api from "#client/api";
import { EPHEMERAL_KEYS } from "#client/store/_kv";

import supabaseClient from "../services/supabase";

const useSession = () => {
  const supabaseSession = useSupabaseSession();

  if (supabaseSession) {
    return {
      ...supabaseSession,
      signOut: async () => {
        try {
          await api.user.signOut.mutate();
        } catch (e) {
          console.log(e);
        }
        localStorage.removeItem(EPHEMERAL_KEYS.NOAUTH_DATA);
        return supabaseClient.auth.signOut({ scope: "local" });
      },
    };
  }
  return null;
};

export const SessionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <SessionContextProvider supabaseClient={supabaseClient}>
    {children}
  </SessionContextProvider>
);

export default useSession;
