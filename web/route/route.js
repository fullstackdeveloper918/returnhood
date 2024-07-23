import express from "express";
import Theme from "../controller/theme.js";
import Product from "../controller/product.js";
import PriceRule from "../controller/pricerule.js";
import AppBlock from "../controller/appblock.js";
import WaitSave from "../controller/waitlistuser.js";
import Notification from "../controller/notification_wait_save.js";

const router = express.Router();

router.get("/api/theme", Theme.getTheme);
router.put("/api/create/block", AppBlock.createBlock);

router.get("/api/products/testinglisting", Product.listing);
router.post("/api/product/metaFields", Product.addMetaField);
router.post("/api/product/variant", Product.variant);
router.get("/api/products/count", Product.productCount);
router.post("/api/products", Product.product);

router.put("/api/rule/price", PriceRule.updatePriceRule);
router.get("/api/price/rule", PriceRule.getPriceRule);

// wait and save later

router.get("/api/all-user-wait-product", WaitSave.allWaitListProductOfUser);

router.get("/api/notificaiton", Notification.isItemAvailable);

export default router;
