const AppBlock = {};
import shopify from "../shopify.js";

AppBlock.createBlock = async (req, res) => {
  try {
    console.log(res.locals.shopify.session, "shopifyshopify");
    const { theme_id } = req.body;
    const asset = await new shopify.api.rest.Asset({
      session: res.locals.shopify.session,
    });
    asset.theme_id = 133686984843;
    asset.key = "templates/collection.json";
    asset.value =
      "<img src='backsoon-postit.png'><p>We are busy updating the store for you and will be back within the hour.</p>";
    await asset.save({
      update: true,
    });

    console.log(asset, "assetasset");
  } catch (error) {
    console.log(error.message);
  }
};

export default AppBlock;
