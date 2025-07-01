# POS Tracker Backend API Documentation

## Base URL

```
http://localhost:5000
```

---

## Authentication Endpoints

### Register

- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword",
    "name": "User Name"
  }
  ```
- **Response:**
  - `201 Created` with user info and tokens, or error message

### Login

- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword"
  }
  ```
- **Response:**
  - `200 OK` with user info and tokens, or error message

### Google OAuth

- **GET** `/auth/google`
  - Redirects to Google for authentication
- **GET** `/auth/google/callback`
  - Handles Google callback, issues tokens, and redirects to frontend

---

## Protected Endpoints

### Example: Protected Route

- **GET** `/protected`
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  - `200 OK` with user info if token is valid
  - `401 Unauthorized` or `403 Forbidden` if token is missing/invalid

---

## How to Use JWT Tokens

- After login or Google OAuth, store the `access_token` securely in your app.
- For any protected endpoint, include the token in the `Authorization` header:
  ```
  Authorization: Bearer <access_token>
  ```

---

## Error Responses

- `400 Bad Request` — Invalid input or missing fields
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Token expired or not allowed
- `500 Internal Server Error` — Server error

---

## Example: Fetching a Protected Resource

```js
fetch("http://localhost:5000/protected", {
  headers: {
    Authorization: "Bearer <access_token>",
  },
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## Notes

- All endpoints return JSON.
- Use HTTPS in production for all requests.
- Refresh tokens are set as HTTP-only cookies and should be handled by the backend.

---

For more endpoints or details, update this file as your backend grows.
