import { Page } from 'puppeteer';
import Logger from 'src/logger';

export default interface Singletons {
  page: Page;
  logger: Logger;
}
