jest.mock('../data/DB', () => ({
  client: { query: jest.fn() },
  connectDB: jest.fn(),
}));

import request from 'supertest';
import { createApp } from './testApp';
import { client } from '../data/DB';

const mockQuery = client.query as jest.Mock;
const app = createApp();
const H = { 'x-api-secret': 'test-api-secret' };

describe('POST /api/user/signup/:promotional — validation', () => {
  it('rejects missing fields with 400', async () => {
    const res = await request(app)
      .post('/api/user/signup/false')
      .set(H)
      .send({});
    expect(res.status).toBe(400);
  });

  it('rejects invalid email format with 400', async () => {
    const res = await request(app)
      .post('/api/user/signup/false')
      .set(H)
      .send({
        userName: 'TestUser',
        email: 'not-an-email',
        password: 'password123',
        mobile_number: '9876543210',
        dob: '2000-01-01',
      });
    expect(res.status).toBe(400);
  });

  it('rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/user/signup/false')
      .set(H)
      .send({
        userName: 'TestUser',
        email: 'test@example.com',
        password: 'short',
        mobile_number: '9876543210',
        dob: '2000-01-01',
      });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ userid: 1 }], rowCount: 1 });
    const res = await request(app)
      .post('/api/user/signup/false')
      .set(H)
      .send({
        userName: 'TestUser',
        email: 'existing@example.com',
        password: 'password123',
        mobile_number: '9876543210',
        dob: '2000-01-01',
      });
    expect(res.status).toBe(409);
  });

  it('returns 200 and token on successful registration', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const res = await request(app)
      .post('/api/user/signup/false')
      .set(H)
      .send({
        userName: 'NewUser',
        email: 'newuser@example.com',
        password: 'password123',
        mobile_number: '9876543210',
        dob: '2000-01-01',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('POST /api/user/signin/:remember — validation', () => {
  it('rejects missing credentials with 400/500', async () => {
    const res = await request(app)
      .post('/api/user/signin/false')
      .set(H)
      .send({});
    expect([400, 500]).toContain(res.status);
  });

  it('returns 404 when user does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app)
      .post('/api/user/signin/false')
      .set(H)
      .send({ email: 'noone@example.com', password: 'password123' });
    expect(res.status).toBe(404);
  });

  it('returns 401 on wrong password', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        userid: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$invalidhashvalue00000000000000000000000000000000',
        mobile_number: '9876543210',
        dob: '2000-01-01',
      }],
      rowCount: 1,
    });
    const res = await request(app)
      .post('/api/user/signin/false')
      .set(H)
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/user/session-check — token validation', () => {
  it('rejects missing token with 400', async () => {
    const res = await request(app)
      .post('/api/user/session-check')
      .set(H)
      .send({});
    expect(res.status).toBe(400);
  });

  it('rejects a string with no dots (fails isJWT) with 400', async () => {
    const res = await request(app)
      .post('/api/user/session-check')
      .set(H)
      .send({ token: 'notajwttoken' });
    expect(res.status).toBe(400);
  });
});
