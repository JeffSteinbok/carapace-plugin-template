# 🦞🐚 carapace-plugin-template

Starter template for building [OpenClaw](https://github.com/JeffSteinbok/openclaw) plugins with the [Carapace SDK](https://github.com/JeffSteinbok/carapace-plugin-sdk).

Click **"Use this template"** on GitHub to scaffold your plugin in seconds.

## Getting started

1. Click **"Use this template"** → **"Create a new repository"**
2. Clone your new repo and `npm install`
3. Find-and-replace `my-plugin` / `My Plugin` with your plugin's name
4. Edit `src/plugin.ts` — define your config and tools there
5. `npm run build` — generates the adapter, CLI, and manifest

```bash
npm install
npm run build
npm test
node dist/bin/my-plugin.js --help
```

## Project structure

```
my-plugin/
├── src/
│   └── plugin.ts         ← Define your tools and config here
├── tests/
│   └── plugin.test.ts    ← Tests (vitest)
├── scripts/
│   └── deploy.mjs        ← npm run deploy (build + pack + install)
├── package.json
├── tsconfig.json         ← One line: extends SDK base config
└── tsup.config.ts        ← Three lines: uses SDK shared config
```

Files generated at build time (do not edit or commit):
```
dist/
├── plugin.js             ← Compiled plugin
├── adapter.js            ← OpenClaw adapter
└── bin/
    └── my-plugin.js      ← Standalone CLI
openclaw.plugin.json      ← Plugin manifest
out/
└── my-plugin.tgz         ← Packed plugin (npm run deploy)
```

## Writing your plugin

All you do is define your tools and config in `src/plugin.ts`. Use `definePlugin()` from the SDK:

```ts
import { definePlugin } from "carapace-plugin-sdk";
import { Type } from "@sinclair/typebox";

// `createEntry` is a required export name — the SDK's build tools look for it by name.
export const createEntry = definePlugin({
  id: "my-plugin",
  name: "My Plugin",
  description: "A simple example OpenClaw plugin built with Carapace.",

  // TypeBox schema — drives config validation, TypeScript inference,
  // the OpenClaw settings UI, and CLI environment variable mapping.
  configSchema: Type.Object({
    greeting: Type.Optional(
      Type.String({ description: 'Greeting word (e.g. "Hello", "Howdy"). Defaults to "Hello".' }),
    ),
  }),

  // tools() receives a typed factory. Each tool's params and config
  // are fully inferred — no casts, no formatResult(), no boilerplate.
  tools: (tool) => [
    tool({
      name: "greet",
      description: "Say hello to someone by name.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Name to greet." })),
      }),
      execute: async ({ name }, config) => ({
        //               ^^^^   ^^^^^^
        //        string | undefined   { greeting?: string }  — both inferred ✓
        message: `${config.greeting ?? "Hello"}, ${name ?? "there"}!`,
      }),
    }),
  ],
});
```

For plugins with significant logic, split data fetching or business logic into separate files and import them into `execute`. The SDK puts no constraints on how you organise your code — `src/plugin.ts` is just the entry point.

## CLI — for free

Your plugin is also a standalone CLI with no extra code:

```bash
# After npm run build:
node dist/bin/my-plugin.js --help
node dist/bin/my-plugin.js greet --name World
node dist/bin/my-plugin.js greet --name World --json

# Config via environment variables:
MY_PLUGIN_GREETING=Howdy node dist/bin/my-plugin.js greet --name World
```

Each config field in `configSchema` maps to an env var:
`<PLUGIN_ID_SCREAMING_SNAKE>_<FIELD_SCREAMING_SNAKE>`

## Deploying to OpenClaw

Install the plugin as a packed, managed install rather than pointing
`plugins.load.paths` at your dev checkout. A managed install contains only the
built code and production dependencies, so OpenClaw doesn't have to snapshot
your dev `node_modules` (vitest, tsup, typescript, …) on every update.

```bash
npm run deploy              # build → pack to out/my-plugin.tgz → print install command
npm run deploy -- --install # same, then run the install command
```

The install command it prints (and runs with `--install`) is:

```bash
openclaw plugins install npm-pack:<repo>/out/my-plugin.tgz --force
```

OpenClaw installs the tarball into its managed plugin root and installs the
package's `dependencies` (not `devDependencies`) from npm. Dev loop: edit →
`npm run deploy -- --install`.

What goes in the pack is controlled by `"files"` in `package.json` (default:
`dist`, `openclaw.plugin.json`, `README.md`). If your plugin loads anything
else at runtime — data files, scripts, assets — add it to `"files"`, and make
sure every runtime import is in `dependencies`. The deploy script lists the
packed files and refuses to deploy if `src/`, `tests/` or `node_modules/` end
up in the pack.

> The pack is made with `npm pack`, not `openclaw plugins pack`: the latter
> only accepts plugins built with OpenClaw's own tool/feature authoring
> metadata and bundles everything into a single file.

## Testing

Tests call `createEntry()` directly — no mocking needed:

```ts
import { createEntry } from "../src/plugin.js";

const entry = createEntry();
const tools: Record<string, any> = {};
entry.register({
  registerTool: (t: any) => { tools[t.name] = t; },
  pluginConfig: { greeting: "Howdy" },
});

const result = await tools["greet"].execute("id", { name: "World" });
// result.content[0].text → '{"message":"Howdy, World!"}'
```

## Checklist

- [ ] Find-and-replace `my-plugin` / `My Plugin` with your plugin's name
- [ ] Update `id`, `name`, `description` in `src/plugin.ts`
- [ ] Define your `configSchema` fields
- [ ] Write your tools
- [ ] Write tests
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] `node dist/bin/<name>.js --help` works
- [ ] `"files"` in `package.json` covers everything loaded at runtime
- [ ] `npm run deploy` packs cleanly

## Built with 🦞🐚 Carapace

[carapace-plugin-sdk](https://www.npmjs.com/package/carapace-plugin-sdk) — the SDK powering this template. ([source](https://github.com/JeffSteinbok/carapace-plugin-sdk))

## License

MIT
