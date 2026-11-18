import "./preload";
import os from "node:os";
import { buildApp } from "./app";
import { env } from "./config/env";
import { amber, bold, cyan, dim, green } from "./common/utils/terminal";

function getNetworkUrl(port: number): string | null {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const addr of addresses ?? []) {
      if (String(addr.family).includes("4") && !addr.internal) {
        return `http://${addr.address}:${port}`;
      }
    }
  }
  return null;
}

function printStartupInfo(port: number, host: string) {
  const listensOnAll = host === "0.0.0.0" || host === "::";
  const local = `http://${listensOnAll ? "localhost" : host}:${port}`;
  const network = listensOnAll ? getNetworkUrl(port) : null;

  const row = (label: string, value: string) => `  ${dim(label.padEnd(10))}${value}`;

  const lines = [
    "",
    `  ${amber(bold("GenZ API"))} ${dim("v1")}  ${green("ready")}`,
    "",
    row("Local", cyan(local)),
    network ? row("Network", cyan(network)) : null,
    row("Health", cyan(`${local}/health`)),
    row("Ready", cyan(`${local}/ready`)),
    "",
    row("Web", dim("http://localhost:3000")),
    row("Seller", dim("http://localhost:3001")),
    row("Admin", dim("http://localhost:3003")),
    "",
  ];

  console.log(lines.filter((line) => line !== null).join("\n"));
}

async function main() {
  const app = await buildApp();

  let shuttingDown = false;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`\n  ${dim(`${signal} received, shutting down...`)}`);
      try {
        await app.close();
        process.exit(0);
      } catch (err) {
        console.error("Error while shutting down:", err);
        process.exit(1);
      }
    });
  }

  await app.listen({ port: env.PORT, host: env.HOST });
  printStartupInfo(env.PORT, env.HOST);
}

main().catch((err) => {
  console.error("Fatal server initialization error:", err);
  process.exit(1);
});