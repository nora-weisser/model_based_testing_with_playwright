import { test, Page } from '@playwright/test';
import { createModel } from '@xstate/test';
import { loginMachine } from './loginMachine';

type TestContext = { page: Page };

async function fillForm(context: TestContext, email: string, password: string) {
  const { page } = context;
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
}

const testModel = createModel(loginMachine).withEvents({
  FILL_FORM: async (context: unknown) => {
    const { page } = context as TestContext;  
    await fillForm({ page }, 'user@example.com', 'password');
  },
  FILL_FORM_INVALID: async (context: unknown) => {
    const { page } = context as TestContext;  
    await fillForm({ page }, 'wrong@example.com', 'wrongpass');
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