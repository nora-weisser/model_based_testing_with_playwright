import { createMachine } from 'xstate';
import { expect } from '@playwright/test';

export const loginMachine = createMachine({
  id: 'login',
  initial: 'idle',
  states: {
    idle: {
      on: {
        FILL_FORM: 'formFilledValid',
        FILL_FORM_INVALID: 'formFilledInvalid'
      },
      meta: {
        test: async ({ page }) => {
          await expect(page.getByPlaceholder('Email')).toBeVisible();
          await expect(page.getByPlaceholder('Password')).toBeVisible();
        }
      }
    },
    formFilledValid: {
      on: {
        SUBMIT: 'success'
      },
      meta: {
        test: async ({ page }) => {
          const email = await page.getByPlaceholder('Email');
          const password = await page.getByPlaceholder('Password');
          await expect(email).toHaveValue('user@example.com');
          await expect(password).toHaveValue('password');
        }
      },
    },
    formFilledInvalid: {
      on: {
        SUBMIT: 'failure'
      },
      meta: {
        test: async ({ page }) => {
          const email = await page.getByPlaceholder('Email');
          const password = await page.getByPlaceholder('Password');
          await expect(email).toHaveValue('wrong@example.com');
          await expect(password).toHaveValue('wrongpass');
        }
      }
    },
    success: {
      type: 'final',
      meta: {
        test: async ({ page }) => {
          const msg = await page.locator('#message');
          await expect(msg).toHaveText('Welcome!');
        }
      }
    },
    failure: {
      type: 'final',
      meta: {
        test: async ({ page }) => {
          const msg = await page.locator('#message');
          await expect(msg).toHaveText('Invalid credentials.');
        }
      }
    }
  }
});
