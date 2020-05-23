const {
  openBrowser,
  goto,
  click,
  below,
  textBox,
  write,
  button,
  closeBrowser,
} = require("taiko");
const site = "Vons";

module.exports = async (email, password) => {
  await (async () => {
    if (!email) {
      console.error(`No ${site} email found!`);
      return;
    } else if (!password) {
      console.error(`No ${site} password found!`);
      return;
    }

    try {
      await openBrowser();
      await goto(
        "https://www.vons.com/account/sign-in.html?r=https%3A%2F%2Fwww.vons.com%2Fjustforu%2Fcoupons-deals.html&goto=/justforu/coupons-deals.html",
      );
      await write(email, into(textBox(below("Email"))));
      await write(password, into(textBox(below("Password"))));
      await click($("#btnSignIn"));
      await waitFor(5000);
      if (await $("#error-message").exists()) throw new Error("invalidLogin");
      if (await $(".create-modal-close-icon").exists())
        await click($(".create-modal-close-icon"));
      await waitFor(2000);
      let couponsClicked = 0;
      let loadMore = true;
      while (loadMore) {
        try {
          console.log("Clicking coupons...");
          let moreCoupons = true;
          while (moreCoupons) {
            try {
              await click(button("Add"));
              couponsClicked++;
            } catch (err) {
              moreCoupons = false;
            }
          }
          console.log("Loading more coupons...");
          await click(button("Load more"));
        } catch (err) {
          console.log("Done clicking all coupons!");
          console.log(
            `${couponsClicked} new coupons were added to your ${site} account`,
          );
          loadMore = false;
        }
      }
    } catch (error) {
      if (error.message.startsWith("invalidLogin")) {
        console.error("Invalid email or password");
      } else {
        console.error(error);
      }
    } finally {
      await closeBrowser();
    }
  })();
};
