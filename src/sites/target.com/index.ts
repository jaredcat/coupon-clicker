import { clickNavButton, clickOnXPath, waitFor } from '../../utils';
import Site, {
  assertValidAccount,
  clearSessionStorage,
} from '../../models/site.model';
import Singletons from '../../models/singletons.model';

const name = 'Target';
const loginUrl = 'https://www.target.com/account';
const couponsPage = 'https://www.target.com/circle/offers';

const loginButton = 'button[type=submit]';
const couponButtonXPath = "//button//div[text()='Save offer']";
const loadMoreButtonXPath = "//button[contains(., 'Load more')]";

const target: Site = {
  name,
  run,
  clipCoupons,
  login,
  logout,
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
  if (shouldLogout) {
    await logout(singletons);
  }

  return couponsClicked;
}

async function clipCoupons(singletons: Singletons): Promise<number> {
  const { page, logger } = singletons;
  await page.goto(couponsPage, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await logger.screenshot(page);
  await page.click('button[id=sort-bar]');
  await clickOnXPath(page, "//a[contains(., 'Trending')]");

  await logger.screenshot(page);
  await page.waitForXPath(loadMoreButtonXPath);

  let couponsClicked = 0;
  let loadMore = true;
  while (loadMore) {
    await logger.screenshot(page);
    const offerButtons = await page.$x(couponButtonXPath);
    for (let i = 0; i < offerButtons.length; i++) {
      await clickOnXPath(page, offerButtons[i], { waitAfterFor: 2500 });

      // Target has a limit on how many offers you can have at once
      // Check if hit the max offers clipped
      const [maxOffersModal] = await page.$x(
        "//div[@class='ModalDrawer']//div[contains(., 'Free up some space')]",
      );
      if (maxOffersModal) {
        loadMore = false;
        break;
      }
      couponsClicked++;
    }
    if (loadMore) {
      await logger.screenshot(page);
      await clickOnXPath(page, loadMoreButtonXPath, {
        waitAfterFor: 3000,
      });
    }
  }

  return couponsClicked;
}

async function login(singletons: Singletons, account: Account) {
  const { page, logger } = singletons;
  const { email, password } = account;
  await clearSessionStorage(page);
  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });
  await logger.screenshot(page);
  await page.waitForSelector('input[name=password]');

  const notYou = await page.$('a#invalidateSession');

  if (notYou) {
    await notYou.click();
  }

  await page.waitForSelector('input[name=username]');
  await page.type('input[name=username]', email);
  await page.type('input[name=password]', password);
  await logger.screenshot(page);

  const button = await page.$(loginButton);
  if (button) {
    await clickNavButton(page, button);
  }

  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });
  return true;
}

async function logout(singletons: Singletons) {
  const { page, logger } = singletons;
  await page.reload({ waitUntil: ['domcontentloaded', 'networkidle2'] });

  await logger.screenshot(page);
  await page.waitForSelector('a[data-test="@web/AccountLink"]');
  await page.click('a[data-test="@web/AccountLink"]');
  await waitFor(2000);
  await logger.screenshot(page);
  await page.waitForSelector('a[data-test="accountNav-guestSignOut"]');
  await page.click('a[data-test="accountNav-guestSignOut"]');

  return true;
}

export default target;
