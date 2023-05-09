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
