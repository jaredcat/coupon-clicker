const sites = require('./sites');

let config = null;
try {
  config = require('./config.json');
} catch (err) {
  console.error('No config.json found!');
  return;
}
const { vons, target } = config;
if (!vons && !target) {
  console.error('No sites added to config.json!');
  return;
}

const main = async () => {
  if (vons) {
    console.log('\n\n*****START: VONS.COM*******');
    await sites.vons(vons.email, vons.password);
    console.log('\n*****END: VONS.COM*******');
  }
  if (target) {
    console.log('\n\n*****TARGET.COM*******');
    console.log(
      "Target currently doesn't work in headless mode, will open a browser window",
    );
    await sites.target(target.email, target.password);
    console.log('\n*****END: TARGET.COM*******');
  }
};
main();
