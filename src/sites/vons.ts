import { Page } from 'puppeteer';

// const site = 'Vons';

async function run(page: Page, email: string, password: string) {
  console.log(page, email, password);
  return;
  // await (async () => {
  //   if (!email) {
  //     console.error(`No ${site} email found!`);
  //     return;
  //   } else if (!password) {
  //     console.error(`No ${site} password found!`);
  //     return;
  //   }
  //   try {
  //     await waitFor(2000);
  //     await goto('https://www.vons.com/justforu/coupons-deals.html', {
  //       headers: {
  //         'User-Agent': userAgent,
  //       },
  //     });
  //     await waitFor(3000);
  //     await write(email, into(textBox(below('Email'))));
  //     await write(password, into(textBox(below('Password'))));
  //     await click($('#btnSignIn'));
  //     await waitFor(5000);
  //     if (await $('.error-wrong-pwd').exists()) throw new Error('invalidLogin');
  //     let couponsClicked = 0;
  //     let loadMore = true;
  //     while (loadMore) {
  //       try {
  //         console.log('Clicking coupons...');
  //         let moreCoupons = true;
  //         while (moreCoupons) {
  //           try {
  //             await click(button('Clip Coupon'));
  //             const randomClickTime = Math.random() * (1500 - 250) + 250;
  //             await waitFor(randomClickTime);
  //             couponsClicked++;
  //           } catch (err) {
  //             moreCoupons = false;
  //           }
  //         }
  //         console.log('Loading more coupons...');
  //         await click(button('Load more'));
  //       } catch (err) {
  //         console.log('Done clicking all coupons!');
  //         console.log(
  //           `${couponsClicked} new coupons were added to your ${site} account`,
  //         );
  //         loadMore = false;
  //       }
  //     }
  //     await click($('.menu-nav__profile-button'));
  //     await click('Sign Out');
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
