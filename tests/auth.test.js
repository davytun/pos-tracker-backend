import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/UserModel.js';
import mongoose from 'mongoose';

describe('Auth API Endpoints', () => {
  // Test User Data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };
  let token;

  beforeEach(async () => {
    // Clean up users before each test in this suite
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe(testUser.name);
      expect(res.body.email).toBe(testUser.email);
      token = res.body.token; // Save token for subsequent tests
    });

    it('should register a user and escape HTML in name', async () => {
      const userWithHtmlName = { ...testUser, email: 'html@example.com', name: 'User <Name>' };
      const expectedEscapedName = 'User &lt;Name&gt;'; // Expecting HTML entities due to escaping
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userWithHtmlName);
      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe(expectedEscapedName);
    });

    it('should not register a user with an existing email', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser); // First registration
      const res = await request(app) // Second attempt
        .post('/api/v1/auth/register')
        .send(testUser);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test' }); // Missing email and password
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please provide name, email, and password');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Ensure a user is registered before login tests
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      token = res.body.token;
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(testUser.email);
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should not login a non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    beforeEach(async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);
      token = registerRes.body.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.name).toBe(testUser.name);
    });

    it('should not get user profile without token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should not get user profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    beforeEach(async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);
      token = registerRes.body.token;
    });

    it('should update user profile successfully', async () => {
      const newName = 'Updated Test User';
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: newName });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(newName);
      expect(res.body.email).toBe(testUser.email); // Email should remain the same if not updated
    });

    it('should update user profile and escape HTML in name', async () => {
      const newHtmlName = 'Updated <User Name>';
      const expectedEscapedName = 'Updated &lt;User Name&gt;'; // Expecting HTML entities due to escaping
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: newHtmlName });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(expectedEscapedName);
    });

    it('should update user password successfully', async () => {
      const newPassword = 'newpassword123';
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: newPassword });
      expect(res.statusCode).toEqual(200);

      // Verify new password by logging in
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: newPassword });
      expect(loginRes.statusCode).toEqual(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should not update profile without token', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .send({ name: 'No Auth Update' });
      expect(res.statusCode).toEqual(401);
    });
  });

});

// Close MongoDB connection after all tests in this file are done
// This might be redundant if global afterAll in setup.js handles it,
// but can be useful if running test files individually.
// afterAll(async () => {
//    await mongoose.connection.close();
// });
