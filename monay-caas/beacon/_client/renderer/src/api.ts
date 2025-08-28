import {
  HTTPHeaders,
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import {
  ActionCall,
  ActionTrackingResult,
  SerializedActionCall,
  SerializedActionCallWithModelIdOverrides,
  applySerializedActionAndSyncNewModelIds,
  applySerializedActionAndTrackNewModelIds,
  fromSnapshot,
  getSnapshot,
  onActionMiddleware,
  serializeActionCall,
} from "mobx-keystone";
import superjson from "superjson";

// deliberately not using a path alias for this
import type { AppRouter } from "../../../_server/resources";
import { getSession } from "./features/auth";
import { RootStore, createRootStore } from "./store/_root";
import { getFingerprintAgent, isElectron, os } from "./utils/platform";

const API_PATH = `${import.meta.env.VITE_API_PATH}`;

const fetchApiKey = async () => {
  const response = await fetch(
    `${API_PATH}/${import.meta.env.VITE_API_KEY_PATH}`
  );

  if (response.ok) {
    return response.json();
  }

  console.log(response);

  return response.text();
};

let hasRefreshedOnSession = false;
export const getApiKey = async (force?: boolean) => {
  const [existingKey, exp] = [
    localStorage.getItem(import.meta.env.VITE_API_KEY_PATH) ?? "",
    localStorage.getItem(import.meta.env.VITE_API_KEY_EXP),
  ];
  if (!existingKey || force) {
    if (!exp || parseInt(exp, 10) > Date.now() || force) {
      try {
        const { key } = await fetchApiKey();
        console.log(key);
        if (key && typeof key === "string") {
          localStorage.setItem(import.meta.env.VITE_API_KEY_PATH, key);
          localStorage.setItem(
            import.meta.env.VITE_API_KEY_EXP,
            (Date.now() + 1000 * 60 * 60 * 24).toString()
          );
          hasRefreshedOnSession = true;
          console.log(key);
          return key;
        }
      } catch (e) {
        console.log("API Key retrieval failure:", e);
      }
    }
  }

  return existingKey;
};

const TRPC_PATH = `${API_PATH}/api/trpc`;
async function headers(): Promise<HTTPHeaders> {
  const { session, error } = await getSession();
  if (error) {
    console.info(
      "AUTH ERROR:",
      error.name,
      error.message,
      error.status,
      error.cause
    );
  }

  const { name, version } = os();
  const agent = await getFingerprintAgent();
  const fingerprint = await agent.get({
    debug: import.meta.env.DEV && false,
  });

  return {
    authorization: `Bearer ${session?.access_token}`,
    "x-t-api-key": await getApiKey(),
    "x-t-os": `${name}::${version}`,
    "x-t-v": import.meta.env.VITE_APP_VERSION,
    "x-t-f": fingerprint.visitorId,
    "x-t-t": isElectron() ? "DESKTOP" : "WEB",
    "x-t-tz": (new Date().getTimezoneOffset() / 60).toString(),
  };
}

const wsClient = createWSClient({
  url: "ws://localhost:3001",
});

const wsApi = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});

const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        (import.meta.env.DEV && typeof window !== "undefined") ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    splitLink({
      condition(op) {
        return op.context.noBatch === true;
      },
      true: httpLink({
        url: TRPC_PATH,
        headers,
      }),
      false: httpBatchLink({
        url: TRPC_PATH,
        headers,
      }),
    }),
  ],
});

export const cancelledActionSymbol = Symbol("cancelledAction");
interface ExtendedActionCall extends ActionCall {
  cancelled: boolean;
}

type MsgListener = (
  actionCall: SerializedActionCallWithModelIdOverrides
) => void;
class Server {
  private root: RootStore;
  private msgListeners: MsgListener[];

  constructor() {
    this.root = createRootStore();
    this.msgListeners = [];
  }

  getInitialState() {
    return getSnapshot(this.root);
  }

  onMessage(listener: MsgListener) {
    this.msgListeners.push(listener);
  }

  sendMessage(actionCall: SerializedActionCall) {
    // let serializedActionCallToReplicate:
    //   | SerializedActionCallWithModelIdOverrides
    //   | undefined;
    // try {
    //   const applyActionResult = applySerializedActionAndTrackNewModelIds(
    //     this.root,
    //     actionCall
    //   );
    //   serializedActionCallToReplicate = applyActionResult.serializedActionCall;
    // } catch (e) {
    //   console.log(e);
    // }
    // if (serializedActionCallToReplicate) {
    //   this.msgListeners.forEach((listener) =>
    //     listener(serializedActionCallToReplicate!)
    //   );
    // }
  }
}

const server = new Server();
export function init() {
  const rootSnapshot = server.getInitialState();
  const root = fromSnapshot<RootStore>(rootSnapshot);

  const keyPromise = getApiKey(true);

  if (import.meta.env.DEV) {
    keyPromise.then((key) => console.info("Using API Key", key));
  }

  // let serverAction = false;
  // const runServerActionLocally: MsgListener = (actionCall) => {
  //   const wasServerAction = serverAction;
  //   serverAction = true;
  //   try {
  //     applySerializedActionAndSyncNewModelIds(root, actionCall);
  //   } finally {
  //     serverAction = wasServerAction;
  //   }
  // };

  // server.onMessage((actionCall) => {
  //   runServerActionLocally(actionCall);
  // });

  // onActionMiddleware(root, {
  //   onStart(actionCall, ctx) {
  //     if (!serverAction) {
  //       server.sendMessage(serializeActionCall(actionCall, root));

  //       ctx.data[cancelledActionSymbol] = true;

  //       return {
  //         result: ActionTrackingResult.Return,
  //         value: undefined,
  //       };
  //     } else {
  //       return undefined;
  //     }
  //   },
  // });

  wsApi.user.onUserNotify.subscribe(undefined, {
    onData: (nudge) => {},
    onStarted: () => {},
    onStopped: () => {},
    onError: (error) => {},
    onComplete: () => {},
  });

  return root;
}

export default api;
