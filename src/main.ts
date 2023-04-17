import { exit } from 'process';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import unorderedSites from './sites';
import untypedConfig from '../config.json';
import { waitFor } from './utils';
if (!untypedConfig) {
  console.error('No config.json found!');
  exit(1);
}
const config: Config = untypedConfig;
const sites: Site[] = getOrderedSites(unorderedSites);

function getOrderedSites(sites: Site[]) {
  let orderedSites = sites.sort((a, b) => {
    const aPriority = config[a.name]?.[0]?.priority || 999;
    const bPriority = config[b.name]?.[0]?.priority || 999;
    return aPriority - bPriority;
  });
  return orderedSites;
}

async function runSite(page: Page, site: any) {
  if (!config[site.name]?.length) {
    console.error(`${site.name} not added to config.json!`);
    console.log('Moving to next site...');
    return;
  }

  console.log(`\n\n*****START: ${site.name.toUpperCase()}*******`);
  for (let i = 0; i < config[site.name].length; i++) {
    const account = config[site.name][i];
    await site.run(page, account.email, account.password);
    await waitFor(5000);
  }

  console.log(`\n*****END: ${site.name.toUpperCase()}*******`);
}

async function main() {
  puppeteer
    .use(StealthPlugin())
    .launch({ headless: false })
    .then(async (browser) => {
      const page = await browser.newPage();
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
