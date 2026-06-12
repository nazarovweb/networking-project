jest.mock('../data/DB', () => ({
  client: { query: jest.fn() },
  connectDB: jest.fn(),
}));

import request from 'supertest';
import { createApp } from './testApp';

const app = createApp();
const API_SECRET = 'test-api-secret';

describe('Health Check', () => {
  it('GET / returns 200 with API secret', async () => {
    const res = await request(app)
      .get('/')
      .set('x-api-secret', API_SECRET);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Success');
  });

  it('GET / returns 401 without API secret', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /api/nonexistent returns 404', async () => {
    const res = await request(app)
      .get('/api/nonexistent-endpoint-xyz')
      .set('x-api-secret', API_SECRET);
    expect(res.status).toBe(404);
  });
});
