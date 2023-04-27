import { exit } from 'process';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';

import unorderedSites from './sites';
import untypedConfig from '../config.json';
import { waitFor } from './utils';
import { Site } from './common/Site';
if (!untypedConfig) {
  console.error('No config.json found!');
  exit(1);
}
interface Config {
  '2captcha'?: {
    token: string;
  };
  sites: {
    [key: string]: SiteOptions;
  };
}

export interface SiteOptions {
  order?: number;
  accounts: {
    email: string;
    password: string;
  }[];
}

const config: Config = untypedConfig;
const sites: Site[] = getOrderedSites(unorderedSites);
const token = config?.['2captcha']?.token;

function getOrderedSites(sites: Site[]) {
  let orderedSites = sites.sort((a, b) => {
    const aOrder = config.sites[a.name]?.order || 999;
    const bOrder = config.sites[b.name]?.order || 999;
    return aOrder - bOrder;
  });
  return orderedSites;
}

async function runSite(page: Page, site: Site, siteCount: number) {
  const currentSite = config.sites[site.name];
  if (!currentSite?.accounts?.length) {
    console.error(`${site.name} not added to config.json!`);
    console.log('Moving to next site...');
    return;
  }

  const { accounts } = currentSite;

  console.log(`\n\n*****START: ${site.name.toUpperCase()}*******`);
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const runCount = siteCount + i + 1;
    await site.run(page, account.email, account.password, runCount);
    await waitFor(5000);
  }
  console.log(`\n*****END: ${site.name.toUpperCase()}*******`);
}

async function main() {
  // puppeteer.use(StealthPlugin());

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
      headless: 'new',
      args: [
        '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
        '--no-sandbox',
      ],
    })
    .then(async (browser) => {
      const page = await browser.newPage();
      for (let i = 0; i < sites.length; i++) {
        await runSite(page, sites[i], i + 1);
      }
      await browser.close();
    })
    .catch((err) => {
      console.error(err);
    });
}

main();
