import request from 'supertest';
import app from '../src/server.js';
import Client from '../src/models/ClientModel.js';
import User from '../src/models/UserModel.js';
import mongoose from 'mongoose';

describe('Client API Endpoints', () => {
  let token;
  const testUser = {
    name: 'Client Tester',
    email: 'clienttest@example.com',
    password: 'password123',
  };
  let testClientId;

  const rawSampleClientData = {
    name: 'Alice <Wonderland>',
    phone: '123<->456<->7890',
    email: 'alice@example.com',
    eventType: 'Birthday Party <Fun>',
    measurements: [
      { name: 'Bust <Size>', value: '34 <inches>' },
      { name: 'Waist', value: '28 <inches> Tight' },
    ],
  };

  const expectedEscapedClientData = {
    name: 'Alice <Wonderland>',
    phone: '123<->456<->7890',
    email: 'alice@example.com',
    eventType: 'Birthday Party <Fun>',
    measurements: [
      { name: 'Bust <Size>', value: '34 <inches>' },
      { name: 'Waist', value: '28 <inches> Tight' },
    ],
  };

  beforeAll(async () => {
    // Register and login user to get token
    await User.deleteMany({});
    await request(app).post('/api/v1/auth/register').send(testUser);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    token = loginRes.body.token;
  });

  beforeEach(async () => {
    await Client.deleteMany({});
    // Create a client to be used in GET by ID, PUT, DELETE tests
    const res = await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${token}`)
      .send(rawSampleClientData);
    if (res.body && res.body._id) {
      testClientId = res.body._id;
    } else {
      console.error("Failed to create initial client for tests:", res.body, res.status);
      const client = new Client(expectedEscapedClientData);
      const savedClient = await client.save();
      testClientId = savedClient._id.toString();
    }
  });

  describe('POST /api/v1/clients', () => {
    it('should create a new client successfully and escape HTML entities', async () => {
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(rawSampleClientData);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(expectedEscapedClientData.name);
      expect(res.body.phone).toBe(expectedEscapedClientData.phone);
      expect(res.body.eventType).toBe(expectedEscapedClientData.eventType);
      expect(res.body.measurements).toEqual(expect.arrayContaining(
        expectedEscapedClientData.measurements.map(m => expect.objectContaining(m))
      ));
    });

    it('should fail to create a client without required fields (name)', async () => {
      const { name, ...incompleteClient } = rawSampleClientData;
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteClient);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Name and phone are required');
    });

    it('should fail to create a client without required fields (phone)', async () => {
      const { phone, ...incompleteClient } = rawSampleClientData;
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteClient);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Name and phone are required');
    });

    it('should fail to create a client without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/clients')
        .send(rawSampleClientData);
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/clients', () => {
    it('should get all clients, including the one with escaped data', async () => {
      const res = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const foundClient = res.body.find(client => client._id === testClientId);
      expect(foundClient).toBeDefined();
      expect(foundClient.name).toBe(expectedEscapedClientData.name);
      expect(foundClient.eventType).toBe(expectedEscapedClientData.eventType);
    });

    it('should filter clients by name (using escaped name for query)', async () => {
      const res = await request(app)
        .get('/api/v1/clients?name=Alice%20%3CWonderland%3E')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe(expectedEscapedClientData.name);
    });

    it('should filter clients by eventType', async () => {
      const res = await request(app)
        .get('/api/v1/clients?eventType=Birthday%20%3CFun%3E')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].eventType).toBe(expectedEscapedClientData.eventType);
    });

    it('should fail to get clients without auth token', async () => {
      const res = await request(app).get('/api/v1/clients');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/clients/:id', () => {
    it('should get a single client by ID', async () => {
      expect(testClientId).toBeDefined();
      const res = await request(app)
        .get(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', testClientId);
      expect(res.body.name).toBe(expectedEscapedClientData.name);
      expect(res.body.eventType).toBe(expectedEscapedClientData.eventType);
      expect(res.body.measurements).toEqual(expect.arrayContaining(
        expectedEscapedClientData.measurements.map(m => expect.objectContaining(m))
      ));
    });

    it('should return 404 for a non-existent client ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe('Client not found');
    });

    it('should return 400 for an invalid client ID format', async () => {
      const invalidId = 'invalid-id-format';
      const res = await request(app)
        .get(`/api/v1/clients/${invalidId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid client ID format.');
    });
  });

  describe('PUT /api/v1/clients/:id', () => {
    it('should update a client successfully, escaping new HTML entities', async () => {
      expect(testClientId).toBeDefined();
      const rawUpdateData = { name: 'Alicia <Keys>', phone: '111<->222<->3333', eventType: 'Award Show <VIP>' };
      const expectedEscapedUpdateData = { name: 'Alicia <Keys>', phone: '111<->222<->3333', eventType: 'Award Show <VIP>' };
      const res = await request(app)
        .put(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(rawUpdateData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(expectedEscapedUpdateData.name);
      expect(res.body.phone).toBe(expectedEscapedUpdateData.phone);
      expect(res.body.eventType).toBe(expectedEscapedUpdateData.eventType);
    });

    it('should return 404 when trying to update a non-existent client', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ghost User' });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/v1/clients/:id', () => {
    it('should delete a client successfully', async () => {
      expect(testClientId).toBeDefined();
      const res = await request(app)
        .delete(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Client removed successfully');

      // Verify client is actually deleted
      const getRes = await request(app)
        .get(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 when trying to delete a non-existent client', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/v1/clients/:clientId/styles', () => {
    it('should link a style to a client (mocked styleId)', async () => {
      const mockStyleId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/api/v1/clients/${testClientId}/styles`)
        .set('Authorization', `Bearer ${token}`)
        .send({ styleId: mockStyleId });
      expect(res.statusCode).toEqual(200);
      expect(res.body.styles).toContain(mockStyleId);
    });
  });

  describe('GET /api/v1/clients/:clientId/styles', () => {
    it('should get styles linked to a client', async () => {
      const mockStyleId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .post(`/api/v1/clients/${testClientId}/styles`)
        .set('Authorization', `Bearer ${token}`)
        .send({ styleId: mockStyleId });
      const res = await request(app)
        .get(`/api/v1/clients/${testClientId}/styles`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain(mockStyleId);
    });
  });

});