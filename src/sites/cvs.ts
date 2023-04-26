import { Page } from 'puppeteer';
import { clickNavButton, clickOnSelector, clickOnXPath } from '../utils';

const site = 'CVS';
const loginUrl =
  'https://www.cvs.com/account/login?icid=cvsheader:signin&screenname=/';
const loginButtonSelector = "//div[contains(., 'Sign in')]";

const offersPage = 'https://www.vons.com/foru/coupons-deals.html';

const couponButtonXPath = "//button[contains(., 'Clip Coupon')]";
const loadMoreButtonSelector = 'button.load-more';

async function run(page: Page, email: string, password: string) {
  if (!email) {
    console.error(`No ${site} email found!`);
    return;
  } else if (!password) {
    console.error(`No ${site} password found!`);
    return;
  }

  const ok = await login(page, email, password);
  if (!ok) {
    return;
  }
  const couponsClicked = await clipCoupons(page);
  console.log(`Loaded ${couponsClicked} new offers for ${email}!\n\n`);
  // await logout(page);
}

async function clipCoupons(page: Page): Promise<number> {
  await page.goto(offersPage, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  // Load all the coupons available on the page
  let loadMoreButton = await page.$(loadMoreButtonSelector);
  while (loadMoreButton) {
    if (loadMoreButton) {
      await clickOnSelector(page, loadMoreButton, {
        waitAfterFor: 1500,
      });
    }
  }

  // Click all the coupons on the page
  let couponsClicked = 0;
  let couponButtons = await page.$x(couponButtonXPath);
  while (couponButtons.length) {
    // We have to get each coupon one at a time because of shadow DOM
    const couponButton = couponButtons[0];
    await clickOnXPath(page, couponButton, { waitAfterFor: 2500 });
    couponsClicked++;
    couponButtons = await page.$x(couponButtonXPath);
  }
  return couponsClicked;
}

async function login(
  page: Page,
  email: string,
  password: string,
): Promise<boolean> {
  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  let ok = true;
  if (!ok) return false;

  await page.waitForSelector('#emailField');
  await page.type('#emailField', email);
  await clickOnXPath(page, '//button');

  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', password);

  const loginButton = await page.$(loginButtonSelector);
  if (loginButton) {
    await clickNavButton(page, loginButton);
  }

  ok = true;
  return ok;
}

export default run;
