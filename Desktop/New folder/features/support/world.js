const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class CustomWorld {
  constructor({ parameters }) {
    this.parameters = parameters;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initBrowser() {
    const options = {
      headless: !this.parameters.headed,
      slowMo: this.parameters.slowMo || 0
    };
    
    this.browser = await chromium.launch(options);
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async takeScreenshot(name) {
    if (this.page) {
      const path = `screenshots/${name}-${Date.now()}.png`;
      await this.page.screenshot({ path });
      return path;
    }
  }
}

setWorldConstructor(CustomWorld);


