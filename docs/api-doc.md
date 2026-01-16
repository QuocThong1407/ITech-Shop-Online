# API Documentation for Frontend Developers

This guide helps frontend developers integrate with the backend API.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses **JWT (JSON Web Token)**.

1. Obtain a token via `/auth/login` or `/auth/register`.
2. Include the token in the `Authorization` header for protected endpoints.

**Example Request:**

```javascript
fetch("http://localhost:5000/api/users/me", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <YOUR_ACCESS_TOKEN>",
  },
});
```

### Register User

- **Method:** POST
- **URL:** `/auth/register`
- **Body:** JSON
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response (200):** User data + auto-login
- **Errors:** 400 (validation, username/email exists), 500

### Login User

- **Method:** POST
- **URL:** `/auth/login`
- **Body:** JSON
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response (200):** User data + access token
- **Errors:** 401 (invalid credentials), 404, 500

### Logout User

- **Method:** POST
- **URL:** `/auth/logout`
- **Auth:** Required
- **Response (200):** Success message
- **Errors:** 401, 500

### Forgot Password

- **Method:** POST
- **URL:** `/auth/forgot-password`
- **Body:** JSON
  ```json
  {
    "email": "string"
  }
  ```
- **Response (200):** Email sent confirmation
- **Errors:** 400, 404, 500

### Reset Password

- **Method:** POST
- **URL:** `/auth/reset-password`
- **Body:** JSON
  ```json
  {
    "token": "string",
    "newPassword": "string"
  }
  ```
- **Response (200):** Success message
- **Errors:** 400 (invalid token), 500

---

## User Management

### Get Current User

- **Method:** GET
- **URL:** `/users/me`
- **Auth:** Required
- **Response (200):** Current user object
- **Errors:** 401, 500

### Update Current User

- **Method:** PATCH
- **URL:** `/users/me`
- **Auth:** Required
- **Body:** JSON
  ```json
  {
    "username": "string"
  }
  ```
- **Response (200):** Updated user object
- **Errors:** 400, 401, 500

### Get All Users (Admin Only)

- **Method:** GET
- **URL:** `/users`
- **Auth:** Required (Admin)
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `role` (CUSTOMER/SELLER/ADMIN), `search` (string)
- **Response (200):** `{ users: [...], pagination: {...} }`
- **Errors:** 401, 403, 500

### Get User Statistics (Admin Only)

- **Method:** GET
- **URL:** `/users/stats`
- **Auth:** Required (Admin)
- **Response (200):** `{ total, customers, sellers, admins }`
- **Errors:** 401, 403, 500

### Get User by ID (Admin Only)

- **Method:** GET
- **URL:** `/users/:id`
- **Auth:** Required (Admin)
- **Response (200):** User object
- **Errors:** 401, 403, 404, 500

### Create User (Admin Only)

- **Method:** POST
- **URL:** `/users`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "CUSTOMER | SELLER | ADMIN"
  }
  ```
- **Response (201):** User object
- **Errors:** 400, 401, 403, 500

### Update User (Admin Only)

- **Method:** PUT
- **URL:** `/users/:id`
- **Auth:** Required (Admin)
- **Body:** JSON (optional fields)
  ```json
  {
    "username": "string",
    "email": "string",
    "role": "CUSTOMER | SELLER | ADMIN"
  }
  ```
- **Response (200):** Updated user object
- **Errors:** 400, 401, 403, 404, 500

### Delete User (Admin Only)

- **Method:** DELETE
- **URL:** `/users/:id`
- **Auth:** Required (Admin)
- **Response (200):** Success message
- **Errors:** 400 (cannot delete own account), 401, 403, 404, 500

---

## Categories

### Get All Categories

- **Method:** GET
- **URL:** `/categories`
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `search` (string)
- **Response (200):** `{ categories: [...], pagination: {...} }`
- **Errors:** 500

### Get Category Statistics

- **Method:** GET
- **URL:** `/categories/stats`
- **Response (200):** `{ total, topCategories: [...], allCategories: [...] }`
- **Errors:** 500

### Get Category by ID

- **Method:** GET
- **URL:** `/categories/:id`
- **Response (200):** Category object
- **Errors:** 404, 500

### Create Category (Admin Only)

- **Method:** POST
- **URL:** `/categories`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response (201):** Category object
- **Errors:** 400 (name exists), 401, 403, 500

### Update Category (Admin Only)

- **Method:** PUT
- **URL:** `/categories/:id`
- **Auth:** Required (Admin)
- **Body:** JSON (optional fields)
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response (200):** Updated category object
- **Errors:** 400, 401, 403, 404, 500

### Delete Category (Admin Only)

- **Method:** DELETE
- **URL:** `/categories/:id`
- **Auth:** Required (Admin)
- **Response (200):** Success message
- **Errors:** 400 (has products/promotions), 401, 403, 404, 500

---

## Addresses

### Get My Addresses

- **Method:** GET
- **URL:** `/addresses`
- **Auth:** Required
- **Response (200):** Array of address objects (default address first)
- **Errors:** 401, 500

### Get Address by ID

- **Method:** GET
- **URL:** `/addresses/:id`
- **Auth:** Required
- **Response (200):** Address object
- **Errors:** 401, 404, 500

### Create Address

- **Method:** POST
- **URL:** `/addresses`
- **Auth:** Required
- **Body:** JSON
  ```json
  {
    "phoneNumber": "string",
    "address": "string",
    "street": "string",
    "ward": "string",
    "district": "string",
    "province": "string"
  }
  ```
- **Response (201):** Address object (first address is auto-set as default)
- **Errors:** 400, 401, 404, 500

### Update Address

- **Method:** PUT
- **URL:** `/addresses/:id`
- **Auth:** Required
- **Body:** JSON (optional fields)
  ```json
  {
    "phoneNumber": "string",
    "address": "string",
    "street": "string",
    "ward": "string",
    "district": "string",
    "province": "string"
  }
  ```
- **Response (200):** Updated address object
- **Errors:** 400, 401, 404, 500

### Delete Address

- **Method:** DELETE
- **URL:** `/addresses/:id`
- **Auth:** Required
- **Response (200):** Success message
- **Errors:** 400 (default address or has orders), 401, 404, 500

### Set Default Address

- **Method:** PATCH
- **URL:** `/addresses/:id/default`
- **Auth:** Required
- **Response (200):** Updated address object
- **Errors:** 401, 404, 500

---

## Products

### Get All Products

- **Method:** GET
- **URL:** `/products`
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `categoryId` (string), `search` (string), `minPrice` (number), `maxPrice` (number), `sellerId` (string)
- **Response (200):** `{ products: [...], pagination: {...} }`
- **Errors:** 500

### Get Product by ID

- **Method:** GET
- **URL:** `/products/:id`
- **Response (200):** Product object with variants
- **Errors:** 404, 500

### Create Product (Seller Only)

- **Method:** POST
- **URL:** `/products`
- **Auth:** Required (Seller)
- **Body:** JSON
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "number (>= 0)",
    "stockQuantity": "integer (>= 0)",
    "categoryId": "string",
    "images": ["string"],
    "variantTypes": ["string"],
    "variantOptions": "object"
  }
  ```
- **Response (201):** Product object
- **Errors:** 400, 401, 403, 500

### Update Product (Seller Only)

- **Method:** PUT
- **URL:** `/products/:id`
- **Auth:** Required (Seller, owns product)
- **Body:** JSON (optional fields)
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "number (>= 0)",
    "stockQuantity": "integer (>= 0)",
    "categoryId": "string",
    "images": ["string"]
  }
  ```
- **Response (200):** Updated product object
- **Errors:** 400, 401, 403, 404, 500

### Delete Product (Seller Only)

- **Method:** DELETE
- **URL:** `/products/:id`
- **Auth:** Required (Seller, owns product)
- **Response (200):** Success message (soft delete - sets `is_deleted: true`)
- **Errors:** 400, 401, 403, 404, 500

---

## Promotions

### Get All Promotions

- **Method:** GET
- **URL:** `/promotions`
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `status` (ACTIVE/INACTIVE/EXPIRED), `search` (string)
- **Response (200):** `{ promotions: [...], pagination: {...} }`
- **Errors:** 500

### Get Promotion by ID

- **Method:** GET
- **URL:** `/promotions/:id`
- **Response (200):** Promotion object with related products/categories
- **Errors:** 404, 500

### Create Promotion (Admin Only)

- **Method:** POST
- **URL:** `/promotions`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "name": "string",
    "description": "string",
    "startDate": "ISO timestamp",
    "endDate": "ISO timestamp (must be after startDate)"
  }
  ```
- **Response (201):** Promotion object
- **Errors:** 400, 401, 403, 500

### Update Promotion (Admin Only)

- **Method:** PUT
- **URL:** `/promotions/:id`
- **Auth:** Required (Admin)
- **Body:** JSON (optional fields)
  ```json
  {
    "name": "string",
    "description": "string",
    "startDate": "ISO timestamp",
    "endDate": "ISO timestamp"
  }
  ```
- **Response (200):** Updated promotion object
- **Errors:** 400, 401, 403, 404, 500

### Update Promotion Status (Admin Only)

- **Method:** PATCH
- **URL:** `/promotions/:id/status`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "status": "ACTIVE | INACTIVE | EXPIRED"
  }
  ```
- **Response (200):** Updated promotion object
- **Errors:** 400, 401, 403, 404, 500

### Delete Promotion (Admin Only)

- **Method:** DELETE
- **URL:** `/promotions/:id`
- **Auth:** Required (Admin)
- **Response (200):** Success message
- **Errors:** 400, 401, 403, 404, 500

### Apply Promotion to Products (Admin Only)

- **Method:** POST
- **URL:** `/promotions/:id/apply`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "productIds": ["string", "string"]
  }
  ```
- **Response (200):** Success message
- **Errors:** 400, 401, 403, 404, 500

### Apply Promotion to Categories (Admin Only)

- **Method:** POST
- **URL:** `/promotions/:id/apply-categories`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "categoryIds": ["string", "string"]
  }
  ```
- **Response (200):** Success message
- **Errors:** 400, 401, 403, 404, 500

---

## Coupons

### Create Coupon (Admin Only)

- **Method:** POST
- **URL:** `/coupons`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "promotionId": "string",
    "code": "string",
    "discountPercentage": "number (0-100)",
    "maxUsage": "integer (>= 1)"
  }
  ```
- **Response (201):** Coupon object
- **Errors:** 400, 401, 403, 500

### Validate Coupon

- **Method:** POST
- **URL:** `/coupons/validate`
- **Auth:** Required
- **Body:** JSON
  ```json
  {
    "code": "string",
    "orderAmount": "number (> 0)"
  }
  ```
- **Response (200):** `{ valid: true/false, discount: number, finalAmount: number }`
- **Errors:** 400, 401, 500

### Get Coupons by Promotion (Admin Only)

- **Method:** GET
- **URL:** `/coupons/promotion/:id`
- **Auth:** Required (Admin)
- **Response (200):** Array of coupon objects
- **Errors:** 401, 403, 404, 500

### Update Coupon (Admin Only)

- **Method:** PUT
- **URL:** `/coupons/:id`
- **Auth:** Required (Admin)
- **Body:** JSON (optional fields)
  ```json
  {
    "code": "string",
    "discountPercentage": "number (0-100)",
    "maxUsage": "integer (>= 1)"
  }
  ```
- **Response (200):** Updated coupon object
- **Errors:** 400, 401, 403, 404, 500

---

## Notes for Frontend Implementation

- Always use `Authorization: Bearer <token>` header for authenticated requests
- Handle 401 errors by redirecting to login
- Use query parameters for filtering/pagination
- Check `success` field in response for success/failure
- All timestamps are in ISO 8601 format

## Common Response Format

Success response:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
```

## HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
