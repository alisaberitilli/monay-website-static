import { sleep } from "#helpers";
import type {
  AuthChangeEvent,
  Session,
  Subscription,
} from "@supabase/supabase-js";
import { observable, reaction } from "mobx";
import {
  Model,
  _async,
  _await,
  getRootStore,
  getSnapshot,
  model,
  modelAction,
  modelFlow,
  prop,
} from "mobx-keystone";

import api from "#client/api";
import { getModelData, setModelData } from "#client/store/_kv";
import type { RootStore } from "#client/store/_root";

import supabaseClient, {
  storedSession,
  updateMetadata,
} from "../services/supabase";

@model("Auth/KybLite")
class KybLiteModel extends Model({
  role: prop<string | undefined>().withSetter(),
  use: prop<string | undefined>().withSetter(),
  merchantName: prop<string | undefined>().withSetter(),
  subMerchantDba: prop<string | undefined>().withSetter(),
  taxId: prop<string | undefined>().withSetter(),
  website: prop<string | undefined>().withSetter(),
  phone: prop<string | undefined>().withSetter(),
  placeId: prop<string | undefined>().withSetter(),
  needToFindOrganization: prop<boolean | undefined>().withSetter(),
  foundOrganizationId: prop<string | undefined>().withSetter(),
}) {
  @modelAction
  async submitOnboarding() {
    const root = getRootStore<RootStore>(this)!;
    const mandatoryFields = root.auth.name && root.auth.email;
    const mandatoryOrgFields = root.auth.organization;

    if (mandatoryFields) {
      root.global.setGlobalLoading({
        loading: true,
        meta: this.foundOrganizationId
          ? "Creating your account..."
          : "Creating your organization...",
      });

      let newUser: Awaited<ReturnType<typeof api.user.create.mutate>> | null =
        null;
      if (this.foundOrganizationId) {
        newUser = await api.user.create.mutate({
          name: root.auth.name!,
          email: root.auth.email!,
          organizationId: this.foundOrganizationId,
        });
      } else if (mandatoryOrgFields) {
        const addressId = await api.address.registerPlaceId.mutate(
          this.placeId!
        );

        newUser = await api.user.createWithOrg.mutate({
          organization: root.auth.organization!,
          kybDocument: {
            merchantName: this.merchantName ?? "",
            subMerchantDba: this.subMerchantDba ?? "",
            taxId: this.taxId ?? "",
            phone: this.phone ?? "",
            website: this.website ?? "",
            addressId,
          },
          email: root.auth.email!,
          name: root.auth.name!,
        });

        if (!newUser) {
          // error state
          return;
        }

        const { data, error } = await updateMetadata({
          onboarding_complete: true,
        });

        if (error || !data.user.user_metadata.onboarding_complete) {
          // error state
        }
      }
    }
    root.global.setGlobalLoading({ loading: false });
  }
}

const authModelName = "Auth";
function getAuthModelData() {
  const data = getModelData(authModelName);
  return (typeof data === "string" ? JSON.parse(data) : data) as AuthStore;
}
function setAuthModelData(value: unknown) {
  return setModelData(authModelName, value);
}

@model(authModelName)
class AuthStore extends Model({
  email: prop<string | undefined>().withSetter(),
  name: prop<string | undefined>().withSetter(),
  organization: prop<string | undefined>().withSetter(),
  kybLite: prop<KybLiteModel>().withSetter(),
  session: prop<Session | null>(() => storedSession),
  waitingForOtp: prop<boolean>(false).withSetter(),
  signedIn: prop<boolean>(!!storedSession).withSetter(),
}) {
  @observable
  supabaseLoaded = false;

  authHandler: Subscription | null = null;
  storedSession = storedSession;
  listeners: ((event: AuthChangeEvent, session: Session | null) => unknown)[] =
    [];

  @modelAction
  private async onAuthChange(
    event: AuthChangeEvent,
    incomingSession: Session | null
  ) {
    const root = getRootStore<RootStore>(this)!;

    if (event === "INITIAL_SESSION") {
      this.supabaseLoaded = true;
    } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      if (incomingSession) {
        this.session = incomingSession;
      } else console.warn(event, "event but no session?");
    }

    // our code paths depend on whether the "INITIAL_SESSION" event has been fired from the supabaseClient.
    // if it has not fired we parse everything we can based on the storedSession if it exists
    // when "INITIAL_SESSION" event fires we can safely assume that we don't need to refer to the cached storedSession on the client and can exclusively refer to the session object that Supabase provides
    const session = this.supabaseLoaded
      ? incomingSession
      : incomingSession ?? this.storedSession;
    const meta = session?.user?.user_metadata ?? {};
    const { onboarding_complete, server_user_created, name } = meta;

    // first thing we should check for is if an "INITIAL_SESSION" is emitted and we have a sessionObj but the passed in session is null.
    // in this case we have a cached auth state that is no longer valid state. time to log out ASAP
    // we can reuse this same flow for the "SIGNED_OUT" event too nicely
    if (
      (event === "INITIAL_SESSION" && session && !incomingSession) ||
      event === "SIGNED_OUT"
    ) {
      root.global.setGlobalLoading({ loading: true, meta: "Signing out..." });
      this.session = null;
      this.signedIn = false;
      await sleep(800);
      root.global.setGlobalLoading({ loading: false });
      return;
    } else if (event === "INITIAL_SESSION" && !session && !incomingSession) {
      console.log("?");
      root.global.setGlobalLoading({ loading: true, meta: "Signing out..." });
      this.session = null;
      this.signedIn = false;
      await sleep(800);
      root.global.setGlobalLoading({ loading: false });
      return;
    }

    // regular users (aka, have completed onboarding+kyb-lite and the user has been created in db)
    if (session && onboarding_complete && server_user_created) {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        this.session = { ...session };
        // root.global.setGlobalLoading({ loading: true, meta: "Booting..." });
        // root.global.setGlobalLoading({ loading: false });
        return;
      }
    }

    if (session && !onboarding_complete) {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        // we expect OnboardingPage to handle setting this to false. this is a genuinely awful implementation so we should definitely blow it up and make something better than optimistically expecting context shifts to properly translate across the application. I am too tired to do this at the moment so here we are
        root.global.setGlobalLoading({ loading: true });
      }
    }
  }

  @modelFlow
  signUp = _async(function* (
    this: AuthStore,
    email: string,
    name: string,
    organization?: string
  ) {
    const emailStatus = yield* _await(
      api.user.checkValidEmail.query({ email })
    );
    if (emailStatus !== "AVAILABLE") {
      let error: string | null = null;
      if (emailStatus === "INVALID") {
        error = "This domain cannot be used to register for Monay Beacon.";
      } else {
        error = "This email is not valid.";
      }
      return { error, data: { user: null, session: null } };
    }

    const { error, data } = yield* _await(
      supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            name,
            beacon_user: true,
            server_user_created: false,
            creating_new_organization: !!organization,
            organization,
          },
        },
      })
    );

    if (!error) {
      this.setWaitingForOtp(true);
      this.setEmail(email);
      this.setName(name);
      if (organization) this.setOrganization(organization);
    }

    return { error, data };
  });

  @modelFlow
  signIn = _async(function* (this: AuthStore, email: string) {
    const { error, data } = yield* _await(
      supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })
    );

    if (!error) {
      this.setWaitingForOtp(true);
      this.setEmail(email);
    }

    console.log(error, data);

    return { error, data };
  });

  @modelFlow
  confirmOtp = _async(function* (this: AuthStore, token: string) {
    const { error, data } = yield* _await(
      supabaseClient.auth.verifyOtp({
        token,
        email: this.email!,
        type: "email",
      })
    );

    if (!error) {
      this.setWaitingForOtp(false);
      this.session = data.session;
      this.setSignedIn(true);
    }

    return { error, data };
  });

  @modelFlow
  async signOut(scope: "global" | "local" | "others" = "local") {
    const { error } = await supabaseClient.auth.signOut({ scope });
  }

  protected onAttachedToRootStore() {
    const res = supabaseClient.auth.onAuthStateChange((event, session) =>
      this.onAuthChange(event, session)
    );
    this.authHandler = res.data.subscription;

    const reactionDisposer = reaction(
      () => getSnapshot(this),
      (snap) => {
        setAuthModelData(snap);
      },
      { fireImmediately: true }
    );

    return () => {
      this.authHandler?.unsubscribe();
      reactionDisposer();
    };
  }
}

export default AuthStore;
export function createAuthStore() {
  const authStore = getAuthModelData();
  if (authStore) {
    try {
      return new AuthStore(authStore);
    } catch (e) {
      console.log(e);
    }
  }
  return new AuthStore({ kybLite: new KybLiteModel({}) });
}
