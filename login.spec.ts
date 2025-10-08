import { test, Page } from '@playwright/test';
import { createModel } from '@xstate/test';
import { loginMachine } from './loginMachine';

type TestContext = { page: Page };

const testModel = createModel(loginMachine).withEvents({
  FILL_FORM: async (context: unknown) => {
    const { page } = context as TestContext;  
    await page.locator('#email').fill('user@example.com');
    await page.locator('#password').fill('password');
  },
  FILL_FORM_INVALID: async (context: unknown) => {
    const { page } = context as TestContext;  
    await page.locator('#email').fill('wrong@example.com');
    await page.locator('#password').fill('wrongpass');
  },
  SUBMIT: async (context: unknown) => {
    const { page } = context as TestContext;  
    await page.getByRole('button', { name: 'Login' }).click();
  }
});

test.describe('Login Machine Model-based Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  const testPlans = testModel.getShortestPathPlans();

  for (const plan of testPlans) {
    for (const path of plan.paths) {
      test(path.description, async ({ page }) => {
        await path.test({ page });
      });
    }
  }

  test('should cover all paths', async () => {
    testModel.testCoverage();
  });
});