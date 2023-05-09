import { exit } from 'process';
import puppeteer from 'puppeteer-extra';
import Site from './models/site.model';
import Logger from './logger';
import getSites from './sites';
import { waitFor } from './utils';

// Puppeteer plugins
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import Singletons from './models/singletons.model';

// Import user configs
const config: Config = require('../config.js');
if (!config) {
  console.error('No config.js found!');
  exit(1);
}
const captchaToken = config?.['2captcha']?.token;
const sites: Site[] = getSites(config);

const LOG_DIR = config?.logger?.logDir;
const logger = new Logger(LOG_DIR, config?.logger?.logLevel);

async function runSite(singletons: Singletons, site: Site) {
  const siteName = site.name;
  logger.setCurrentSite(siteName);
  const currentSiteConfig = config.sites[siteName.toLowerCase()];
  const requiresCaptcha = site?.requiresCaptcha;
  if (requiresCaptcha && !captchaToken) {
    logger.error(
      `2captcha token required for this site but one wasn't configured! -- Get one here: https://2captcha.com/?from=17648232`,
    );
    return;
  }

  const { accounts } = currentSiteConfig;

  logger.info(`*******START*******`);
  for (let i = 0; i < accounts.length; i++) {
    logger.info(`Account ${i + 1} of ${accounts.length}: ${accounts[i].email}`);
    const account = accounts[i];
    const shouldLogout = accounts.length > 1;
    const couponsClicked = await site.run(singletons, account, shouldLogout);
    logger.info(`Clipped ${couponsClicked} coupons for ${accounts[i].email}`);
    await waitFor(5000);
  }
  logger.info(`*******END*******\n\n`);
}

async function main() {
  if (captchaToken) {
    puppeteer.use(
      RecaptchaPlugin({
        provider: {
          id: '2captcha',
          token: captchaToken,
        },
        visualFeedback: true,
      }),
    );
  }

  const browserCacheDir = 'browser-cache';
  const browser = await puppeteer
    // .use(StealthPlugin())
    .launch({
      headless: 'new',
      userDataDir: browserCacheDir,
      defaultViewport: null,
      ignoreHTTPSErrors: true,
      slowMo: 80,

      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--start-maximized',

        '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
        '--disable-blink-features=AutomationControlled',
      ],
    });

  try {
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US',
      'Accept-Encoding': 'deflate, gzip;q=1.0, *;q=0.5',
      DNT: '1',
    });
    const singletons: Singletons = { page, logger };

    // Navigate to the page that will perform the tests.
    await page.goto('https://bot.sannysoft.com', {
      timeout: 15 * 1000,
      waitUntil: ['domcontentloaded', 'networkidle2'],
    });
    await logger.screenshot(page, 'stealth test page');

    for (let i = 0; i < sites.length; i++) {
      await runSite(singletons, sites[i]);
    }
    await browser.close();
  } catch (err) {
    logger.error(`${err}`);
    browser?.close();
  }
}

main();
