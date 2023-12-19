interface Config {
  userAgent?: string;
  '2captcha'?: {
    token: string;
  };
  browserDataDir?: string;
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
