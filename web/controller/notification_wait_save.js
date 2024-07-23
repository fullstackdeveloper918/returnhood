const Notification = {};
import shopify from "../shopify.js";
import Db from "../db.js";
import nodemailer from "nodemailer";

Notification.isItemAvailable = async (req, res) => {
  try {
    console.log("reached here");
    console.log(res.locals.shopify.session, "shopify");
    const sql =
      "SELECT user_id,product_id,product_variant_id,user_email,user_name FROM wait_save_user WHERE is_product_aviable = ? AND is_notification_sent = ?";
    Db.query(sql, ["1", "0"], async function (err, result) {
      if (err) throw err;

      console.log(result, "result");
      if (result && result?.length > 0) {
        for (let i = 0; i < result.length; i++) {
          const productVariantId = result[i].product_variant_id;
          const user_name = result[i].user_name;
          const user_email = result[i].user_email;

          const variant = await Notification.singleVariantData(
            productVariantId,
            res.locals.shopify.session
          );

          let variantObj = {
            user_name,
            user_email,
            productVariantId,
            variant,
          };

          const isVariant = await Notification.sendEmailIfHasVariant(
            variantObj
          );
        }
      } else {
        let msg = "Record is empty";
        res.status(500).send(msg);
      }
    });
  } catch (error) {
    throw error;
  }
};

Notification.singleVariantData = async (product_variant_id, shopifySession) => {
  const singleProductList = await shopify.api.rest.Variant.find({
    session: shopifySession,
    id: product_variant_id,
  });
  console.log(singleProductList, "singleProductList");

  return singleProductList;
};

Notification.sendEmailIfHasVariant = async (variantObj) => {
  let variant = variantObj?.variant,
    usrName = variantObj?.user_name,
    variantId = variantObj?.productVariantId,
    usr_email = variantObj?.user_email;

  if (variant?.inventory_quantity == 1) {
    const isSent = await Notification.sendEmailFunc(
      usr_email,
      usrName,
      variantId
    );
    console.log(isSent, "is sent is here");

    if (isSent.variantId) {
      await Notification.updateVariant(variantId);
    } else {
      return false;
    }

    console.log(isSent, "isent");
  }
};

Notification.sendEmailFunc = async (userEmail, usrName, variantId) => {
  try {
    const from_email = "fullstackdeveloper918@gmail.com";
    const subject = "Hii Product is able ";

    // const { EMAIL_APP_PASSWORD, EMAIL_APP_EMAIL } = process.env;
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fullstackdeveloper918@gmail.com",
        pass: "lpsicaobquqntkwh",
      },
    });

    const isMailSend = await transporter.sendMail({
      from: from_email,
      to: userEmail,
      subject: subject,
      html: "The item which you have choose for wait and save later . It's now avaiable. ",
    });
    if (isMailSend) {
      let obj = {
        variantId,
      };
      return obj;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message, "message");
  }
};

Notification.updateVariant = async (variantId) => {
  var sql =
    "UPDATE wait_save_user SET is_notification_sent = ? WHERE product_variant_id = ?";
  return new Promise((resolve, reject) => {
    Db.query(sql, ["1", variantId], function (err, result) {
      console.log(result, "result");
      if (err) {
        reject(err);
      } else {
        resolve("update");
      }
    });
  });
};
export default Notification;
