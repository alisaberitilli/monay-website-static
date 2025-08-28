import type { Application, Express, Router } from "express";
import path from "node:path";

import { stdWarn } from "../log";

// https://github.com/felixge/node-stack-trace/blob/master/index.js
function CallSite(properties: object) {
  // eslint-disable-next-line
  for (const property in properties) {
    if (property) {
      // @ts-ignore need to use `this` keyword
      // eslint-disable-next-line
      this[property] = properties[property];
    }
  }
}

const strProperties = [
  "this",
  "typeName",
  "functionName",
  "methodName",
  "fileName",
  "lineNumber",
  "columnNumber",
  "function",
  "evalOrigin",
];

const boolProperties = ["topLevel", "eval", "native", "constructor"];

strProperties.forEach(function (property) {
  CallSite.prototype[property] = null;
  CallSite.prototype[`get${property[0].toUpperCase()}${property.substr(1)}`] =
    function () {
      return this[property];
    };
});

boolProperties.forEach(function (property) {
  CallSite.prototype[property] = false;
  CallSite.prototype[`is${property[0].toUpperCase()}${property.substr(1)}`] =
    function () {
      return this[property];
    };
});

function createParsedCallSite(properties: object) {
  // @ts-ignore need to be able to use CallSite as a constructor
  return new CallSite(properties);
}

export function get(belowFn?: Function) {
  const oldLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;

  const dummyObject: { stack?: NodeJS.CallSite[] } = {};

  const v8Handler = Error.prepareStackTrace;
  Error.prepareStackTrace = function Stack(_, v8StackTrace) {
    return v8StackTrace;
  };
  Error.captureStackTrace(dummyObject, belowFn || get);

  const v8StackTrace = dummyObject.stack;
  Error.prepareStackTrace = v8Handler;
  Error.stackTraceLimit = oldLimit;

  return v8StackTrace;
}

export function getCaller(belowFn?: Function) {
  const oldLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;

  const dummyObject: { stack?: NodeJS.CallSite[] } = {};

  const v8Handler = Error.prepareStackTrace;
  Error.prepareStackTrace = function Stack(_, v8StackTrace) {
    return v8StackTrace;
  };
  Error.captureStackTrace(dummyObject, belowFn || getCaller);

  const v8StackTrace = dummyObject.stack;
  Error.prepareStackTrace = v8Handler;
  Error.stackTraceLimit = oldLimit;

  return v8StackTrace?.[1];
}

export function parse(err: Error) {
  if (!err.stack) {
    return [];
  }

  const lines = err.stack.split("\n").slice(1);
  return lines
    .map((line) => {
      if (line.match(/^\s*[-]{4,}$/)) {
        return createParsedCallSite({
          fileName: line,
          lineNumber: null,
          functionName: null,
          typeName: null,
          methodName: null,
          columnNumber: null,
          native: null,
        });
      }

      const lineMatch = line.match(
        /at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/
      );
      if (!lineMatch) {
        // eslint-disable-next-line consistent-return
        return;
      }

      let object = null;
      let method = null;
      let functionName = null;
      let typeName = null;
      let methodName = null;
      const isNative = lineMatch[5] === "native";

      if (lineMatch[1]) {
        // eslint-disable-next-line prefer-destructuring
        functionName = lineMatch[1];
        let methodStart = functionName.lastIndexOf(".");
        if (functionName[methodStart - 1] === ".") methodStart--;
        if (methodStart > 0) {
          object = functionName.substr(0, methodStart);
          method = functionName.substr(methodStart + 1);
          const objectEnd = object.indexOf(".Module");
          if (objectEnd > 0) {
            functionName = functionName.substr(objectEnd + 1);
            object = object.substr(0, objectEnd);
          }
        }
      }

      if (method) {
        typeName = object;
        methodName = method;
      }

      if (method === "<anonymous>") {
        methodName = null;
        functionName = null;
      }

      const properties = {
        fileName: lineMatch[2] || null,
        lineNumber: parseInt(lineMatch[3], 10) || null,
        functionName,
        typeName,
        methodName,
        columnNumber: parseInt(lineMatch[4], 10) || null,
        native: isNative,
      };

      return createParsedCallSite(properties);
    })
    .filter((callSite) => {
      return !!callSite;
    });
}

// adapted from
// https://github.com/labithiotis/express-list-routes

const defaultOptions = {
  prefix: "",
  spacer: 7,
};

const COLORS = {
  yellow: 33,
  green: 32,
  blue: 34,
  red: 31,
  grey: 90,
  magenta: 35,
  clear: 39,
};

const spacer = (x: number) =>
  x > 0 ? [...new Array(x)].map(() => " ").join("") : "";

const colorText = (color: number, string: string) =>
  `\u001b[${color}m${string}\u001b[${COLORS.clear}m`;

function colorMethod(method: string) {
  switch (method) {
    case "POST":
      return colorText(COLORS.yellow, method);
    case "GET":
      return colorText(COLORS.green, method);
    case "PUT":
      return colorText(COLORS.blue, method);
    case "DELETE":
      return colorText(COLORS.red, method);
    case "PATCH":
      return colorText(COLORS.grey, method);
    default:
      return method;
  }
}

const colorizedHttpMethods = {
  POST: colorMethod("POST"),
  GET: colorMethod("GET"),
  DELETE: colorMethod("DELETE"),
  PUT: colorMethod("PUT"),
  PATCH: colorMethod("PATCH"),
} as const;
type ColorHTTPMethods = typeof colorizedHttpMethods;
type HTTPMethod = keyof ColorHTTPMethods;

export function getPathFromRegex(regexp: RegExp) {
  // all query params get resolved to /:id
  return regexp
    .toString()
    .replace(/\/\^\\|\?\(\?=\\\/\|\$\)/g, "")
    .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ":id")
    .replace(/\/\\{1,}|\\/g, "/")
    .replace(/\/{2,}/g, "/");
  // need to separate these last 2 for reasons unknown
}

type InternalRouter = Router & {
  handle: { stack: InternalRouter[] };
  regexp: RegExp;
};

function combineStacks(acc: Router[], stack: InternalRouter): unknown[] {
  if (stack.handle.stack) {
    const routerPath = getPathFromRegex(stack.regexp);
    return [
      ...acc,
      ...stack.handle.stack.map((s: InternalRouter) => ({ routerPath, ...s })),
    ];
  }
  return [...acc, stack] as InternalRouter[];
}

function getStacks(app: Express | Application | Router) {
  const internalRouters: InternalRouter[] = [];
  // Express 4
  if ("router" in app && app._router && app._router.stack) {
    return app._router.stack.reduce(combineStacks, internalRouters);
  }

  // Express 4 Router
  if (app.stack) {
    return app.stack.reduce(combineStacks, internalRouters);
  }

  // Express 5
  // if ("router" in app && app.router && app.router.stack) {
  //   return app.router.stack.reduce(combineStacks, []);
  // }

  return internalRouters;
}

interface DisplayRoute {
  stackMethod: HTTPMethod | HTTPMethod[];
  stackSpace: string;
  stackPath: string;
  pathSegments: string[];
  children: DisplayRoute[];
}
type PrimDisplayRoute = Omit<DisplayRoute, "pathSegments" | "children">;

const segmentRoute = (route: PrimDisplayRoute): DisplayRoute => ({
  ...route,
  pathSegments: route.stackPath.split("/").filter((p) => p.length),
  children: [],
});

const box = {
  vert: "│",
  bl: "",
  br: "",
  curveBL: "╰",
  curveBR: "╯",
  pipe: "├",
  hori: "─",
};

const getMaxWidth = (width: number, route: DisplayRoute) => {
  const routeLength = route.stackPath.length + route.pathSegments.length * 2;
  if (routeLength > width) return routeLength;
  return width;
};

class RouterDisplay {
  routes: DisplayRoute[];
  box: unknown;

  constructor() {
    this.routes = [];
    this.box = box;
  }

  addRoutes = (...routes: PrimDisplayRoute[]) => {
    // see if route exists but for different methods
    const newRoutes: DisplayRoute[] = [];
    const existingRoutes = routes
      .map((r) => {
        if (this.routes.find((route) => route.stackPath === r.stackPath)) {
          return r;
        }
        newRoutes.push(segmentRoute(r));
        return null;
      })
      .filter((r) => r);

    existingRoutes.forEach((route) => {
      const existingRoute = this.routes.find(
        (r) => r.stackPath === route?.stackPath
      );
      if (
        existingRoute &&
        route &&
        existingRoute?.stackMethod !== route?.stackMethod
      ) {
        if (typeof existingRoute.stackMethod === "string") {
          existingRoute.stackMethod = [existingRoute.stackMethod];
        }

        if (typeof route.stackMethod === "string") {
          existingRoute.stackMethod.push(route.stackMethod);
        } else {
          existingRoute.stackMethod.push(...route.stackMethod);
        }
      }
    });

    this.routes.push(...newRoutes);
    this.segmentRoutes();
  };

  segmentRoutes = () => {
    this.routes = this.routes.map(segmentRoute);
  };

  createRouteTree = () => {
    // first sort from most to least segments
    const routes = [...this.routes]
      .sort((rA, rB) => rB.pathSegments.length - rA.pathSegments.length)
      .map((r) => ({
        ...r,
        children: [] as DisplayRoute[],
      }));

    routes.forEach((route) => {
      const parentNumPathSegments = route.pathSegments.length - 1;
      const parentRoute = routes.find((r) => {
        if (r.pathSegments.length !== parentNumPathSegments) {
          return false;
        }

        for (let i = 0; i < parentNumPathSegments; i++) {
          if (r.pathSegments[i] !== route.pathSegments[i]) return false;
        }
        return true;
      });

      if (parentRoute) {
        parentRoute.children.push(route);
      }
    });

    return routes.filter((r) => r.pathSegments.length === 1);
  };

  logRoutes = () => {
    stdWarn("API ROUTES");
    const routes = this.createRouteTree();
    const cols = process.stdout.columns;
    const maxWidth: number = this.routes.reduce(getMaxWidth, 0);
    const numCols = Math.floor(cols / (maxWidth + 20)) || 1;

    this.routes.forEach(({ stackMethod, stackPath, stackSpace }) => {
      if (typeof stackMethod === "string") {
        process.stdout.write(`   ${stackMethod}${stackSpace}${stackPath}\n`);
      } else {
        stackMethod.forEach((method, i) =>
          i === 0
            ? process.stdout.write(` ┍ ${method}${stackSpace}${stackPath}\n`)
            : process.stdout.write(
                i === stackMethod.length - 1
                  ? ` └ ${method}\n`
                  : ` ┝ ${method}\n`
              )
        );
      }
    });
    process.stdout.write("\n");
    console.info(numCols, maxWidth);
    return routes;
  };
}

export const getAllRoutes = (
  app: Application,
  opts?: typeof defaultOptions
) => {
  const stacks = getStacks(app);
  const options = { ...defaultOptions, ...opts };
  const routes = new RouterDisplay();

  if (stacks) {
    for (const stack of stacks) {
      if (stack.route) {
        const routeLogged: Record<string, boolean> = {};
        for (const route of stack.route.stack) {
          const method = route.method ? route.method.toUpperCase() : null;
          if (method && !routeLogged[method as keyof typeof routeLogged]) {
            const stackMethod: HTTPMethod = method;
            const stackSpace = spacer(options.spacer - method.length);
            const { dir, name } = path.parse(
              [options.prefix, stack.routerPath, stack.route.path, route.path]
                .filter((s) => !!s)
                .join("")
            );
            const stackPath = `${dir}/${name}`.replace(/\/\//g, "/");

            routes.addRoutes({ stackMethod, stackSpace, stackPath });
            routeLogged[method] = true;
          }
        }
      }
    }
  }

  return routes;
};
