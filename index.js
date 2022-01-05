let config = null;
try {
  config = require('./config.json');
} catch (err) {
  console.error('No config.json found!');
  return;
}

const getOrderedSites = (sites) => {
  return Object.entries(sites).sort((a, b) => {
    const aPriority = config[a[0]]?.[0]?.priority || 999;
    const bPriority = config[b[0]]?.[0]?.priority || 999;
    return aPriority - bPriority;
  });
};

const sites = getOrderedSites(require('./sites'));

const runSite = async (site) => {
  if (!config[site.name]?.length) {
    console.error(`${site.name} not added to config.json!`);
    console.log('Moving to next site...');
    return;
  }

  console.log(`\n\n*****START: ${site.name.toUpperCase()}*******`);
  await config[site.name].reduce(async (memo, account) => {
    await memo;
    await site.function(account.email, account.password);
  }, undefined);

  console.log(`\n*****END: ${site.name.toUpperCase()}*******`);
};

const main = async () => {
  await openBrowser({
    port: 9229,
    args: ['--disable-audio-output', '--mute-audio', '--disable-web-security'],
    headless: true,
  });
  for (let i = 0; i < sites.length; i++) {
    await runSite({ name: sites[i][0], function: sites[i][1] });
  }
  await closeBrowser();
};

main();
