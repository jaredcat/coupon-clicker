import { Page } from 'puppeteer';
import {
  clickNavButton,
  clickOnSelector,
  clickOnXPath,
  solveCaptcha,
} from '../utils';

const site = 'Vons';
const loginUrl = 'https://www.vons.com/account/sign-in.html';
const loginButtonSelector = '#btnSignIn';

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
  if (!ok) return;
  const couponsClicked = await clipCoupons(page);
  console.log(`Loaded ${couponsClicked} new offers for ${email}!\n\n`);
  // TODO: add logout function for multiple accounts
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
    loadMoreButton = await page.$(loadMoreButtonSelector);
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

  let ok = solveCaptcha(page, 'body > iframe');
  if (!ok) return false;

  await page.waitForSelector('#label-password');

  await page.type('#label-email', email);
  await page.type('#label-password', password);

  const loginButton = await page.$(loginButtonSelector);
  if (loginButton) {
    await clickNavButton(page, loginButton);
  }

  ok = solveCaptcha(page, 'body > iframe');
  return ok;
}

export default run;
