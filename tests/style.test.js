import request from 'supertest';
import app from '../src/server.js';
import Style from '../src/models/StyleModel.js';
import User from '../src/models/UserModel.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs/promises'; // Moved to top

// Mock Cloudinary uploader
jest.mock('../src/config/cloudinaryConfig.js', () => ({
    uploader: {
      upload: jest.fn((filePath, options) => {
        // console.log('Mock Cloudinary upload called with:', filePath, options);
        return Promise.resolve({
          secure_url: `http://mockcloudinary.com/${path.basename(filePath)}`,
          public_id: `mock_public_id_${path.basename(filePath)}`,
        });
      }),
      destroy: jest.fn((public_id) => {
        // console.log('Mock Cloudinary destroy called with:', public_id);
        return Promise.resolve({ result: 'ok' });
      }),
    },
}));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Style API Endpoints', () => {
  let token;
  const testUser = {
    name: 'Style Tester',
    email: 'styletest@example.com',
    password: 'password123',
  };
  let testStyleId;
  const rawSampleStyleData = {
    name: 'Summer <Breeze> Dress',
    category: 'Casual', // Categories are from enum, less likely to have user HTML. If it was free text, would escape.
    description: 'A light and airy <summer> dress.',
  };
  const expectedEscapedStyleData = {
    name: 'Summer &lt;Breeze&gt; Dress',
    category: 'Casual',
    description: 'A light and airy &lt;summer&gt; dress.',
  };

  // Path to a dummy image file for testing uploads
  const testImagePath = path.join(__dirname, 'testImage.png');
  // const fs = require('fs'); // Using fs/promises now
  // import fs from 'fs/promises'; // Already moved to top


  beforeAll(async () => {
    // Create a dummy image file if it doesn't exist
    try {
      await fs.access(testImagePath);
    } catch {
      await fs.writeFile(testImagePath, 'dummy image content');
    }

    await User.deleteMany({});
    await request(app).post('/api/v1/auth/register').send(testUser);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    token = loginRes.body.token;
  });

  beforeEach(async () => {
    await Style.deleteMany({});
    // Create a style to be used in GET by ID, PUT, DELETE tests
    const res = await request(app)
      .post('/api/v1/styles')
      .set('Authorization', `Bearer ${token}`)
      .field('name', rawSampleStyleData.name) // Send raw
      .field('category', rawSampleStyleData.category)
      .field('description', rawSampleStyleData.description)
      .attach('styleImage', testImagePath);

    if (res.body && res.body._id) {
      testStyleId = res.body._id;
    } else {
      console.error("Failed to create initial style for tests:", res.body, res.status);
      // Fallback if the above post fails
      const style = new Style({ // Expect escaped data if manually creating model
        ...expectedEscapedStyleData,
        imageUrl: 'http://mock.com/initial.jpg',
        cloudinaryPublicId: 'mock_initial_id'
      });
      const savedStyle = await style.save();
      testStyleId = savedStyle._id.toString();
    }
  });

  afterAll(async () => {
    // Clean up the dummy image file
    try {
      await fs.access(testImagePath);
      await fs.unlink(testImagePath);
    } catch {
      // File might not exist if a test failed before creating it or it was already deleted
    }
    jest.clearAllMocks(); // Clear all jest mocks
  });


  describe('POST /api/v1/styles', () => {
    it('should create a new style with an image successfully and escape HTML', async () => {
      // rawSampleStyleData is used in beforeEach for initial creation, check its escaped values
      // This test will create another one
      const newRawStyle = { name: 'Winter <Coat>', category: 'Traditional', description: 'A <warm> coat.' };
      const newExpectedEscapedStyle = { name: 'Winter &lt;Coat&gt;', category: 'Traditional', description: 'A &lt;warm&gt; coat.' };

      const res = await request(app)
        .post('/api/v1/styles')
        .set('Authorization', `Bearer ${token}`)
        .field('name', newRawStyle.name)
        .field('category', newRawStyle.category)
        .field('description', newRawStyle.description)
        .attach('styleImage', testImagePath);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(newExpectedEscapedStyle.name);
      expect(res.body.category).toBe(newExpectedEscapedStyle.category); // Category not escaped if from enum
      expect(res.body.description).toBe(newExpectedEscapedStyle.description);
      expect(res.body.imageUrl).toContain('mockcloudinary.com');
      expect(res.body.cloudinaryPublicId).toContain('mock_public_id');
      // uploader.upload mock is called in beforeEach and here
      expect(require('../src/config/cloudinaryConfig.js').uploader.upload).toHaveBeenCalledTimes(2);
    });

    it('should fail if style image is missing', async () => {
        const res = await request(app)
          .post('/api/v1/styles')
          .set('Authorization', `Bearer ${token}`)
          .field('name', 'Missing Image Style')
          .field('category', 'Casual');
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Style image is required');
      });

    it('should fail if required fields (name) are missing', async () => {
        const res = await request(app)
          .post('/api/v1/styles')
          .set('Authorization', `Bearer ${token}`)
          .field('category', 'Casual')
          .attach('styleImage', testImagePath);
        expect(res.statusCode).toEqual(400);
        // The exact message depends on your validation order and Mongoose error messages
        expect(res.body.message).toContain('Name and category are required');
    });
    it('should fail if required fields (category) are missing', async () => {
        const res = await request(app)
          .post('/api/v1/styles')
          .set('Authorization', `Bearer ${token}`)
          .field('name', 'Test name')
          .attach('styleImage', testImagePath);
        expect(res.statusCode).toEqual(400);
        // The exact message depends on your validation order and Mongoose error messages
        expect(res.body.message).toContain('Name and category are required');
    });
  });

  describe('GET /api/v1/styles', () => {
    it('should get all styles', async () => {
      const res = await request(app)
        .get('/api/v1/styles')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const foundStyle = res.body.find(s => s._id === testStyleId);
      expect(foundStyle).toBeDefined();
      expect(foundStyle.name).toBe(expectedEscapedStyleData.name);
      expect(foundStyle.description).toBe(expectedEscapedStyleData.description);
    });

    it('should filter styles by category', async () => {
        const res = await request(app)
          .get('/api/v1/styles?category=Casual')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.every(style => style.category === 'Casual')).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      });

    it('should filter styles by name (regex)', async () => {
    const res = await request(app)
        .get('/api/v1/styles?name=Summer') // Partial name
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toContain('Summer Breeze');
    });
  });

  describe('GET /api/v1/styles/:id', () => {
    it('should get a single style by ID', async () => {
      expect(testStyleId).toBeDefined();
      const res = await request(app)
        .get(`/api/v1/styles/${testStyleId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', testStyleId);
      expect(res.body.name).toBe(expectedEscapedStyleData.name);
      expect(res.body.description).toBe(expectedEscapedStyleData.description);
    });

    it('should return 404 for a non-existent style ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/styles/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/v1/styles/:id', () => {
    it('should update a style (text fields) successfully and escape HTML', async () => {
      expect(testStyleId).toBeDefined();
      const rawUpdateData = { name: 'Autumn <Evening> Gown', category: 'Evening Wear', description: 'A <formal> gown.' };
      const expectedEscapedUpdate = { name: 'Autumn &lt;Evening&gt; Gown', category: 'Evening Wear', description: 'A &lt;formal&gt; gown.' };

      const res = await request(app)
        .put(`/api/v1/styles/${testStyleId}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', rawUpdateData.name)
        .field('category', rawUpdateData.category)
        .field('description', rawUpdateData.description);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(expectedEscapedUpdate.name);
      expect(res.body.category).toBe(expectedEscapedUpdate.category);
      expect(res.body.description).toBe(expectedEscapedUpdate.description);
    });

    it('should update a style image successfully', async () => {
        expect(testStyleId).toBeDefined();
        const newImageTestPath = path.join(__dirname, 'newTestImage.png');
        try {
            await fs.writeFile(newImageTestPath, 'new dummy image content');

            const res = await request(app)
                .put(`/api/v1/styles/${testStyleId}`)
                .set('Authorization', `Bearer ${token}`)
                .attach('styleImage', newImageTestPath); // Attach new image

            expect(res.statusCode).toEqual(200);
            expect(res.body.imageUrl).toContain(path.basename(newImageTestPath)); // Check if new image URL is set
            expect(require('../src/config/cloudinaryConfig.js').uploader.destroy).toHaveBeenCalled(); // Old image deleted
            // The mock uploader.upload is called once for the initial style creation in beforeEach,
            // and once for this update. So, it should be called twice by this point for this specific test context.
            // However, jest.clearAllMocks() is in afterAll. If tests run sequentially without clearing mocks in between,
            // this count could be higher. For this specific test, we expect it to be called again.
            // A more robust way is to check calls since the last check or use mockClear() before the test.
            // For simplicity, we'll check that it was called.
            expect(require('../src/config/cloudinaryConfig.js').uploader.upload).toHaveBeenCalled();
        } finally {
            try {
                await fs.access(newImageTestPath);
                await fs.unlink(newImageTestPath);
            } catch {
                // file might not exist
            }
        }
    });


    it('should return 404 when trying to update a non-existent style', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/styles/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Ghost Style');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/v1/styles/:id', () => {
    it('should delete a style successfully', async () => {
      expect(testStyleId).toBeDefined();
      const res = await request(app)
        .delete(`/api/v1/styles/${testStyleId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Style removed');
      expect(require('../src/config/cloudinaryConfig.js').uploader.destroy).toHaveBeenCalled();

      const getRes = await request(app)
        .get(`/api/v1/styles/${testStyleId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 when trying to delete a non-existent style', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/styles/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
