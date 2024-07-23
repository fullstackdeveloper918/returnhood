// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import router from "./route/route.js";
import waitlistuser from "./controller/waitlistuser.js";
import Notification from "./controller/notification_wait_save.js";
import bodyParser from "body-parser";
import cron from "node-cron";

console.log(shopify.api.rest.StorefrontAccessToken, "token");
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

app.post("/api/wait-save-add", waitlistuser.saveWait);
app.post("/api/partiuclar-user-wait-save", waitlistuser.particularUserWaitSave);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/", router);

cron.schedule("* * * * *", async (req, res) => {
  console.log("new here");

  // const shopifySession = res.locals.shopify.session;
  // console.log(shopifySession, "shopifySession");
  // await Notification.isItemAvailable(shopifySession);
});

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
