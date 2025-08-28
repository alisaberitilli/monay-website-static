import { observer } from "mobx-react-lite";
import {
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  redirect,
} from "react-router-dom";

import {
  AuthLayout,
  NoauthLayout,
  SplashPage,
  getSession,
  storedSession,
} from "./features/auth";
import { AllBillersPage, BillerPage } from "./features/core/billers";
import { AllInvoicesPage, InvoicePage } from "./features/core/invoices";
import PayPage from "./features/core/invoices/payInvoice/PayPage";
import { OnboardingPage } from "./features/onboarding";
import { HomePage } from "./pages";
import { useRootStore } from "./store/_root";
import { isE } from "./utils/platform";

const createRouter = isE ? createHashRouter : createBrowserRouter;

const noAuthRouter = createRouter(
  [
    {
      Component: NoauthLayout,
      ErrorBoundary: NoauthLayout,
      children: [
        {
          index: true,
          loader: async () => {
            const { session } = await getSession();
            if (session) return redirect("/onboarding");
            return null;
          },
          Component: SplashPage,
        },
        {
          path: "/onboarding",
          loader: async () => {
            const { session } = await getSession();
            if (!session) return redirect("/");
            return null;
          },
          Component: OnboardingPage,
        },
      ],
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
    },
  }
);

const authRouter = createRouter(
  [
    {
      Component: AuthLayout,
      ErrorBoundary: AuthLayout,
      children: [
        {
          index: true,
          Component: HomePage,
        },
        {
          path: "/onboarding",
          loader: () => redirect("/"),
          Component: () => null,
        },
        {
          path: "/biller/:billerId",
          Component: BillerPage,
        },
        {
          path: "/invoice/:invoiceId",
          Component: InvoicePage,
        },
        {
          path: "/billers",
          Component: AllBillersPage,
        },
        {
          path: "/invoices",
          Component: AllInvoicesPage,
        },
        {
          path: "/pay",
          Component: PayPage,
        },
        //   {
        //     path: "/settings",
        //     Component: SettingsPage,
        //   },
        //   {
        //     path: "/profile",
        //   },
        //   {
        //     path: "*",
        //     Component: NotFoundPage,
        //   },
      ],
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
    },
  }
);

const Router: React.FC = () => {
  const root = useRootStore();
  const supabaseLoaded = root.auth.supabaseLoaded;
  const session = root.auth.session;

  const chooseRouter = () => {
    if (!supabaseLoaded && storedSession) {
      return storedSession.user //?.user_metadata?.onboarding_complete
        ? authRouter
        : noAuthRouter;
    }

    if (session) {
      return session.user // ?.user_metadata?.onboarding_complete
        ? authRouter
        : noAuthRouter;
    }

    // should only fire if we are on splash page
    return noAuthRouter;
  };

  return (
    <>
      <RouterProvider
        router={chooseRouter()}
        future={{ v7_startTransition: true }}
        fallbackElement={<div>fallback</div>}
      />
    </>
  );
};

export default observer(Router);
