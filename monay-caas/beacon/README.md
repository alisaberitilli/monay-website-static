# Monay Beacon

// TODO: ADD BUILD STATUS FOR DESKTOP, WEB TARGETS

## Stack

<a href="https://www.typescriptlang.org/" target="_blank"><img height="50" width="50" src="docs/ts.png" /></a><a href="https://www.electronjs.org/" target="_blank"><img height="50" width="50" src="docs/electron.png" /></a><a href="https://evite.netlify.app/" target="_blank"><img height="50" width="50" src="docs/vite.png" /></a> <a href="https://react.dev/" target="_blank"><img height="50" width="50" src="docs/react.png" /></a><a href="https://mobx.js.org/" target="_blank"><img height="50" width="50" src="docs/mobx.png" /></a>
<br/><a href="https://trpc.io/" target="_blank"><img height="50" width="50" src="docs/trpc.png" /></a><a href="https://expressjs.com/" target="_blank"><img height="50" width="50" src="docs/express.png" /></a> <a href="https://swc.rs/" target="_blank"><img height="50" width="50" src="docs/swc.svg" /></a><a href="https://prisma.io" target="_blank"><img height="50" width="50" src="docs/prisma.png" /></a>

or as OSI:

![Screen Shot 2023-08-24 at 12 13 57 PM](https://github.com/tilli-pro/beacon/assets/125515467/7aceef48-55fc-4a2c-88ca-803038c5ae05)

1. Data Layer (DB): postgres+ prisma (schema generation, migration handling)
2. Data Access Layer (Prisma ORM): Prisma
3. Business Logic layer (Server): tRPC, express
4. Transport Layer (TLS + HTTP):
5. Data Access Layer (Client): mobx + tRPC
6. Business Logic Layer (client): tRPC (access server methods)
7. Presentation layer (client): react + electron

## Dependencies

### Electron

// how and why, common usage, DONT

### React

// how and why, common usage, DONT

### tRPC

### Prisma

## Team

## Getting Started

### `.env`

Ask [Ibrahim Ali](@GeorgeIpsum) for dev .env values

Below are the full list of `env` vars that are expanded within the codebase:

```.env
asdf
```

### Project Setup

```zsh
# Postinstall scripts will handle setting up Electron and Prisma
> npm install

# This will run initial migrations against your db and create the db instance if it does not exist
> npx prisma migrate dev

# Runs everything in dev environment (nodemon + SWC for backend and electron-vite dev for frontend)
> npm run dev
```

## Code Structure and Style

### Tools

### Naming Conventions

## Monorepo Structure

Below are logical groupings of the different components of this monorepo.

### Path Aliasing

Path aliasing

### Server

The server application is bootstrapped in `server/index.ts`, with different launch configurations depending on environment.

```
📦beacon
 ┣ 📂server
 ┃ ┣ 📂config
 ┃ ┃ ┣ 📘base.ts
 ┃ ┃ ┣ 📘config.ts
 ┃ ┃ ┣ 📘external.ts
 ┃ ┃ ┗ 📘index.ts
 ┃ ┣ 📂resources             <-- Controller logic stored here
 ┃ ┃ ┣ 📂[resource-name]     <-- e.g. user, organization, xdex
 ┃ ┃ ┃ ┣ 📘index.ts
 ┃ ┃ ┃ ┣ 📘mutations.ts
 ┃ ┃ ┃ ┣ 📘queries.ts
 ┃ ┃ ┃ ┣ 📘subscriptions.ts
 ┃ ┃ ┃ ┗ 📘validators.ts
 ┃ ┃ ┗ 📘index.ts
 ┃ ┣ 📂services              <-- e.g. supabase, clickhouse
 ┃ ┃ ┗ (📂|📘)[service]
 ┃ ┣ 📁utils
 ┃ ┣ 📘_dev.ts
 ┃ ┣ 📘app.ts
 ┃ ┣ 📘ee.ts
 ┃ ┣ 📘index.ts
 ┃ ┣ 📘log.ts
 ┃ ┣ 📘setup.ts
 ┃ ┣ 📘prisma.ts
 ┃ ┣ 📘trpc.ts
 ┃ ┣ 📘types.d.ts
 ┃ ┗ 📒free_mail.json
 ┣ 📂prisma
 ┃ ┣ 📂migrations
 ┃ ┃ ┣ 📂[migration_id]
 ┃ ┃ ┃ ┗ 📜migration.sql
 ┃ ┃ ┗ 📜migration_lock.toml
 ┃ ┣ 📂seed
 ┃ ┃ ┗ 📘seed.ts
 ┃ ┗ 📜schema.prisma
 ┣ 📒.swcrc
 ┗ 📒tsconfig.server.json
```

#### API Resources

> 📂 `server/resources`, `server/app.ts`

Different API resources (e.g. users, organizations, services, nudges, etc) are handled via folders in the `server/resources` folder corresponding to the resource name. Each resource has the following:

- `queries.ts`: pure data fetching (HTTP GET)
- `mutations.ts`: add, modify, delete data (HTTP POST, PUT, DELETE)
- `subscriptions.ts`: engage in direct communication with the client over websocket (WS)
- `validators.ts`: zod validators

Queries, mutations, and subscriptions make up what are called procedures (hence the RPC in tRPC) for resources. Validation schemas built using [Zod](https://zod.dev/) will be used to validate inputs and outputs for each respective procedure. These resources (or routers, as they are constructed in tRPC) are merged into a single tRPC router in `server/resources/index.ts`, which is then added to the Express application in `server/app.ts`.

#### DB

> `server/prisma.ts`, `prisma/**/*`

[Prisma](https://prisma.io) is the ORM used internally to manage our Postgres instance. Schema is managed entirely in `prisma/schema.prisma`, so make sure to have the Prisma extension in VS Code installed to manage the heavy lifting of using and modifying this file. Migrations are tracked locally so as to not ruin branch state because of schema conflicts. `server/prisma.ts` is used to bootstrap connecting to our Postgres instance with our given Prisma Client. This file also handles [Prisma extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions), which we use to extend the functionality of Prisma models and queries.

#### tRPC

> `server/trpc.ts`, `server/resources`

tRPC is bootstrapped in `server/trpc.ts`, and routers are defined in the `server/resources` folder. All middlewares (RBAC and auth primarily) used to properly build context for tRPC procedures are located in `server/trpc.ts`.

#### Config

> `server/config`, `.swcrc` , `tsconfig.server.json`

Environments variables are loaded into different objects in our `server/config` folder; we primarily split these into `base` and `external` env variables. Base variables are ones we manage for internal use, aka our Tilli mID, Nudge credentials, GPS credentials, internal API keys, etc. External variables are for services that we pay for such as Zendesk, Supabase, Sentry, etc.

The `.swcrc` config is used to configure the SWC/ nodemon dev server and specify an entry point for our server application. It handles registering logging and setting up the initial Express application; this is something that we will handle in production environments.

#### Logging

> `server/log.ts`

Logging on the production server application is done via a combination of Pino and Morgan. Morgan will handle HTTP request resolution logging while Pino is used to define logging transports and actually collating and printing to whatever log format is specified.

#### WebSockets

> `server/ee.ts`, `server/resources`

WebSocket communication for handling tRPC subscriptions and for doing real-time communication of updates across clients is bootstrapped in `ee.ts` via strapping some really basic utilities on top of the built-in EventEmitter class.

#### Build

Server builds happen via an SWC build pipeline. The server process itself will be managed via PM2; this will not be containerized for now given the monorepo structure we have here.

### Electron Application

```
📦beacon
 ┣ 📁build
 ┣ 📁resources
 ┣ 📂src
 ┃ ┣ 📂main
 ┃ ┃ ┗ 📘index.ts
 ┃ ┣ 📂preload
 ┃ ┃ ┣ 📘index.d.ts
 ┃ ┃ ┗ 📘index.ts
 ┃ ┣ 📂renderer
 ┃ ┃ ┣ 📂src
 ┃ ┃ ┃ ┣ 📂assets
 ┃ ┃ ┃ ┃ ┗ 📙index.css
 ┃ ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┃ ┣ 📂atoms
 ┃ ┃ ┃ ┃ ┣ 📂form
 ┃ ┃ ┃ ┃ ┣ 📂singletons
 ┃ ┃ ┃ ┃ ┗ [📘...].tsx
 ┃ ┃ ┃ ┣ 📂features
 ┃ ┃ ┃ ┃ ┗ 📂[feature-name]
 ┃ ┃ ┃ ┃   ┣ 📂components
 ┃ ┃ ┃ ┃   ┣ 📂hooks
 ┃ ┃ ┃ ┃   ┣ 📂pages
 ┃ ┃ ┃ ┃   ┣ 📂services
 ┃ ┃ ┃ ┃   ┣ 📂views
 ┃ ┃ ┃ ┃   ┗ 📘index.ts
 ┃ ┃ ┃ ┣ 📁utils
 ┃ ┃ ┃ ┣ 📖App.tsx
 ┃ ┃ ┃ ┣ 📖main.tsx
 ┃ ┃ ┃ ┣ 📘env.d.ts
 ┃ ┃ ┃ ┗ 📘svg.d.ts
 ┃ ┃ ┗ 📄index.html
 ┣ 📜dev-app-update.yml
 ┣ 📜electron-builder.yml
 ┣ 📘electron.vite.config.ts
 ┣ 📔postcss.config.js
 ┣ 📔tailwind.config.js
 ┣ 📒tsconfig.node.json
 ┗ 📒tsconfig.web.json
```

#### Electron

> `src/main/**/*`, `src/preload/**/*`

These files bootstrap the Electron application and allow for configuration + setting up IPC. Our application should very sparingly use IPC at the moment, so there is very little reason to work in here outside of configuring context menus or preload scripts.

Also refer to our [Electron section](#electron-1).

#### React

> `src/renderer/**/*`

All UI logic for the application exists here, and is bootstrapped via `src/renderer/index.html` and `src/renderer/src/main.tsx`. Some additional `.d.ts` files are placed here just to ensure that certain modules can exist or that environment variables Intellisense correctly. Assets should include any application related files that need to be bundled at the UI level but not necessarily the application layer, like `index.css` above. The structure for the UI app exists as follows:

- `components`: More generic components are built in here, and typically are some combination of atomic components + other business logic. Components that can handle backend logic can also exist here.

  - `animations`: Components that essentially create predefined transitions via the `Transition` componenent from the @headlessui/react library
  - `atoms`: Atomic React components exist here. These are components that are used strictly to build "molecules" aka components that are rarely if ever used in isolation. These components should ultimately be transferrable to any context and be able to exist in a UI library, so internally the dependency tree for these components shouldn't extend outside of basic React-land + Tailwind.
  - `form`: Form components
  - `hoc`: General/ generic higher order components
  - `singletons`: Components that only exist as a single instance in the React application. State sharing + context are key for these components

- `features`: Features are logical groupings of functionality (auth, invoicing, payments, etc.) that are usually composed of the following:

  - Specialized `components`
  - React `hooks`
  - `services` that may interface with 3rd party APIs or our own backend
  - Composable UI `views`
  - Dedicated `pages`
  - The delineation between `pages` and `views` is simple. If you should expect the component to be composable, it should be in `views`. If it exists in isolation, it should locate in `pages`
  - A feature can essentially recreate any of the component templating we handle in the `components` folder for added specificity

- `hooks`: Generic React hooks
- `pages`: Webpages that aren't tied to any one specific feature
- `store`: Mobx-keystone lives in here
- `utils`: Utility functions (`sleep()`, etc.) live in this folder.

Also refer to our [React section](#react-1).

#### Configs

> `dev-app-update.yml`, `electron-builder.yml`

Used for Electron.

> `electron.vite.config.ts`, `tsconfig.*.json`

Used for Vite and Typescript.

> `postcss.config.js`, `tailwind.config.js`

Used for TailwindCSS.

#### Other

The `build` and `resources` folders don't require any maintenance, and we will not be using them mostly. `resources` are assets that the Electron application as a whole will use. `build` is simply used for build artifacts and for handling intermediates.

### Workspace & Shared Config

```
📦beacon
 ┣ 📂.vscode
 ┃ ┣ 📒extensions.json
 ┃ ┣ 📒launch.json
 ┃ ┗ 📒settings.json
 ┣ 📜.editorconfig
 ┣ 📜.env
 ┣ 📜.eslintignore
 ┣ 📜.eslintrc.cjs
 ┣ 📜.gitignore
 ┣ 📜.npmrc
 ┣ 📜.prettierignore
 ┣ 📜.prettierrc.js
 ┣ 📒package-lock.json
 ┣ 📒package.json
 ┗ 📒tsconfig.json
```

#### Editor Settings

> `.vscode`, `.editorconfig`

These are general editor settings, with a focus on those used in VS Code workspaces. `extensions.json` contains a list of VS Code extensions everyone should be using (namely ESLint, Prettier, and the Prisma extensions). `launch.json` describes the different ways we can launch our application to VS Code for debugging inside the editor. `settings.json` contain workspace settings that should be used in a VS Code context for this project. `.editorconfig` is used in place of `settings.json` for other editors with native support [such as Sublime Text, JetBrains IDEs, BBEdit, etc](https://editorconfig.org/#pre-installed).

#### Local Environment

Local environment variables will exist in a non-tracked `.env` file. Since we use Vite as a dev server on both the client and server, we can refer to [their documentation](https://vitejs.dev/guide/env-and-mode.html) on how to properly use this in a "Vite"-safe way.

#### ESLint + Prettier

> `.eslintignore`, `.eslintrc.cjs`, `.prettierignore`, `.prettierrc.js`

Configs for these respective linting + formatting tools. Good to note that things like regex for sorting ES6 imports live in our prettier config, and that other linting rules that we consistently break (for good reason) will exist in our ESLint config.

#### Other

All the other files here are used as you expect. The `.npmrc` file designates a mirror for downloading Electron, `package.json` is used for dependency and npm script management, and `tsconfig.json` is used for TypeScript environment settings. There are multiple `tsconfig`s here for the different environments we operate in; namely web, server, and client (desktop application).

### Storybook

```
📦beacon
 ┣ 📂.storybook
 ┃ ┣ 📘main.ts
 ┃ ┗ 📘preview.ts
 ┗ 📂src
   ┗ 📂stories
     ┣ 📘[Component].stories.ts
     ┗ 📜Introduction.mdx
```

UI components get harder to test as the project grows. Those UIs are painful to debug because they’re entangled in business logic, interactive states, and app context.
Enters Storybook.js, that helps web developers build and test different parts (components) of a website or app.

- Storybook helps you build each part of an application separately and it lets you see how each piece (or component) looks and works by itself, making it easier to spot problems.It provides an isolated iframe to render components without interference from app business logic and context. That helps you focus development on each variation of a component, even the hard-to-reach edge cases.
- You can create "stories" for each component, which are like examples of how they work. These stories help you test and document your components. Each component can have multiple stories. Each story allows you to demonstrate a specific variation of that component to verify appearance and behavior.
- Storybook is an interactive directory of your UI components and their stories. In the past, you'd have to spin up the app, navigate to a page, and contort the UI into the right state. This is a huge waste of time and bogs down frontend development. With Storybook, you can skip all those steps and jump straight to working on a UI component in a specific state.

Configuring Storybook happens in `.storybook` and actual stories are created in the `src/stories` folder. Stories should always follow the format of `<ComponentName>.stories.ts`. You should not need to build wrapper components in order to make Storybook work for any given component or atom.

//TODO

## Testing

### Vite-test

### Storybook

### Playwright

## DevOps/ Deployment

- argonaut.dev
- gitops

//TODO

## API Resources and tRPC

// add trpc description, reason for use, common usage patterns, DONT

All primary routes should allow query parameters

### OpenAPI

// how and why, common usage, DONT

#### Primary Routes

- `/` - (Login + Signup)/ Home Page
  - depends on auth state
  - Home Page
- `/billers` - biller center
  - `/billers/:billerId` - individual biller view
  - `/billers/:billerId/edit` - edit master data for biller (supervisor+)
  - `/billers/:billerId/nudges` - communication for individual biller
  - `/billers/search` - search all billers on platform
  - `/billers/nudges` - communication center for all billers
- `/accounts` - accounts/ contracts (fee structure + terms)/ services
  - `/accounts/:accountId`
  - `/accounts/:accountId/edit` - do we need this??
  - `/accounts/:accountId/nudges`
  - `/accounts/search`
  - `/accounts/nudges`
  - `/accounts/compare`
- `/invoices`
  - `/invoices/:invoiceId`
  - `/invoices/:invoiceId/nudges`
  - `/invoices/:invoiceId/pay`
  - `/invoices/search`
  - `/invoices/nudges`
  - `/invoices/compare`
- `/transactions` - tracking payments
  - `/transactions/:transactionId`
  - `/transactions/search`

#### Org Routes

- `/organization`
  - `/organization/:userId` - supervisor+
  - `/organization/edit` - manager
- `/me`
  - `/me/edit`

#### Single-use Routes

- `/onboarding`
- `/kyb`
- `/verify` - waiting for superuser verification

#### Additional Routes

- `/faq`
- `/help`

## Performance Testing

## Data Security

### Encrypytion Standards

### Handling PII

### Log Retention

### SOC2/ PCI DSS

## Modules

// high level modules within the product including other modules that module interacts with

## Understanding Beacon Data

// general beacon data, direct link to ERD.svg
// see if we can generate mermaid diagram using same package

## General Product Roadmap

// VERY GENERALIZED, high-level features to be added on a quarterly basis
