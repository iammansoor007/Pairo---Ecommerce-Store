import crypto from 'crypto';

function generateTemporaryPassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}';
  const all = `${uppercase}${lowercase}${numbers}${symbols}`;

  const randomValues = crypto.randomBytes(length);
  const picks = [];

  const ensure = (charset, predicate) => {
    let char = '';
    while (!predicate(char)) {
      char = charset[randomValues[picks.length] % charset.length];
      picks.push(char);
    }
    return char;
  };

  const passwordChars = [
    ensure(uppercase, (value) => Boolean(value)),
    ensure(lowercase, (value) => Boolean(value)),
    ensure(numbers, (value) => Boolean(value)),
    ensure(symbols, (value) => Boolean(value)),
  ];

  for (let index = 4; index < length; index += 1) {
    passwordChars.push(all[randomValues[index] % all.length]);
  }

  for (let index = passwordChars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomValues[index] % (index + 1);
    const temp = passwordChars[index];
    passwordChars[index] = passwordChars[swapIndex];
    passwordChars[swapIndex] = temp;
  }

  return passwordChars.join('');
}

function buildGuestCheckoutAccountPayload({ customerEmail, shippingAddress = {}, customerName }) {
  const normalizedEmail = customerEmail?.trim().toLowerCase();
  const name = customerName || shippingAddress?.fullName || 'Customer';

  return {
    name,
    email: normalizedEmail,
    password: generateTemporaryPassword(),
    emailVerified: true,
    role: 'user',
  };
}

function resolveGuestCheckoutCustomerAction({ existingCustomer, customerEmail, shippingAddress = {}, customerName }) {
  const normalizedEmail = customerEmail?.trim().toLowerCase();

  if (existingCustomer) {
    return {
      shouldCreateAccount: false,
      shouldSendCredentials: false,
      customer: existingCustomer,
      temporaryPassword: undefined,
    };
  }

  return {
    shouldCreateAccount: true,
    shouldSendCredentials: true,
    customer: null,
    temporaryPassword: buildGuestCheckoutAccountPayload({ customerEmail: normalizedEmail, shippingAddress, customerName }).password,
  };
}

export {
  generateTemporaryPassword,
  buildGuestCheckoutAccountPayload,
  resolveGuestCheckoutCustomerAction,
};
