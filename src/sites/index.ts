import Site from '../models/site';

const path = require('path').join(__dirname);
const siteFiles = require('fs').readdirSync(path);

function getSites(config: Config): Site[] {
  const sites: Site[] = [];
  const siteConfigs = config.sites;
  siteFiles.forEach(function (file: string) {
    const name = file.split('.')[0];
    if (name === 'index' || name === 'site' || name === 'example') return;
    if (!siteConfigs[name]?.accounts?.length) return;

    const site: Site = require('./' + file).default;
    sites.push(site);
  });
  return getOrderedSites(config, sites);
}

function getOrderedSites(config: Config, sites: Site[]) {
  let orderedSites = sites.sort((a, b) => {
    const aOrder = config.sites[a.name.toLowerCase()]?.order || 999;
    const bOrder = config.sites[b.name.toLowerCase()]?.order || 999;
    return aOrder - bOrder;
  });
  return orderedSites;
}

export default getSites;
