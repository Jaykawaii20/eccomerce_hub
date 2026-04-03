import request from 'supertest';
import app from '../../src/app';

// Mock all external dependencies for integration tests
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

jest.mock('../../src/config/redis', () => ({
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
  },
}));

jest.mock('../../src/config/supabase', () => ({
  supabaseAdmin: {
    storage: {
      listBuckets: jest.fn().mockResolvedValue({ data: [], error: null }),
    },
  },
}));

describe('GET /api/v1/health', () => {
  it('returns 200 with ok status when all services are healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('ok');
    expect(res.body.redis).toBe('ok');
    expect(res.body.storage).toBe('ok');
  });
});
