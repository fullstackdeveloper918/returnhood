const WaitSave = {};
import Db from "../db.js";
import { v4 as uuidv4 } from "uuid";

WaitSave.saveWait = async (req, res) => {
  try {
    console.log(req.body, "body is here");
    const {
      product_id,
      product_variant_id,
      user_id,
      user_name,
      user_email,
      product_name,
      product_price,
      product_quantity,
      product_status,
      product_image,
      product_type,
      shiping_address,
      body_html,
      product_url,
    } = req.body;

    const values = [
      uuidv4(),
      product_id,
      product_variant_id,
      user_id,
      user_name,
      user_email,
      product_name,
      product_price,
      product_quantity,
      product_status,
      product_image,
      product_type,
      shiping_address,
      body_html,
      product_url,
    ];

    const isProdExist = await WaitSave.isProductExist(product_id);
    console.log(isProdExist, "is product exist");

    if (isProdExist > 0) {
      res.json({
        status: 500,
        message: "Product is already exist",
      });
    } else {
      let sql =
        "INSERT INTO wait_save_user(wait_save_user_uuid,product_id,product_variant_id,user_id,user_name,user_email,product_name,product_price,product_quantity,product_status,product_image,product_type,shiping_address,body_html,product_url) VALUES (?)";

      Db.query(sql, [values], function (err, result) {
        if (err) throw err;
        res.json({
          status: 200,
          message: "Product save for wait and save",
        });
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

WaitSave.particularUserWaitSave = async (req, res) => {
  try {
    const { user_id } = req.body;

    let sql = "SELECT * FROM wait_save_user WHERE user_id = ?";

    Db.query(sql, [user_id], async function (err, result) {
      if (err) throw err.message;

      for (let i = 0; i < result.length; i++) {
        result[i].discountData = await WaitSave.getDiscount(
          result[i]?.product_variant_id
        );
      }
      res.json({
        status: 200,
        data: result,
      });
    });
  } catch (error) {
    throw error.message;
  }
};

WaitSave.getDiscount = async (variantId) => {
  let variantIds = JSON.parse(variantId);

  let sql = `SELECT * FROM discount WHERE JSON_CONTAINS(product_variant_id, ${variantIds})`;

  console.log(sql, "variant ids");
  return new Promise((resolve, reject) => {
    Db.query(sql, function (err, result) {
      console.log(sql, "result");
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

WaitSave.isProductExist = async (product_id) => {
  let sql = "SELECT * FROM wait_save_user WHERE product_id = ?";

  return new Promise((resolve, reject) => {
    Db.query(sql, [product_id], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result && result.length > 0 ? result.length : 0);
      }
    });
  });
};

WaitSave.allWaitListProductOfUser = async (req, res) => {
  try {
    let sql =
      "SELECT DISTINCT (user_id), user_name,user_email,shiping_address FROM wait_save_user";
    Db.query(sql, async function (err, result) {
      if (err) throw err;

      if (result) {
        for (let i = 0; i < result.length; i++) {
          const userId = result[i].user_id;
          const countResult = await WaitSave.addedProductCount(userId);
          result[i].total_products = countResult;
        }
      }

      res.json({
        status: 200,
        data: result,
      });
    });
  } catch (error) {
    throw error.message;
  }
};

WaitSave.addedProductCount = async (userId) => {
  let sql =
    "SELECT  COUNT(*) AS total_products FROM wait_save_user WHERE user_id = ?";
  return new Promise((resolve, reject) => {
    Db.query(sql, [userId], function (err, result) {
      if (err) {
        reject(err);
      } else {
        let totalResult = result[0].total_products;
        resolve(totalResult);
      }
    });
  });
};

export default WaitSave;
