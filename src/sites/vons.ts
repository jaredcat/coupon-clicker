import {
  clickNavButton,
  clickOnSelector,
  clickOnXPath,
  solveCaptcha,
} from '../utils';
import Site, { assertValidAccount } from '../models/site';
import Singletons from '../models/singletons';
import { ElementHandle } from 'puppeteer';

const name = 'Vons';
const loginUrl = 'https://www.vons.com/account/sign-in.html';
const loginButtonSelector = '#btnSignIn';

const offersPage = 'https://www.vons.com/foru/coupons-deals.html';

// const couponButtonXPath = "//button[contains(., 'Clip Coupon')]";
const couponButtonSelector = '.grid-coupon-btn';
const loadMoreButtonSelector = 'button.load-more';

const vons: Site = {
  name,
  run,
  clipCoupons,
  login,
  // logout,
};

async function run(singletons: Singletons, account: Account): Promise<number> {
  assertValidAccount(account, name);

  const ok = await login(singletons, account);
  if (!ok) return 0;
  const couponsClicked = await clipCoupons(singletons);

  // TODO: add logout function for multiple accounts
  // await logout(page);

  return couponsClicked;
}

async function clipCoupons(singletons: Singletons): Promise<number> {
  const { page, logger } = singletons;
  await page.goto(offersPage, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });
  await logger.screenshot(page, 'coupons page loaded');

  let couponsClicked = 0;

  // Load all the coupons available on the page
  let loadMoreButton: ElementHandle<HTMLButtonElement> | null;
  let lastClicked = 0;
  do {
    lastClicked = await clickCouponBatch(singletons);
    couponsClicked += lastClicked;

    loadMoreButton = await page.$(loadMoreButtonSelector);
    // Coupons are returned with un-clicked first, if 0 then we probably clicked them all
    if (lastClicked && loadMoreButton) {
      logger.info('clicking load more button');
      await clickOnSelector(page, loadMoreButton, {
        waitAfterFor: 1500,
      });
    }
  } while (lastClicked && loadMoreButton);
  logger.info('done clicking coupons');

  return couponsClicked;
}

async function clickCouponBatch(singletons: Singletons): Promise<number> {
  const { page, logger } = singletons;
  let couponsClicked = 0;

  let couponButtons;
  do {
    couponButtons = await page.$$(couponButtonSelector);
    if (couponButtons?.length) {
      logger.info(`clicking coupons: ${couponButtons?.length} remaining...`);
      // We have to get each coupon one at a time because of shadow DOM
      await clickOnSelector(page, couponButtons[0], { waitAfterFor: 2500 });
      couponsClicked++;
    }
  } while (couponButtons?.length);

  await logger.screenshot(page, 'done clicking batch of coupons');
  return couponsClicked;
}

async function login(
  singletons: Singletons,
  account: Account,
): Promise<boolean> {
  const { page, logger } = singletons;
  const { email, password } = account;
  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });
  await logger.screenshot(page, 'login page loaded');

  let ok = solveCaptcha(singletons, 'body > iframe');
  if (!ok) return false;

  await page.waitForSelector('#label-password');
  await logger.screenshot(page, 'password selector found');

  await page.type('#label-email', email);
  await page.type('#label-password', password);
  await logger.screenshot(page, 'login info entered');

  const loginButton = await page.$(loginButtonSelector);
  await logger.screenshot(page, 'finding login button');
  if (loginButton) {
    await clickNavButton(page, loginButton);
  }

  ok = solveCaptcha(singletons, 'body > iframe');
  return ok;
}

export default vons;
