import { exit } from 'process';
import puppeteer from 'puppeteer-extra';
import Site from './models/site';
import Logger from './logger';
import getSites from './sites';
import { waitFor } from './utils';

// Puppeteer plugins
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// Import user configs
import untypedConfig from '../config.json';
import Singletons from './models/singletons';
if (!untypedConfig) {
  console.error('No config.json found!');
  exit(1);
}

const config: Config = untypedConfig;
const sites: Site[] = getSites(config);

const token = config?.['2captcha']?.token;

const LOG_DIR = config?.logger?.logDir;
const logger = new Logger(LOG_DIR, config?.logger?.logLevel);

async function runSite(singletons: Singletons, site: Site) {
  const siteName = site.name;
  const currentSiteConfig = config.sites[siteName.toLowerCase()];

  logger.setCurrentSite(siteName);

  const { accounts } = currentSiteConfig;

  logger.info(`*******START*******`);
  for (let i = 0; i < accounts.length; i++) {
    logger.info(`Account ${i + 1} of ${accounts.length}: ${accounts[i].email}`);
    const account = accounts[i];
    const couponsClicked = await site.run(singletons, account);
    logger.info(
      `Clipped ${couponsClicked} coupons for ${accounts[i].email}\n\n`,
    );
    await waitFor(5000);
  }
  logger.info(`*******END*******`);
}

async function main() {
  if (token) {
    puppeteer.use(
      RecaptchaPlugin({
        provider: {
          id: '2captcha',
          token,
        },
        visualFeedback: true,
      }),
    );
  }
  const browser = await puppeteer
    .use(StealthPlugin())
    // .use(AdblockerPlugin({ blockTrackers: true }))
    .launch({
      headless: 'new',
      defaultViewport: null,
      ignoreHTTPSErrors: true,
      slowMo: 100,
      // devtools: true,

      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--start-maximized',
        // '--window-size=1920,1000',

        '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
        '--disable-blink-features=AutomationControlled',
      ],
    });

  try {
    const page = await browser.newPage();
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
