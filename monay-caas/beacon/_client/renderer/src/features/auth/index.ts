import { SignIn, SignOut, SignUp } from "./components";
import useNoauth from "./hooks/useNoauth";
import useSession, { SessionProvider } from "./hooks/useSession";
import SplashPage from "./pages/SplashPage";
import supabaseClient, {
  clearStoredSession,
  getSession,
  getStoredSession,
  storedSession,
  updateMetadata,
} from "./services/supabase";
import { AuthLayout, NoauthLayout } from "./views";

export {
  SignIn,
  SignUp,
  SignOut,
  SplashPage,
  clearStoredSession,
  getStoredSession,
  getSession,
  updateMetadata,
  NoauthLayout,
  AuthLayout,
  supabaseClient,
  useNoauth,
  useSession,
  SessionProvider,
  storedSession,
};
