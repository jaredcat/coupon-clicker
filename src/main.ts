import { exit } from 'process';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';

import unorderedSites from './sites';
import untypedConfig from '../config.json';
import { waitFor } from './utils';
if (!untypedConfig) {
  console.error('No config.json found!');
  exit(1);
}
const config: Config = untypedConfig;
const sites: Site[] = getOrderedSites(unorderedSites);
const token = config?.['2captcha']?.token;

function getOrderedSites(sites: Site[]) {
  let orderedSites = sites.sort((a, b) => {
    const aPriority = config.sites[a.name]?.priority || 999;
    const bPriority = config.sites[b.name]?.priority || 999;
    return aPriority - bPriority;
  });
  return orderedSites;
}

async function runSite(page: Page, site: any) {
  if (!config.sites[site.name]?.accounts?.length) {
    console.error(`${site.name} not added to config.json!`);
    console.log('Moving to next site...');
    return;
  }

  console.log(`\n\n*****START: ${site.name.toUpperCase()}*******`);
  for (let i = 0; i < config.sites[site.name].accounts.length; i++) {
    const account = config.sites[site.name].accounts[i];
    await site.run(page, account.email, account.password);
    await waitFor(5000);
  }
  console.log(`\n*****END: ${site.name.toUpperCase()}*******`);
}

async function main() {
  puppeteer.use(StealthPlugin());

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

  puppeteer
    .launch({
      headless: false,
      args: [
        '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
      ],
    })
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.setJavaScriptEnabled(true);
      await page.setRequestInterception(true);
      page.on('request', async (request) => {
        if (request.resourceType() == 'image') {
          await request.abort();
        } else {
          await request.continue();
        }
      });
      for (let i = 0; i < sites.length; i++) {
        await runSite(page, sites[i]);
      }
      await browser.close();
    })
    .catch((err) => {
      console.error(err);
    });
}

main();
