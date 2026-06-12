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

describe('GET /api/product/:productID', () => {
  it('returns 500 on non-integer productID', async () => {
    const res = await request(app)
      .get('/api/product/not-an-int')
      .set(H);
    expect(res.status).toBe(500);
  });

  it('returns 404 when product does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app)
      .get('/api/product/12345')
      .set(H);
    expect(res.status).toBe(404);
  });

  it('returns 200 with product data when product exists', async () => {
    const fakeProduct = {
      productid: 12345,
      title: 'Test Jacket',
      description: 'A warm jacket',
      stock: 50,
      discount: 79.99,
      price: 99.99,
      stars: 4.5,
      imglink: 'https://example.com/img.jpg',
      imgalt: 'jacket',
      company_name: 'TestBrand',
      categoryname: 'Jackets',
      maincategory: 'Outerwear',
    };
    mockQuery
      .mockResolvedValueOnce({ rows: [fakeProduct], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const res = await request(app)
      .get('/api/product/12345')
      .set(H);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('title', 'Test Jacket');
  });
});

describe('GET /api/reviews/:productID', () => {
  it('returns 200 with empty array when no reviews exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app)
      .get('/api/reviews/12345')
      .set(H);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 200 with reviews array', async () => {
    const fakeReviews = [
      { reviewid: 1, userid: 10, rating: 5, title: 'Great!', comment: 'Loved it', username: 'user1', createdat: '2024-01-01', productstars: 4.5 },
    ];
    mockQuery.mockResolvedValueOnce({ rows: fakeReviews, rowCount: 1 });
    const res = await request(app)
      .get('/api/reviews/12345')
      .set(H);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Great!');
  });
});

describe('POST /api/review/create', () => {
  it('returns error on missing required fields', async () => {
    const res = await request(app)
      .post('/api/review/create')
      .set(H)
      .send({});
    expect([400, 500]).toContain(res.status);
  });

  it('returns 409 when review already exists for user/product', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ reviewid: 1 }], rowCount: 1 });
    const res = await request(app)
      .post('/api/review/create')
      .set(H)
      .send({
        userID: 10,
        productID: 12345,
        rating: 5,
        title: 'Great product',
        comment: 'Really enjoyed it',
      });
    expect(res.status).toBe(409);
  });
});
