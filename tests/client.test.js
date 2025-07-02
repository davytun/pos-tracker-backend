import request from 'supertest';
import app from '../src/server.js';
import Client from '../src/models/ClientModel.js';
import User from '../src/models/UserModel.js'; // Needed for getting a token
import mongoose from 'mongoose';

describe('Client API Endpoints', () => {
  let token;
  const testUser = {
    name: 'Client Tester',
    email: 'clienttest@example.com',
    password: 'password123',
  };
  let testClientId;

  const sampleClientData = {
    name: 'Alice Wonderland',
    phone: '123-456-7890',
    email: 'alice@example.com',
    eventType: 'Birthday Party',
    measurements: [
      { name: 'Bust', value: '34 inches' },
      { name: 'Waist', value: '28 inches' },
    ],
  };

  beforeAll(async () => {
    // Register and login user to get token
    await User.deleteMany({}); // Clear users first
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
        .send(sampleClientData);
    if (res.body && res.body._id) {
        testClientId = res.body._id;
    } else {
        // If the initial client creation fails, log it. Tests might fail.
        console.error("Failed to create initial client for tests:", res.body);
        // Fallback in case the above post fails or does not return _id as expected
        const client = new Client(sampleClientData);
        const savedClient = await client.save();
        testClientId = savedClient._id.toString();

    }
  });


  describe('POST /api/v1/clients', () => {
    it('should create a new client successfully', async () => {
      const newClient = { ...sampleClientData, name: 'Bob The Builder', phone: '987-654-3210' };
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(newClient);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(newClient.name);
      expect(res.body.measurements.length).toBe(2);
    });

    it('should fail to create a client without required fields (name)', async () => {
      const { name, ...incompleteClient } = sampleClientData; // Remove name
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteClient);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Name and phone are required');
    });

     it('should fail to create a client without required fields (phone)', async () => {
      const { phone, ...incompleteClient } = sampleClientData; // Remove phone
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
            .send(sampleClientData);
        expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/clients', () => {
    it('should get all clients', async () => {
      const res = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1); // Since one is created in beforeEach
      expect(res.body[0].name).toBe(sampleClientData.name);
    });

    it('should filter clients by name', async () => {
        const res = await request(app)
          .get('/api/v1/clients?name=Alice')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toContain('Alice');
      });

      it('should filter clients by eventType', async () => {
        const res = await request(app)
          .get('/api/v1/clients?eventType=Birthday')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].eventType).toContain('Birthday');
      });


    it('should fail to get clients without auth token', async () => {
        const res = await request(app).get('/api/v1/clients');
        expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/v1/clients/:id', () => {
    it('should get a single client by ID', async () => {
      expect(testClientId).toBeDefined(); // Ensure testClientId is set
      const res = await request(app)
        .get(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', testClientId);
      expect(res.body.name).toBe(sampleClientData.name);
    });

    it('should return 404 for a non-existent client ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe('Client not found');
    });

    it('should return 404 for an invalid client ID format', async () => {
        const invalidId = 'invalid-id-format';
        const res = await request(app)
          .get(`/api/v1/clients/${invalidId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404); // Mongoose casting error for ObjectId
        expect(res.body.message).toBe('Client not found');
      });
  });

  describe('PUT /api/v1/clients/:id', () => {
    it('should update a client successfully', async () => {
      expect(testClientId).toBeDefined();
      const updatedData = { name: 'Alicia Keys', phone: '111-222-3333' };
      const res = await request(app)
        .put(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(updatedData.name);
      expect(res.body.phone).toBe(updatedData.phone);
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
      expect(res.body.message).toBe('Client removed');

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

  // Tests for linking styles will require a Style model and an existing style.
  // These can be added once the Style endpoints and model are also being tested.
  // For now, we'll skip detailed tests for /:clientId/styles routes or mock them.

  describe('POST /api/v1/clients/:clientId/styles', () => {
    it('should link a style to a client (mocked styleId)', async () => {
        const mockStyleId = new mongoose.Types.ObjectId().toString();
        // We are not creating a real style, just testing the linking mechanism.
        // The controller has a TODO to validate styleId, so this might fail if that's implemented strictly.
        const res = await request(app)
            .post(`/api/v1/clients/${testClientId}/styles`)
            .set('Authorization', `Bearer ${token}`)
            .send({ styleId: mockStyleId });

        expect(res.statusCode).toEqual(200); // or 201 if you prefer for linking
        expect(res.body.styles).toContain(mockStyleId);
    });
  });

  describe('GET /api/v1/clients/:clientId/styles', () => {
    it('should get styles linked to a client', async () => {
        const mockStyleId = new mongoose.Types.ObjectId().toString();
        // Link a style first
        await request(app)
            .post(`/api/v1/clients/${testClientId}/styles`)
            .set('Authorization', `Bearer ${token}`)
            .send({ styleId: mockStyleId });

        const res = await request(app)
            .get(`/api/v1/clients/${testClientId}/styles`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        // In the test environment, populate might not work as expected without real Style documents.
        // The response will contain style IDs.
        expect(res.body).toContain(mockStyleId);
    });
  });

});
