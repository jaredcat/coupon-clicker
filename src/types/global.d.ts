interface Config {
  '2captcha'?: {
    token: string;
  };
  sites: {
    [key: string]: SiteOptions;
  };
}

interface SiteOptions {
  priority?: number;
  accounts: {
    email: string;
    password: string;
  }[];
}

interface Site {
  name: string;
  run: (page: Page, email: string, password: string) => Promise<void>;
}
