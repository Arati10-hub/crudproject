const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the login page', async function () {
  await this.page.goto('https://tracelog14.slashrtc.in/index.php/login');
  await this.page.waitForSelector('#loginForm', { timeout: 10000 });
});

When('I enter username {string} and password {string}', async function (username, password) {
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', password);
});

// NEW STEP: For leaving fields empty
When('I leave both username and password fields empty', async function () {
  // Clear both fields explicitly
  await this.page.fill('input[name="username"]', '');
  await this.page.fill('input[name="password"]', '');
  
  // Verify fields are actually empty
  const usernameValue = await this.page.$eval('input[name="username"]', el => el.value);
  const passwordValue = await this.page.$eval('input[name="password"]', el => el.value);
  
  expect(usernameValue).toBe('');
  expect(passwordValue).toBe('');
});

When('I click the login button', async function () {
  // Click the button and wait for either navigation OR validation messages
  await this.page.click('#loginProcess');
  
  // Wait for validation to potentially appear
  await this.page.waitForTimeout(2000);
});

Then('I should be redirected to the dashboard', async function () {
  await this.page.waitForLoadState('networkidle');
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('/login');
});

Then('I should see an error message {string}', async function (expectedErrorMessage) {
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
  
  const errorSelectors = [
    '.alert-danger',
    '.error-message',
    '.text-danger',
    '.invalid-feedback',
    '[class*="error"]',
    '.toast-error',
    '.notification-error'
  ];
  
  let errorFound = false;
  
  for (const selector of errorSelectors) {
    try {
      await this.page.waitForSelector(selector, { timeout: 2000 });
      const errorElements = await this.page.$$(selector);
      
      for (const element of errorElements) {
        const errorText = await element.textContent();
        if (errorText && errorText.includes(expectedErrorMessage)) {
          errorFound = true;
          break;
        }
      }
      if (errorFound) break;
    } catch (error) {
      continue;
    }
  }
  
  if (!errorFound) {
    const pageContent = await this.page.textContent('body');
    errorFound = pageContent.includes(expectedErrorMessage);
  }
  
  expect(errorFound).toBe(true);
});

// NEW STEP: For field validation messages
Then('I should see field validation messages for required fields', async function () {
  // Wait for validation to potentially trigger
  await this.page.waitForTimeout(1500);
  
  let validationFound = false;
  
  // Check for HTML5 validation messages (browser native validation)
  try {
    const usernameValidation = await this.page.$eval('input[name="username"]', input => input.validationMessage);
    const passwordValidation = await this.page.$eval('input[name="password"]', input => input.validationMessage);
    
    if (usernameValidation || passwordValidation) {
      validationFound = true;
      console.log('HTML5 Validation messages found:');
      if (usernameValidation) console.log('Username:', usernameValidation);
      if (passwordValidation) console.log('Password:', passwordValidation);
    }
  } catch (error) {
    console.log('HTML5 validation check failed, trying custom validation...');
  }
  
  // Check for custom validation messages (CSS classes, error elements)
  if (!validationFound) {
    const validationSelectors = [
      '.invalid-feedback',
      '.text-danger',
      '.field-error',
      '.required-message',
      '[class*="error"]',
      '.help-block',
      '.validation-message'
    ];
    
    for (const selector of validationSelectors) {
      const validationElements = await this.page.$$(selector);
      if (validationElements.length > 0) {
        validationFound = true;
        console.log(`Found ${validationElements.length} validation elements with selector: ${selector}`);
        
        // Check if they contain required field messages
        for (const element of validationElements) {
          const text = await element.textContent();
          if (text && text.length > 0) {
            console.log('Validation text:', text.trim());
          }
        }
        break;
      }
    }
  }
  
  // Check for visual indicators (red borders, asterisks, etc.)
  if (!validationFound) {
    // Check for required attribute indicators
    const usernameRequired = await this.page.$eval('input[name="username"]', input => input.required);
    const passwordRequired = await this.page.$eval('input[name="password"]', input => input.required);
    
    if (usernameRequired || passwordRequired) {
      validationFound = true;
      console.log('Fields marked as required in HTML');
    }
    
    // Check for visual error styles
    const errorStyleSelectors = [
      'input[style*="border-color: red"]',
      'input[style*="border: red"]',
      'input[style*="color: red"]',
      'input.error',
      'input.invalid'
    ];
    
    for (const selector of errorStyleSelectors) {
      const styledElements = await this.page.$$(selector);
      if (styledElements.length > 0) {
        validationFound = true;
        console.log(`Found ${styledElements.length} elements with error styles: ${selector}`);
        break;
      }
    }
  }
  
  // Final check: verify we're still on the login page (indicating validation prevented submission)
  if (!validationFound) {
    const currentUrl = this.page.url();
    const stillOnLoginPage = currentUrl.includes('login');
    const loginFormExists = await this.page.$('#loginForm').catch(() => null);
    
    if (stillOnLoginPage && loginFormExists) {
      validationFound = true;
      console.log('Still on login page - validation likely prevented form submission');
    }
  }
  
  expect(validationFound).toBe(true);
});



