const { After, Before } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

Before(async function () {
  this.browser = await chromium.launch({ headless: true }); 
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  await this.browser.close();
});