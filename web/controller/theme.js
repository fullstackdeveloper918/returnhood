const Theme = {};
import shopify from "../shopify.js";

Theme.getTheme = async (req, res) => {
  try {
    console.log(res.locals.shopify.session, "session");
    const themeData = await shopify.api.rest.Theme.all({
      session: res.locals.shopify.session,
    });

    res.status(200).send(themeData);
  } catch (error) {
    throw error;
  }
};

export default Theme;
