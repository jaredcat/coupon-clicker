const {
  openBrowser,
  goto,
  click,
  textBox,
  write,
  button,
  closeBrowser,
  setConfig,
} = require('taiko');
const site = 'Target';

module.exports = async (email, password) => {
  setConfig({ observeTime: 0 });
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
      await goto('https://www.target.com', {
        headers: {
          'User-Agent':
            ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
        },
      });
      await click('Sign in');
      await waitFor(3000);
      await click($('#accountNav-signIn'));
      await write(email, into(textBox('Email')));
      await write(password, into(textBox('Password')));
      await click($('#login'));

      const invalidLogin = await Promise.race([
        text("can't find your account").exists(),
        text('something went wrong').exists(),
      ]);
      if (invalidLogin) throw new Error('invalidLogin');

      await goto('https://www.target.com/offers/target-circle', {
        waitForEvents: ['firstMeaningfulPaint'],
      });
      await click(button('sort'));
      await waitFor(1000);
      await click('Trending');
      await waitFor(1000);
      let couponsClicked = 0;
      let loadMore = true;
      while (loadMore) {
        try {
          console.log('Clicking coupons...');
          let moreCoupons = true;
          while (moreCoupons) {
            try {
              await click('Save offer');
              if (await $('div[data-test=popover]').exists()) {
                console.log(
                  'Your list is full. Check back later after you used some offer or after offers expire',
                );
                loadMore = false;
                throw new Error('full');
              }
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
