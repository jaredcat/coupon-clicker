import { ElementHandle, HTTPResponse, Page } from 'puppeteer';

export async function waitFor(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function waitForS(seconds: number): Promise<void> {
  return waitFor(seconds * 1000);
}

export async function clickNavButton(
  page: Page,
  button: ElementHandle<Node> | ElementHandle<Element>,
): Promise<HTTPResponse | null> {
  const [response] = await Promise.all([
    page.waitForNavigation(),
    (button as ElementHandle<Element>).click(),
  ]);

  return response;
}

export async function clickOnSelector(
  page: Page,
  selector: string | ElementHandle<any> | null,
  { waitAfterFor = 250, timeout = 5000 } = {},
): Promise<[boolean, Error | null]> {
  let button = selector;
  if (typeof selector === 'string') {
    try {
      button = await page.waitForSelector(selector, { timeout });
    } catch (err) {
      console.error(`Button not found Selector:  ${selector}`, err);
      return [false, new Error('Selector Button not found')];
    }
  }

  if (button) {
    await (button as ElementHandle<Element>).click({ delay: 10 });
    await waitFor(waitAfterFor);
    return [true, null];
  }
  return [false, new Error(`Button element not found`)];
}

export async function clickOnXPath(
  page: Page,
  xpath: string | ElementHandle<Node> | null,
  { waitAfterFor = 250, timeout = 5000 } = {},
): Promise<[boolean, Error | null]> {
  let xpathButton = xpath;
  if (typeof xpath === 'string') {
    try {
      xpathButton = await page.waitForXPath(xpath, { timeout });
    } catch (err) {
      return [false, new Error(`XPath Button not found:  ${xpath}`)];
    }
  }

  if (xpathButton) {
    await (xpathButton as ElementHandle<Element>).click({ delay: 10 });
    await waitFor(waitAfterFor);
    return [true, null];
  }
  return [false, new Error(`Button element not found`)];
}

export async function solveCaptcha(
  page: Page,
  checkSelector: string,
): Promise<boolean> {
  const securityCheck = await page.$(checkSelector);
  if (securityCheck) {
    let captchas = 0;
    let solved = 0;
    for (const frame of page.mainFrame().childFrames()) {
      // Attempt to solve any potential captchas in those frames
      const results = await frame.solveRecaptchas();
      captchas += results.captchas.length;
      solved += results.solved.length;
    }
    if (solved === captchas) {
      page.waitForNavigation();
      return true;
    } else {
      return false;
    }
  }
  return true;
}
