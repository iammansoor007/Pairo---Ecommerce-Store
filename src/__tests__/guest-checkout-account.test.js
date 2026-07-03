import { describe, expect, it } from 'vitest';
import {
  buildGuestCheckoutAccountPayload,
  generateTemporaryPassword,
  resolveGuestCheckoutCustomerAction,
} from '../lib/guestCheckoutAccount';

describe('guest checkout account helpers', () => {
  it('generates a strong temporary password', () => {
    const password = generateTemporaryPassword();

    expect(password.length).toBeGreaterThanOrEqual(12);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
    expect(/[^A-Za-z0-9]/.test(password)).toBe(true);
  });

  it('builds a customer payload for a new guest account', () => {
    const payload = buildGuestCheckoutAccountPayload({
      customerEmail: 'guest@example.com',
      shippingAddress: { fullName: 'Jane Doe' },
    });

    expect(payload.email).toBe('guest@example.com');
    expect(payload.name).toBe('Jane Doe');
    expect(payload.password).toBeTruthy();
    expect(payload.emailVerified).toBe(true);
  });

  it('does not create a new account when one already exists for the checkout email', () => {
    const action = resolveGuestCheckoutCustomerAction({
      existingCustomer: { email: 'guest@example.com', name: 'Jane Doe' },
      customerEmail: 'guest@example.com',
      shippingAddress: { fullName: 'Jane Doe' },
    });

    expect(action.shouldCreateAccount).toBe(false);
    expect(action.temporaryPassword).toBeUndefined();
    expect(action.customer).toMatchObject({ email: 'guest@example.com', name: 'Jane Doe' });
  });
});
