import Site, { assertValidAccount } from '../models/site.model';
import { clickNavButton, clickOnSelector, clickOnXPath } from '../utils';
import Singletons from '../models/singletons.model';

const name = 'CVS';
const loginUrl =
  'https://www.cvs.com/account/login?icid=cvsheader:signin&screenname=/';
const couponsPage = 'https://www.cvs.com/extracare/home/';

const loginButtonXPath = "//div[text()='Sign in']";
const couponButtonXPath = "//button[contains(., 'Clip Coupon')]";
const loadMoreButtonSelector = 'button.load-more';

const cvs: Site = {
  name,
  run,
  clipCoupons,
  login,
};

async function run(
  singletons: Singletons,
  account: Account,
  shouldLogout = false,
): Promise<number> {
  assertValidAccount(account, name);
  const ok = await login(singletons, account);
  if (!ok) return 0;
  const couponsClicked = await clipCoupons(singletons);
  // await logout(page);

  return couponsClicked;
}

async function clipCoupons(singletons: Singletons): Promise<number> {
  const { page, logger } = singletons;
  await page.goto(couponsPage, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await logger.screenshot(page);

  // Load all the coupons available on the page
  let loadMoreButton = await page.$(loadMoreButtonSelector);
  logger.info('clicking load more...');
  while (loadMoreButton) {
    await logger.screenshot(page);
    if (loadMoreButton) {
      logger.info('   loading more');
      await clickOnSelector(page, loadMoreButton, {
        waitAfterFor: 1500,
      });
    }
  }

  await logger.screenshot(page);
  // Click all the coupons on the page
  let couponsClicked = 0;
  let couponButtons = await page.$x(couponButtonXPath);
  let i = 4;
  while (couponButtons.length) {
    // We have to get each coupon one at a time because of shadow DOM
    const couponButton = couponButtons[0];
    await clickOnXPath(page, couponButton, { waitAfterFor: 2500 });
    await logger.screenshot(page);
    couponsClicked++;
    couponButtons = await page.$x(couponButtonXPath);
  }
  await logger.screenshot(page);
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

  let ok = true;
  if (!ok) return false;

  await logger.screenshot(page);

  await page.waitForSelector('#emailField');
  await page.type('#emailField', email);
  await clickOnXPath(page, '//button');

  await logger.screenshot(page);

  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', password);
  await logger.screenshot(page);

  const [loginButton] = await page.$x(loginButtonXPath);
  if (loginButton) {
    await clickNavButton(page, loginButton);
  }

  await logger.screenshot(page);
  ok = true;
  return ok;
}

export default cvs;
