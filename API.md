# Fittingz API Documentation

This document describes the available API endpoints for the Fittingz backend. All endpoints are prefixed with `/api/v1`.

---

## Authentication

### Register

- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "yourpassword",
    "isAdmin": false
  }
  ```
- **Response:**
  ```json
  {
    "_id": "userId123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "isAdmin": false,
    "token": "jwt.token.here"
  }
  ```
- **Error Example:**
  ```json
  { "message": "User already exists" }
  ```

### Login

- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:** Same as Register
- **Error Example:**
  ```json
  { "message": "Invalid credentials" }
  ```

### Get Profile

- **GET** `/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "_id": "userId123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "isAdmin": false,
    "createdAt": "2025-07-04T12:00:00.000Z",
    "updatedAt": "2025-07-04T12:00:00.000Z"
  }
  ```
- **Error Example:**
  ```json
  { "message": "Not authorized, token failed" }
  ```

### Update Profile

- **PUT** `/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }
  ```
- **Response:** Same as Register
- **Error Example:**
  ```json
  { "message": "Not authorized, token failed" }
  ```

---

## Clients

### Get All Clients

- **GET** `/clients`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "_id": "clientId1",
      "name": "Client One",
      "email": "client1@example.com",
      "phone": "123-456-7890"
    },
    {
      "_id": "clientId2",
      "name": "Client Two",
      "email": "client2@example.com",
      "phone": "987-654-3210"
    }
  ]
  ```
- **Error Example:**
  ```json
  { "message": "Not authorized, token failed" }
  ```

### Get Client by ID

- **GET** `/clients/{clientId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "_id": "clientId1",
    "name": "Client One",
    "email": "client1@example.com",
    "phone": "123-456-7890"
  }
  ```
- **Error Example:**
  ```json
  { "message": "Client not found" }
  ```

### Create Client

- **POST** `/clients`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Client New",
    "email": "newclient@example.com",
    "phone": "555-555-5555"
  }
  ```
- **Response:** Client object
- **Error Example:**
  ```json
  { "message": "Validation error" }
  ```

### Update Client

- **PUT** `/clients/{clientId}`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Client Updated"
  }
  ```
- **Response:** Updated client object
- **Error Example:**
  ```json
  { "message": "Client not found" }
  ```

### Delete Client

- **DELETE** `/clients/{clientId}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "message": "Client deleted" }
  ```
- **Error Example:**
  ```json
  { "message": "Client not found" }
  ```

---

## Styles

### Get All Styles

- **GET** `/styles`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "_id": "styleId1",
      "name": "Style One",
      "description": "Description of style one"
    },
    {
      "_id": "styleId2",
      "name": "Style Two",
      "description": "Description of style two"
    }
  ]
  ```
- **Error Example:**
  ```json
  { "message": "Not authorized, token failed" }
  ```

### Get Style by ID

- **GET** `/styles/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "_id": "styleId1",
    "name": "Style One",
    "description": "Description of style one"
  }
  ```
- **Error Example:**
  ```json
  { "message": "Style not found" }
  ```

### Create Style

- **POST** `/styles`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Style New",
    "description": "A new style description"
  }
  ```
- **Response:** Style object
- **Error Example:**
  ```json
  { "message": "Validation error" }
  ```

### Update Style

- **PUT** `/styles/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Style Updated"
  }
  ```
- **Response:** Updated style object
- **Error Example:**
  ```json
  { "message": "Style not found" }
  ```

### Delete Style

- **DELETE** `/styles/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "message": "Style deleted" }
  ```
- **Error Example:**
  ```json
  { "message": "Style not found" }
  ```

---

## Admin

### Get All Users

- **GET** `/admin/users`
- **Headers:** `Authorization: Bearer <admin token>`
- **Response:**
  ```json
  [
    {
      "_id": "userId1",
      "name": "Admin User",
      "email": "admin@example.com",
      "isAdmin": true
    },
    {
      "_id": "userId2",
      "name": "Regular User",
      "email": "user@example.com",
      "isAdmin": false
    }
  ]
  ```
- **Error Example:**
  ```json
  { "message": "Not authorized as admin" }
  ```

### Delete User

- **DELETE** `/admin/users/{userId}`
- **Headers:** `Authorization: Bearer <admin token>`
- **Response:**
  ```json
  { "message": "User deleted" }
  ```
- **Error Example:**
  ```json
  { "message": "User not found" }
  ```

---

> For more details on request/response bodies, see the relevant controller or model files.
