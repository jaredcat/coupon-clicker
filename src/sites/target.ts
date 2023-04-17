import { Page } from 'puppeteer';
import { clickNavButton, clickOnXpath, waitFor } from '../utils';

const site = 'Target';
const loginUrl = 'https://www.target.com/account';

const loginButton = 'button[type=submit]';

async function run(page: Page, email: string, password: string) {
  const offersPage = 'https://www.target.com/circle/offers';
  const saveOfferButtonXpath = "//button//div[text()='Save offer']";
  const loadMoreButtonXpath = "//button[contains(., 'Load more')]";

  if (!email) {
    console.error(`No ${site} email found!`);
    return;
  } else if (!password) {
    console.error(`No ${site} password found!`);
    return;
  }

  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await page.waitForSelector('input[name=username]');

  await page.type('input[name=username]', email);
  await page.type('input[name=password]', password);

  const button = await page.$(loginButton);
  if (button) {
    await clickNavButton(page, button);
  }

  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await page.goto(offersPage, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await page.click('button[id=sort-bar]');
  await clickOnXpath(page, "//a[contains(., 'Trending')]");

  await page.waitForXPath(loadMoreButtonXpath);

  let couponsClicked = 0;
  let loadMore = true;
  while (loadMore) {
    const offerButtons = await page.$x(saveOfferButtonXpath);
    for (let i = 0; i < offerButtons.length; i++) {
      await clickOnXpath(page, offerButtons[i], 2500);

      // Target has a limit on how many offers you can have at once
      // Check if hit the max offers clipped
      if (await page.$('.ModalDrawer')) {
        loadMore = false;
        break;
      }
      couponsClicked++;
    }

    if (loadMore) {
      await clickOnXpath(page, loadMoreButtonXpath, 3000);
    }
  }

  console.log(`Loaded ${couponsClicked} new offers for ${email}!`);

  await page.reload({ waitUntil: ['domcontentloaded', 'networkidle2'] });

  await page.waitForSelector('a[data-test="@web/AccountLink"]');
  console.log('1');
  await page.click('a[data-test="@web/AccountLink"]');
  console.log('2');
  await waitFor(2000);
  await page.waitForSelector('a[data-test="accountNav-guestSignOut"]');
  console.log('3');
  await page.click('a[data-test="accountNav-guestSignOut"]');
  console.log('4');

  return;

  //     const invalidLogin = await Promise.race([
  //       text("can't find your account").exists(),
  //       text('something went wrong').exists(),
  //     ]);
  //     if (invalidLogin) throw new Error('invalidLogin');

  //     await click('Discount');
  //     await waitFor(2000);
  //     let couponsClicked = 0;
  //     let loadMore = true;
  //     while (loadMore) {
  //       try {
  //         console.log('Clicking coupons...');
  //         let moreCoupons = true;
  //         while (moreCoupons) {
  //           try {
  //             await click('Save offer');
  //             if (await $('div[data-test=popover]').exists()) {
  //               console.log(
  //                 'Your list is full. Check back later after you used some offer or after offers expire',
  //               );
  //               loadMore = false;
  //               throw new Error('full');
  //             }
  //             couponsClicked++;
  //           } catch (err) {
  //             moreCoupons = false;
  //           }
  //         }
  //         console.log('Loading more coupons...');
  //         await click(button('Load'));
  //       } catch (err) {
  //         console.log('Done clicking all coupons!');
  //         console.log(
  //           `${couponsClicked} new coupons were added to your ${site} account`,
  //         );
  //         loadMore = false;
  //       }
  //     }
  //     await click($('#account'));
  //     await click($('#listaccountNav-guestSignOut'));
  //   } catch (error) {
  //     if (error.message.startsWith('invalidLogin')) {
  //       console.error('Invalid email or password');
  //     } else {
  //       console.error(error);
  //     }
  //   }
  // })();
}

export default run;
