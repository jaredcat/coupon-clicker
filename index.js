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
let config = null;
try {
  config = require('./config.json');
} catch (err) {
  console.error('No config.json found!');
  return;
}
const { email, password } = config;
if (!email) {
  console.error('No username found!');
  return;
} else if (!password) {
  console.error('No password found!');
  return;
}

(async () => {
  try {
    await openBrowser();
    await goto(
      'https://www.vons.com/account/sign-in.html?r=https%3A%2F%2Fwww.vons.com%2Fjustforu%2Fcoupons-deals.html&goto=/justforu/coupons-deals.html',
    );
    await write(email, into(textBox(below('Email'))));
    await write(password, into(textBox(below('Password'))));
    await click($('#btnSignIn'));
    await waitFor(5000);
    expect(await $('#error-message').exists(), 'invalidLogin').to.be.false;
    click($('.create-modal-close-icon'));
    await waitFor(2000);
    console.log('Loading all coupons...');
    let loadMore = true;
    while (loadMore) {
      try {
        await click(button('Load more'));
      } catch (err) {
        console.log('Done loading all coupons!');
        loadMore = false;
      }
    }
    console.log('Clicking all coupons...');
    let moreCoupons = true;
    while (moreCoupons) {
      try {
        await click(button('Add'));
      } catch (err) {
        console.log('No more coupons!');
        moreCoupons = false;
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
