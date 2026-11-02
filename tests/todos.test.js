const request = require('supertest');
const app = require('../src/app');

describe('POST /todos', () => {
  it('creates a todo', async () => {
    const res = await request(app).post('/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, title: 'Buy milk', done: false });
  });

  it('returns 400 without a title', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it('returns 400 without a body', async () => {
    const res = await request(app).post('/todos');
    expect(res.status).toBe(400);
  });

  it('returns 400 for a title over 100 characters', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'a'.repeat(101) });
    expect(res.status).toBe(400);
  });

  it('returns 400 JSON for malformed JSON', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });
});

describe('GET /todos', () => {
  it('lists todos', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: 'Buy milk', done: false }]);
  });
});

describe('unknown routes', () => {
  it('returns 404 JSON', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
