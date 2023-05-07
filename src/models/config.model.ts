interface Config {
  '2captcha'?: {
    token: string;
  };
  logger?: {
    logLevel?: string;
    logDir?: string;
  };
  sites: {
    [key: string]: SiteOptions;
  };
}

interface SiteOptions {
  order?: number;
  accounts: Account[];
}
