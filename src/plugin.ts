/**
 * My Plugin — example OpenClaw plugin built with Carapace.
 *
 * This is the only file you need to write. Export `createEntry` from `definePlugin`
 * and the build generates the adapter and CLI entry automatically.
 *
 * Replace the tool and config below with your own logic.
 */

import { definePlugin } from "carapace-plugin-sdk";
import { Type } from "@sinclair/typebox";

// `createEntry` is a required export name — the SDK's build tools look for it by name.
export const createEntry = definePlugin({
  id: "my-plugin",
  name: "My Plugin",
  description: "A simple example OpenClaw plugin built with Carapace.",

  configSchema: Type.Object({
    greeting: Type.Optional(
      Type.String({
        description: 'Word to use at the start of the greeting (e.g. "Hello", "Howdy"). Defaults to "Hello".',
      }),
    ),
  }),

  tools: (tool) => [
    tool({
      name: "greet",
      label: "Greet",
      description: "Say hello to someone by name.",
      parameters: Type.Object({
        name: Type.Optional(
          Type.String({ description: "Name of the person to greet. Defaults to 'there'." }),
        ),
      }),
      execute: async ({ name }, config) => ({
        message: `${config.greeting ?? "Hello"}, ${name ?? "there"}!`,
      }),
    }),
  ],
});
