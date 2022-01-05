const { goto, click, textBox, write, button, setConfig } = require('taiko');
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
      await goto('https://www.target.com', {
        headers: {
          'User-Agent':
            ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
        },
      });
      await click('Sign in');
      await waitFor(1000);
      await click($('#accountNav-signIn'));
      await waitFor(3000);
      await write(email, into(textBox('Email')), { waitForNavigation: false });
      await write(password, into(textBox('Password')), {
        waitForNavigation: false,
      });
      await click($('#login'));

      const invalidLogin = await Promise.race([
        text("can't find your account").exists(),
        text('something went wrong').exists(),
      ]);
      if (invalidLogin) throw new Error('invalidLogin');

      await goto('https://www.target.com/offers/target-circle', {
        waitForEvents: ['firstMeaningfulPaint'],
      });
      await waitFor(5000);
      await click(button({ id: 'sort-bar' }), { waitForNavigation: false });
      await waitFor(1000);
      await click('Discount');
      await waitFor(2000);
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
      await click($('#account'));
      await click($('#listaccountNav-guestSignOut'));
    } catch (error) {
      if (error.message.startsWith('invalidLogin')) {
        console.error('Invalid email or password');
      } else {
        console.error(error);
      }
    }
  })();
};
