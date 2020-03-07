const {
  openBrowser,
  goto,
  click,
  below,
  textBox,
  write,
  button,
  closeBrowser,
} = require('taiko');
expect = require('chai').expect;
const site = 'Target';

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
      await openBrowser({
        port: 9229,
        args: ['--disable-web-security'],
        headless: false,
      });
      await goto('https://www.target.com');
      await click('Sign in');
      await waitFor(3000);
      await click($('#accountNav-signIn'));
      await write(email, into(textBox('Email')));
      await write(password, into(textBox('Password')));
      await click($('#login'));
      expect(await text("can't find your account").exists(), 'invalidLogin').to
        .be.false;
      expect(await text('something went wrong').exists(), 'invalidLogin').to.be
        .false;
      await goto('https://www.target.com/offers/target-circle', {
        waitForEvents: ['firstMeaningfulPaint'],
      });
      let couponsClicked = 0;
      let loadMore = true;
      while (loadMore) {
        try {
          console.log('Clicking coupons...');
          let moreCoupons = true;
          while (moreCoupons) {
            try {
              await click('Save offer');
              couponsClicked++;
            } catch (err) {
              moreCoupons = false;
            }
          }
          console.log('Loading more coupons...');
          await click(button('Load'));
        } catch (err) {
          console.log('Done clicking all coupons!');
          console.log(
            `${couponsClicked} new coupons were added to your ${site} account`,
          );
          loadMore = false;
        }
      }
    } catch (error) {
      if (error.message.startsWith('invalidLogin')) {
        console.error('Invalid email or password');
      } else {
        console.error(error);
      }
    } finally {
      await closeBrowser();
    }
  })();
};
