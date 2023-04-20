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

export async function clickOnXPath(
  page: Page,
  xpath: string | ElementHandle<Node>,
  waitAfterFor = 200,
): Promise<boolean> {
  let xpathButton;
  if (typeof xpath === 'string') {
    xpathButton = await page
      .waitForXPath(xpath, { timeout: 5000 })
      .catch(() => {
        console.error(`Button not found XPath:  ${xpath}`);
        return false;
      });
  } else {
    xpathButton = xpath;
  }

  if (xpathButton) {
    await (xpathButton as ElementHandle<Element>).click({ delay: 10 });
    await waitFor(waitAfterFor);
    return true;
  }
  return false;
}
