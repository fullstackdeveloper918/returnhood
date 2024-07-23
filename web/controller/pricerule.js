const PriceRule = {};
import shopify from "../shopify.js";
import Db from "../db.js";
import { v4 as uuidv4 } from "uuid";
PriceRule.getPriceRule = async (req, res) => {
  try {
    const priceRule = await shopify.api.rest.PriceRule.all({
      session: res.locals.shopify.session,
    });
    res.status(200).send(priceRule);
  } catch (error) {
    throw error;
  }
};

PriceRule.removeExtra = (sourceArray, itemRemove) => {
  return sourceArray.filter((item) => !itemRemove.includes(item));
};

PriceRule.updatePriceRule = async (req, res) => {
  try {
    const { rule_id, product_variant_id, product_id } = req.body;

    const varint_rule_price = await shopify.api.rest.PriceRule.find({
      session: res.locals.shopify.session,
      id: rule_id,
    });

    console.log(varint_rule_price, "variant rule price");

    const filteredKey = PriceRule.removeExtra(
      product_variant_id,
      varint_rule_price.entitled_variant_ids
    );

    console.log(filteredKey, "filteredKeyfilteredKey");
    const entitledVariantIds = varint_rule_price.entitled_variant_ids || [];

    if (!entitledVariantIds.includes(filteredKey)) {
      entitledVariantIds.push(...filteredKey);
    }

    varint_rule_price.id = Number(rule_id);
    varint_rule_price.entitled_variant_ids = entitledVariantIds;

    const isPriceRuleUpdated = await varint_rule_price.save({
      update: true,
    });

    const isDiscountApplied = await PriceRule.getDiscount(product_id);

    console.log(isDiscountApplied, "isDiscountApplied");
    if (isDiscountApplied < 1) {
      const productMeta = await new shopify.api.rest.Product({
        session: res.locals.shopify.session,
      });

      productMeta.id = product_id;
      productMeta.metafields = [
        {
          key: "latestProduct",
          value: 1,
          type: "boolean",
          namespace: "custom",
        },
      ];
      const productMetaAdd = await productMeta.save({
        update: true,
      });
    }

    // end here
    let Obj = {};
    if (isPriceRuleUpdated) {
      const ruleObj = {
        rule_id,
        filteredKey,
        product_id,
        varint_rule_price,
      };
      await PriceRule.saveDiscountValue(ruleObj);
      Obj = {
        status: 200,
        message: "Variant Updated Successfully",
      };
    } else {
      Obj = {
        status: 500,
        message: "Variant Failed",
      };
    }

    res.status(200).send(Obj);
  } catch (error) {
    console.log(error.message, "message");
  }
};

PriceRule.getDiscount = async (productId) => {
  let sql = "SELECT * FROM discount WHERE product_id = ?";

  return new Promise((resolve, reject) => {
    Db.query(sql, [productId], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.length);
      }
    });
  });
};

PriceRule.saveDiscountValue = async (obj) => {
  const variantIds = JSON.stringify(obj?.filteredKey);

  const values = [
    uuidv4(),
    obj?.product_id,
    obj?.rule_id,
    variantIds,
    obj?.varint_rule_price?.value_type,
    // obj?.varint_rule_price?.title
    obj?.varint_rule_price?.value,
    obj?.varint_rule_price?.starts_at,
    obj?.varint_rule_price?.ends_at,
  ];

  console.log(values, "values are here");
  let sql =
    "INSERT INTO discount(uuid,product_id,rule_id,product_variant_id,value_type,value,start_date,end_date) VALUES (?)";

  Db.query(sql, [values], function (err, result) {
    if (err) throw err;
    return true;
  });
};
export default PriceRule;
