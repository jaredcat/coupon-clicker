import { Page } from 'puppeteer';
import { clickNavButton, clickOnXPath, waitFor } from '../utils';

const site = 'Target';
const loginUrl = 'https://www.target.com/account';
const loginButton = 'button[type=submit]';

const offersPage = 'https://www.target.com/circle/offers';
const saveOfferButtonXPath = "//button//div[text()='Save offer']";
const loadMoreButtonXPath = "//button[contains(., 'Load more')]";

async function clipCoupons(page: Page): Promise<number> {
  await page.goto(offersPage, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await page.click('button[id=sort-bar]');
  await clickOnXPath(page, "//a[contains(., 'Trending')]");

  await page.waitForXPath(loadMoreButtonXPath);

  let couponsClicked = 0;
  let loadMore = true;
  while (loadMore) {
    const offerButtons = await page.$x(saveOfferButtonXPath);
    for (let i = 0; i < offerButtons.length; i++) {
      await clickOnXPath(page, offerButtons[i], 2500);

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
      await clickOnXPath(page, loadMoreButtonXPath, 3000);
    }
  }

  return couponsClicked;
}

async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto(loginUrl, {
    timeout: 15 * 1000,
    waitUntil: ['domcontentloaded', 'networkidle2'],
  });

  await page.waitForSelector('input[name=password]');

  const notYou = await page.$('a#invalidateSession');

  if (notYou) {
    await notYou.click();
  }

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
}

async function logout(page: Page) {
  await page.reload({ waitUntil: ['domcontentloaded', 'networkidle2'] });

  await page.waitForSelector('a[data-test="@web/AccountLink"]');
  await page.click('a[data-test="@web/AccountLink"]');
  await waitFor(2000);
  await page.waitForSelector('a[data-test="accountNav-guestSignOut"]');
  await page.click('a[data-test="accountNav-guestSignOut"]');
}

async function run(page: Page, email: string, password: string) {
  if (!email) {
    console.error(`No ${site} email found!`);
    return;
  } else if (!password) {
    console.error(`No ${site} password found!`);
    return;
  }

  await login(page, email, password);
  const couponsClicked = await clipCoupons(page);
  console.log(`Loaded ${couponsClicked} new offers for ${email}!\n\n`);
  await logout(page);

  return;
}

export default run;
