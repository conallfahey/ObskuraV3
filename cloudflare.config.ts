import { defineConfig } from "cf/config";

export default defineConfig(({ mode }) => ({
  accountId: "f614d8fa036fd98624f478d460442b5c",
  worker: {
    name: "obskura-us",
    compatibilityDate: "2026-11-25",
    workersDev: true,
    assets: {
      htmlHandling: "drop-trailing-slash",
      notFoundHandling: "404-page",
    },
    observability: {
      enabled: true,
      logs: { enabled: true },
      traces: { enabled: true },
    },
    ...(mode === "production"
      ? { domains: ["obskura.us", "www.obskura.us"] }
      : {}),
  },
}));
