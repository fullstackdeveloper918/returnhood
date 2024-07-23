const Product = {};
import shopify from "../shopify.js";
import Db from "../db.js";
Product.listing = async (req, res) => {
  try {
    const products = await shopify.api.rest.Product.all({
      session: res.locals.shopify.session,
    });

    const list = products?.data;

    for (let i = 0; i < list.length; i++) {
      const productId = list[i].id;
      const metaFieldResponse = await shopify.api.rest.Metafield.all({
        session: res.locals.shopify.session,
        metafield: { owner_id: productId, owner_resource: "product" },
      });

      list[i].meta_fields_data = metaFieldResponse;
    }

    res.status(200).send(list);
  } catch (err) {
    throw err;
  }
};

Product.addMetaField = async (req, res) => {
  try {
    console.log(_req.body, "new heyiii");
    const { product_id } = _req.body;
    const productMeta = await shopify.api.rest.Metafield.all({
      session: res.locals.shopify.session,
      metafield: { owner_id: product_id, owner_resource: "product" },
    });
    res.json({
      productMeta,
    });
  } catch (error) {
    throw error;
  }
};

Product.variant = async (req, res) => {
  try {
    const { product_id, price_rule_id } = req.body;

    const variantList = await shopify.api.rest.Variant.all({
      session: res.locals.shopify.session,
      product_id: product_id,
    });

    const variantData = variantList?.data;

    const isAppliedDiscount = await shopify.api.rest.PriceRule.find({
      session: res.locals.shopify.session,
      id: price_rule_id,
    });

    for (let i = 0; i < variantData.length; i++) {
      variantData[i].variantApplied = isAppliedDiscount;
      // variantList[i].data?.variantData = isAppliedDiscount;
    }

    // const priceRuleData = await shopify.api.rest.PriceRule.all({
    //   session: res.locals.shopify.session,
    // });
    // const ruleList = priceRuleData?.data;

    res.json({
      variantData,
    });
  } catch (error) {
    throw error;
  }
};

Product.productCount = async (req, res) => {
  try {
    console.log("product count is here");
    const countData = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    res.status(200).send(countData);
  } catch (error) {
    throw error;
  }
};

Product.product = async (req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
};

Product.filter = async (req, res) => {
  try {
    let sql = "SELECT * FROM wait_save_user";
    Db.query(sql, async function (err, result) {
      if (err) throw err;

      res.json({
        status: 200,
        data: result,
      });
    });
  } catch (error) {
    console.log(error.message, "message");
  }
};

export default Product;
