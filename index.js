import "dotenv/config";
import { serve } from "@hono/node-server";
import { config } from "./src/config.js";
import { createNodeServer } from "./src/app.js";

/**
 * Tanpa top-level await: LiteSpeed/cPanel (lsnode.js) memuat entry dengan require()
 * dan tidak kompatibel dengan modul ESM yang punya top-level await (ERR_REQUIRE_ASYNC_MODULE).
 */
(async () => {
  const { ctx, app } = await createNodeServer();

  const server = serve({
    fetch: app.fetch,
    port: config.port,
    /** Wajib di banyak host (cPanel/Docker) agar proxy bisa reach proses Node */
    hostname: "0.0.0.0",
  });
  ctx.ws.attach(server);
  process.stdout.write(`API listening on http://0.0.0.0:${config.port}\n`);

  const shutdown = async () => {
    server.close?.();
    await ctx.shutdown?.();
  };

  process.on("SIGINT", async () => {
    await shutdown();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await shutdown();
    process.exit(0);
  });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
