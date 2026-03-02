import { 
  generateTimestamp, 
  generatePassword, 
  formatPhoneNumber, 
  getBaseUrl 
} from './helpers';

describe('M-Pesa Helpers', () => {
  test('generateTimestamp() returns 14-digit string', () => {
    const ts = generateTimestamp();
    expect(ts).toMatch(/^\d{14}$/);
  });

  test('generatePassword() returns correct base64', () => {
    const shortCode = '174379';
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const timestamp = '20241201120000';
    
    // Manual expectation: base64(174379 + passkey + 20241201120000)
    const expected = Buffer.from(shortCode + passkey + timestamp).toString('base64');
    const pwd = generatePassword(shortCode, passkey, timestamp);
    
    expect(pwd).toBe(expected);
  });

  test('formatPhoneNumber() handles various formats', () => {
    expect(formatPhoneNumber('0712345678')).toBe('254712345678');
    expect(formatPhoneNumber('+254712345678')).toBe('254712345678');
    expect(formatPhoneNumber('254712345678')).toBe('254712345678');
    expect(formatPhoneNumber('712345678')).toBe('254712345678');
    expect(formatPhoneNumber('0112345678')).toBe('254112345678');
  });

  test('formatPhoneNumber() throws on invalid numbers', () => {
    expect(() => formatPhoneNumber('123')).toThrow();
    expect(() => formatPhoneNumber('abcdefghij')).toThrow();
    expect(() => formatPhoneNumber('071234567')).toThrow(); // Too short
  });

  test('getBaseUrl() returns correct URL for environment', () => {
    expect(getBaseUrl('sandbox')).toBe('https://sandbox.safaricom.co.ke');
    expect(getBaseUrl('production')).toBe('https://api.safaricom.co.ke');
    expect(() => getBaseUrl('invalid')).toThrow();
  });
});
