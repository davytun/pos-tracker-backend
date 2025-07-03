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

  const rawSampleClientData = {
    name: 'Alice <Wonderland>',
    phone: '123<->456<->7890', // Phone is also escaped
    email: 'alice@example.com',
    eventType: 'Birthday Party <Fun>',
    measurements: [
      { name: 'Bust <Size>', value: '34 <inches>' },
      { name: 'Waist', value: '28 <inches> Tight' },
    ],
  };

  const expectedEscapedClientData = {
    name: 'Alice &lt;Wonderland&gt;',
    phone: '123&lt;-&gt;456&lt;-&gt;7890',
    email: 'alice@example.com', // Not escaped by normalizeEmail
    eventType: 'Birthday Party &lt;Fun&gt;',
    measurements: [
      { name: 'Bust &lt;Size&gt;', value: '34 &lt;inches&gt;' },
      { name: 'Waist', value: '28 &lt;inches&gt; Tight' }, // Note: `escape` doesn't escape spaces.
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
    // Use rawSampleClientData for creation, expect escaped data in response
    const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(rawSampleClientData); // Send raw data
    if (res.body && res.body._id) {
      testClientId = res.body._id;
    } else {
      console.error("Failed to create initial client for tests:", res.body, res.status);
      // Fallback, though this path indicates a problem with the test setup or API
      const client = new Client(expectedEscapedClientData); // Save escaped data if manually creating
      const savedClient = await client.save();
      testClientId = savedClient._id.toString();
    }
  });


  describe('POST /api/v1/clients', () => {
    it('should create a new client successfully and escape HTML entities', async () => {
      // rawSampleClientData already contains HTML characters
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(rawSampleClientData); // Send raw data

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
      const { name, ...incompleteClient } = rawSampleClientData; // Use raw for sending
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteClient);
      expect(res.statusCode).toEqual(422); // Validation error
      expect(res.body.errors[0].msg).toBe('Client name is required.');
    });

      it('should fail to create a client without required fields (phone)', async () => {
      const { phone, ...incompleteClient } = rawSampleClientData;
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteClient);
      expect(res.statusCode).toEqual(422);
      expect(res.body.errors[0].msg).toBe('Phone number is required.');
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

    it('should filter clients by name (using escaped name for query if applicable, though query itself is not escaped by server)', async () => {
        // Querying for "Alice <Wonderland>" - server side regex will handle this.
        // The query param itself is not modified by our escape logic, only body/param fields.
        const res = await request(app)
          .get('/api/v1/clients?name=Alice%20%3CWonderland%3E') // URL encoded query
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe(expectedEscapedClientData.name);
      });

      it('should filter clients by eventType', async () => {
        const res = await request(app)
          .get('/api/v1/clients?eventType=Birthday%20%3CFun%3E') // URL encoded query
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
      expect(testClientId).toBeDefined(); // Ensure testClientId is set
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
    it('should update a client successfully, escaping new HTML entities', async () => {
      expect(testClientId).toBeDefined();
      const rawUpdateData = { name: 'Alicia <Keys>', phone: '111<->222<->3333', eventType: 'Award Show <VIP>' };
      const expectedEscapedUpdateData = { name: 'Alicia &lt;Keys&gt;', phone: '111&lt;-&gt;222&lt;-&gt;3333', eventType: 'Award Show &lt;VIP&gt;' };

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
