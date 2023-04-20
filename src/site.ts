import { Page } from 'puppeteer';
import { clickNavButton } from './utils';

export class Site {
  page: Page;
  loginUrl: string;
  email: string;
  password: string;
  loginButton: string;

  constructor(
    page: Page,
    loginUrl: string,
    email: string,
    password: string,
    loginButton: string,
  ) {
    this.page = page;
    this.loginUrl = loginUrl;
    this.email = email;
    this.password = password;
    this.loginButton = loginButton;
  }

  async login() {
    await this.page.goto(this.loginUrl, {
      timeout: 15 * 1000,
      waitUntil: ['domcontentloaded', 'networkidle2'],
    });

    await this.page.waitForSelector('input[name=username]');

    await this.page.type('input[name=username]', this.email);
    await this.page.type('input[name=password]', this.password);

    const button = await this.page.$(this.loginButton);
    if (button) {
      await clickNavButton(this.page, button);
    }
  }
  async clipCoupons() {}
  async logout() {}
}
