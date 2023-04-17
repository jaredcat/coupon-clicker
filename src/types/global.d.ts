interface Config {
  [key: string]: SiteOptions[];
}

interface SiteOptions {
  email: string;
  password: string;
  priority?: number;
}

interface Site {
  name: string;
  run: (page: Page, email: string, password: string) => Promise<void>;
}
