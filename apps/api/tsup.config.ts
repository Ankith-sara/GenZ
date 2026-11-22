import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["cjs"],
  target: "node20",
  clean: true,
  sourcemap: true,
  noExternal: [
    "@genz/services",
    "@genz/database",
    "@genz/validation",
    "@genz/types",
    "@genz/utils",
  ],
  esbuildPlugins: [
    {
      name: "ignore-server-only",
      setup(build) {
        build.onResolve({ filter: /^server-only$/ }, () => {
          return { path: "server-only", namespace: "ignore" };
        });
        build.onLoad({ filter: /.*/, namespace: "ignore" }, () => {
          return { contents: "module.exports = {};", loader: "js" };
        });
      },
    },
  ],
});
