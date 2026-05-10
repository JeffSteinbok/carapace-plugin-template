/**
 * Tests for the example plugin.
 *
 * Demonstrates the standard pattern for testing OpenClaw plugins:
 * 1. Import createEntry() and call register() with a mock API
 * 2. Pass pluginConfig to show how config flows through
 * 3. Invoke tools via execute() and assert on the result
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

interface ToolDef {
  name: string;
  description: string;
  parameters: unknown;
  execute: (id: string, params: Record<string, unknown>) => Promise<unknown>;
}

function makeApi(pluginConfig: Record<string, unknown> = {}) {
  const tools: Record<string, ToolDef> = {};
  return {
    pluginConfig,
    registerTool(tool: unknown) {
      const t = tool as ToolDef;
      tools[t.name] = t;
    },
    tools,
  };
}

async function loadPlugin(pluginConfig: Record<string, unknown> = {}) {
  const { createEntry } = await import("../src/plugin.js");
  const entry = createEntry();
  const api = makeApi(pluginConfig);
  entry.register(api);
  return { entry, api };
}

function parseResult(result: unknown): unknown {
  const text = (result as { content: Array<{ text: string }> }).content[0].text;
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// Plugin registration
// ---------------------------------------------------------------------------

describe("plugin entry", () => {
  it("has correct id and name", async () => {
    const { entry } = await loadPlugin();
    expect(entry.id).toBe("my-plugin");
    expect(entry.name).toBe("My Plugin");
  });

  it("registers the greet tool", async () => {
    const { api } = await loadPlugin();
    expect(api.tools["greet"]).toBeDefined();
    expect(api.tools["greet"].description.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// greet tool — default config
// ---------------------------------------------------------------------------

describe("greet tool (default config)", () => {
  it("greets by name with default greeting", async () => {
    const { api } = await loadPlugin();
    const result = await api.tools["greet"].execute("id", { name: "World" });
    const data = parseResult(result) as { message: string };
    expect(data.message).toBe("Hello, World!");
  });

  it("uses fallback when name is omitted", async () => {
    const { api } = await loadPlugin();
    const result = await api.tools["greet"].execute("id", {});
    const data = parseResult(result) as { message: string };
    expect(data.message).toBe("Hello, there!");
  });
});

// ---------------------------------------------------------------------------
// greet tool — custom config
// ---------------------------------------------------------------------------

describe("greet tool (custom config)", () => {
  it("uses configured greeting word", async () => {
    const { api } = await loadPlugin({ greeting: "Howdy" });
    const result = await api.tools["greet"].execute("id", { name: "Partner" });
    const data = parseResult(result) as { message: string };
    expect(data.message).toBe("Howdy, Partner!");
  });

  it("greeting config defaults to Hello when not set", async () => {
    const { api } = await loadPlugin({});
    const result = await api.tools["greet"].execute("id", { name: "World" });
    const data = parseResult(result) as { message: string };
    expect(data.message).toBe("Hello, World!");
  });

  it("uses custom greeting with fallback name", async () => {
    const { api } = await loadPlugin({ greeting: "G'day" });
    const result = await api.tools["greet"].execute("id", {});
    const data = parseResult(result) as { message: string };
    expect(data.message).toBe("G'day, there!");
  });
});
