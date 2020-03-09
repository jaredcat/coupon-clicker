const sites = require('./sites');

let config = null;
try {
  config = require('./config.json');
} catch (err) {
  console.error('No config.json found!');
  return;
}
const { vons, target } = config;
if (!(vons && vons.length) && !(target && target.length)) {
  console.error('No sites added to config.json!');
  return;
}

const main = async () => {
  if (vons && vons.length) {
    console.log('\n\n*****START: VONS.COM*******');
    await vons.reduce(async (memo, account) => {
      await memo;
      await sites.vons(account.email, account.password);
    }, undefined);

    console.log('\n*****END: VONS.COM*******');
  }
  if (target && target.length) {
    console.log('\n\n*****TARGET.COM*******');
    console.log(
      "Target currently doesn't work in headless mode, will open a browser window",
    );
    await target.reduce(async (memo, account) => {
      await memo;
      await sites.target(account.email, account.password);
    }, undefined);
    console.log('\n*****END: TARGET.COM*******');
  }
};
main();
