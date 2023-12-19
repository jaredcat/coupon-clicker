import { Page } from 'puppeteer';
import Singletons from './singletons.model';

export default interface Site {
  readonly name: string;
  readonly requiresCaptcha?: boolean;

  run: (
    singletons: Singletons,
    account: Account,
    shouldLogout?: boolean,
  ) => Promise<number>;
  login: (singletons: Singletons, account: Account) => Promise<boolean>;
  clipCoupons: (singletons: Singletons) => Promise<number>;
  logout?: (singletons: Singletons) => Promise<boolean>;
  disabled?: boolean;
}

export function assertValidAccount(account: Account, siteName: string): void {
  const { email, password } = account;
  if (!email) {
    throw new Error(`Email not found in config for ${siteName}`);
  } else if (!password) {
    throw new Error(
      `Password not found in config with ${email} for ${siteName}`,
    );
  }
}

export async function clearSessionStorage(
  page: Page,
  origin?: string,
): Promise<void> {
  origin = origin || new URL(page.url()).origin;
  if (!origin) return;

  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCache');
  await client.send('Storage.clearDataForOrigin', {
    origin,
    storageTypes:
      'appcache, file_systems, indexeddb, local_storage, websql, cache_storage, shared_storage, storage_buckets',
  });
}
