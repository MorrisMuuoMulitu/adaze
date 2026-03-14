import { rateLimit } from '@/lib/rate-limit';
import { kv } from '@vercel/kv';

jest.mock('@vercel/kv', () => ({
  kv: {
    incr: jest.fn(),
    expire: jest.fn(),
  },
}));

describe('rateLimit', () => {
  it('should allow request if under limit', async () => {
    (kv.incr as jest.Mock).mockResolvedValue(1);
    
    const result = await rateLimit('ip', 10, 60);
    
    expect(result.success).toBe(true);
    expect(kv.expire).toHaveBeenCalled();
  });

  it('should block request if over limit', async () => {
    (kv.incr as jest.Mock).mockResolvedValue(11);
    
    const result = await rateLimit('ip', 10, 60);
    
    expect(result.success).toBe(false);
  });
});
