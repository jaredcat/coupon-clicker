import { clickNavButton, clickOnXPath } from '../utils';
import Site, {
  assertValidAccount,
  clearSessionStorage,
} from '../models/site.model';
import Singletons from '../models/singletons.model';

const name = 'Honeygain';
const loginUrl = 'https://dashboard.honeygain.com/login';
const loginButton = "//button[contains(., 'Continue with email')]";

const cookiesButton = "//button[contains(., 'Accept selected')]";
const luckyPotButtonXPath = "//button[contains(., 'Open Lucky Pot')]";
const rewardButtonXPath = "//button[contains(., 'Claim reward')]";

const honeygain: Site = {
  name,
  run,
  clipCoupons,
  login,
  // logout,
};

async function run(
  singletons: Singletons,
  account: Account,
  shouldLogout = false,
): Promise<number> {
  assertValidAccount(account, name);
  await login(singletons, account);
  const couponsClipped = await clipCoupons(singletons);

  // TODO: add logout function for multiple accounts
  if (shouldLogout) {
    // await logout(page);
  }

  return couponsClipped;
}

async function clipCoupons(singletons: Singletons): Promise<number> {
  const { page, logger } = singletons;
  let couponsClicked = 0;
  let [exists] = await clickOnXPath(page, luckyPotButtonXPath);
  if (exists) {
    await logger.screenshot(page, 'Lucky pot is available!');
    const [claimed] = await clickOnXPath(page, "//button[contains(., 'OK')]", {
      timeout: 10000,
    });
    if (claimed) {
      couponsClicked++;
      await logger.screenshot(page, 'Lucky pot claimed');
      logger.info('Daily bonus claimed!');
    } else {
      logger.error('Error claiming bonus');
    }
  } else {
    await logger.screenshot(page, 'Lucky pot already claimed');
    logger.info('Daily bonus already clicked');
  }

  do {
    logger.info('Checking for any rewards to claim');
    [exists] = await clickOnXPath(page, rewardButtonXPath, { timeout: 1000 });
    if (exists) {
      couponsClicked++;
      logger.info('A reward claimed!');
    }
  } while (exists);

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
  await clearSessionStorage(page);

  await logger.screenshot(page, 'Looking for login');
  await page.waitForSelector('input[name=email]');

  await clickOnXPath(page, cookiesButton, { timeout: 100 });

  await page.type('input[name=email]', email);
  await page.type('input[name=password]', password);
  await logger.screenshot(page, 'Login information');

  const [button] = await page.$x(loginButton);
  if (button) {
    await clickNavButton(page, button);
  }
  return true;
}

export default honeygain;
