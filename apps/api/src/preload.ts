/**
 * Preload bootstrap hook for standalone Fastify API.
 * Neutralizes the Next.js "server-only" marker package in standard Node.js/tsx runtimes.
 */
if (typeof require !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Module = require("module");
    const origRequire = Module.prototype.require;
    Module.prototype.require = function (id: string, ...args: unknown[]) {
      if (id === "server-only") {
        return {};
      }
      return origRequire.apply(this, [id, ...args]);
    };
  } catch {
    // ignore
  }
}

