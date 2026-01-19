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
- **Body:** FormData (multipart/form-data)

  ```javascript
  // Option 1: Product without variants
  {
    "name": "string",
    "description": "string",
    "price": "number (>= 0)",
    "stockQuantity": "integer (>= 0)",
    "categoryId": "string",
    "images": File[] // max 10 files
  }

  // Option 2: Product with variants
  {
    "name": "string",
    "description": "string",
    "price": "number (>= 0)",
    "categoryId": "string",
    "images": File[], // max 10 files
    "variants": JSON string [
      {
        "variantAttributes": { "color": "red", "size": "M" },
        "quantity": 10,
        "priceAdjustment": 5,
        "images": ["url1", "url2"]
      }
    ]
  }
  ```

- **Response (201):** Product object (with variants if provided)
- **Note:**
  - If variants provided, `stockQuantity` auto-calculated from variant quantities
  - `variantTypes` and `variantOptions` auto-generated from variants
  - All variant attributes must be non-empty objects
  - No duplicate variants allowed
- **Errors:** 400 (validation, empty variants, duplicate variants), 401, 403, 500

### Update Product (Seller Only)

- **Method:** PUT
- **URL:** `/products/:id`
- **Auth:** Required (Seller, owns product)
- **Body:** FormData (multipart/form-data, optional fields)
  ```javascript
  {
    "name": "string",
    "description": "string",
    "price": "number (>= 0)",
    "stockQuantity": "integer (>= 0)", // Only for products without variants
    "categoryId": "string",
    "images": File[] // max 10 files, replaces all existing images
  }
  ```
- **Response (200):** Updated product object
- **Note:**
  - Cannot update `variantTypes` or `variantOptions` directly
  - Cannot manually update `stockQuantity` for products with variants (auto-calculated)
  - Use variant endpoints to manage variants
- **Errors:** 400 (updating stock of variant product), 401, 403, 404, 500

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
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `status` (ACTIVE/INACTIVE/UPCOMING/EXPIRED), `search` (string)
- **Response (200):** `{ promotions: [...], pagination: {...} }`
- **Errors:** 500

### Get Promotion Statistics

- **Method:** GET
- **URL:** `/promotions/stats`
- **Response (200):** `{ total, upcoming, active, inactive, expired }`
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
- **Response (201):** Promotion object (status auto-determined: UPCOMING/ACTIVE/EXPIRED based on dates)
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
    "status": "ACTIVE | INACTIVE"
  }
  ```
- **Response (200):** Updated promotion object
- **Note:** Cannot manually set UPCOMING or EXPIRED (auto-determined by dates). Cannot activate before start date or after end date.
- **Errors:** 400 (invalid status change), 401, 403, 404, 500

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

## Product Variants

### Get Variants by Product ID

- **Method:** GET
- **URL:** `/variants/product/:productId`
- **Auth:** Required (Seller)
- **Response (200):** Array of variant objects
- **Errors:** 400, 401, 403, 500

### Create Product Variant (Seller Only)

- **Method:** POST
- **URL:** `/variants`
- **Auth:** Required (Seller, owns product)
- **Body:** JSON
  ```json
  {
    "productId": "string",
    "quantity": "integer (>= 0, default 0)",
    "variantAttributes": { "color": "red", "size": "M" },
    "images": ["string"],
    "priceAdjustment": "number (default 0)"
  }
  ```
- **Response (201):** Variant object
- **Note:**
  - `variantAttributes` must be non-empty object
  - Auto-syncs product's `variantTypes`, `variantOptions`, and `stockQuantity`
- **Errors:** 400 (empty attributes), 401, 403 (not product owner), 404 (product not found), 500

### Update Product Variant (Seller Only)

- **Method:** PUT
- **URL:** `/variants/:id`
- **Auth:** Required (Seller, owns product)
- **Body:** JSON (optional fields)
  ```json
  {
    "quantity": "integer (>= 0)",
    "variantAttributes": { "color": "blue", "size": "L" },
    "images": ["string"],
    "priceAdjustment": "number"
  }
  ```
- **Response (200):** Updated variant object
- **Note:**
  - If `variantAttributes` provided, must be non-empty object
  - Auto-syncs product metadata after update
- **Errors:** 400 (deleted product, empty attributes), 401, 403, 404, 500

### Delete Product Variant (Seller Only)

- **Method:** DELETE
- **URL:** `/variants/:id`
- **Auth:** Required (Seller, owns product)
- **Response (200):** Success message
- **Note:** Auto-syncs product metadata after deletion
- **Errors:** 401, 403, 404, 500

---

## Shopping Cart

### Get My Cart

- **Method:** GET
- **URL:** `/cart/me`
- **Auth:** Required (Customer)
- **Response (200):** Cart object with items (excludes deleted products), `{ id, customerId, items: [...], totalItems, totalPrice, createdAt, updatedAt }`
- **Errors:** 401, 403, 404, 500

### Add Item to Cart

- **Method:** POST
- **URL:** `/cart/items`
- **Auth:** Required (Customer)
- **Body:** JSON
  ```json
  {
    "productVariantId": "string",
    "quantity": "integer (> 0)"
  }
  ```
- **Response (201):** Cart item object (if item exists, quantity will be added)
- **Note:** Automatically merges with existing item if already in cart
- **Errors:** 400 (invalid quantity, product unavailable, exceeds stock), 401, 403, 404, 500

### Update Cart Item

- **Method:** PUT
- **URL:** `/cart/items/:id`
- **Auth:** Required (Customer)
- **Body:** JSON
  ```json
  {
    "quantity": "integer (> 0)"
  }
  ```
- **Response (200):** Updated cart item object
- **Errors:** 400 (exceeds stock), 401, 403 (not your cart item), 404, 500

### Delete Cart Item

- **Method:** DELETE
- **URL:** `/cart/items/:id`
- **Auth:** Required (Customer)
- **Response (200):** Success message
- **Errors:** 401, 403 (not your cart item), 404, 500

### Clear Cart

- **Method:** DELETE
- **URL:** `/cart/clear`
- **Auth:** Required (Customer)
- **Response (200):** Success message (removes all items from cart)
- **Errors:** 401, 403, 404, 500

---

## Orders

### Create Order (Customer Only)

- **Method:** POST
- **URL:** `/orders`
- **Auth:** Required (Customer)
- **Body:** JSON
  ```json
  {
    "addressId": "string",
    "paymentMethod": "COD | VNPAY (default: COD)"
  }
  ```
- **Response (201):** Order object with items, payment, address details
- **Note:**
  - Creates order from current cart items
  - Auto-deducts stock from variants
  - Clears cart after successful order
  - Validates stock availability and product status
  - Transaction with rollback on failure
- **Errors:** 400 (empty cart, insufficient stock, invalid payment method, deleted product), 401, 403, 404 (address/cart not found), 500

### Get My Orders (Customer Only)

- **Method:** GET
- **URL:** `/orders/me`
- **Auth:** Required (Customer)
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `status` (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED)
- **Response (200):** `{ orders: [...], pagination: {...} }`
- **Errors:** 401, 403, 404, 500

### Get All Orders (Admin/Seller Only)

- **Method:** GET
- **URL:** `/orders`
- **Auth:** Required (Admin/Seller)
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `status` (order status), `search` (customer username/email)
- **Response (200):** `{ orders: [...], pagination: {...} }`
- **Note:** Seller only sees orders containing their products
- **Errors:** 401, 403, 500

### Get Order by ID

- **Method:** GET
- **URL:** `/orders/:id`
- **Auth:** Required
- **Response (200):** Order object with full details
- **Note:**
  - Customer: only their own orders
  - Seller: only orders with their products
  - Admin: all orders
- **Errors:** 401, 403 (not your order), 404, 500

### Update Order Status (Admin/Seller Only)

- **Method:** PATCH
- **URL:** `/orders/:id/status`
- **Auth:** Required (Admin/Seller)
- **Body:** JSON
  ```json
  {
    "status": "PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED"
  }
  ```
- **Response (200):** Success message
- **Note:**
  - Valid transitions:
    - PENDING → CONFIRMED, SHIPPED, CANCELLED
    - CONFIRMED → SHIPPED, CANCELLED
    - SHIPPED → DELIVERED, CANCELLED
    - DELIVERED/CANCELLED → (no transitions)
  - Auto-updates payment status (DELIVERED→COMPLETED, CANCELLED→FAILED)
  - Auto-restores stock when CANCELLED
  - Seller can only update orders with their products
- **Errors:** 400 (invalid transition), 401, 403, 404, 409 (concurrent update), 500

### Delete Order

- **Method:** DELETE
- **URL:** `/orders/:id`
- **Auth:** Required
- **Response (200):** Success message
- **Note:**
  - Only PENDING orders can be deleted
  - Customer: can delete own orders
  - Seller: cannot delete orders (use status update instead)
  - Auto-restores stock when deleted
- **Errors:** 400 (not PENDING status), 401, 403 (seller cannot delete, not your order), 404, 500

---

## Reviews

### Get All Reviews

- **Method:** GET
- **URL:** `/reviews`
- **Query Params:**
  - `page` (int, default 1)
  - `limit` (int, default 10)
  - `rating` (int, 1–5)
  - `productId` (string)

- **Response (200):**

  ```json
  {
    "reviews": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
  ```

- **Notes:**
  - Nếu có `productId`, chỉ trả về review của sản phẩm đó
  - Sắp xếp theo `reviewDate` (mới nhất trước)

- **Errors:** 500

---

## Reviews

### Get All Reviews

- **Method:** GET
- **URL:** `/reviews`
- **Auth:** Not required
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `rating` (number, 1–5, optional)
  - `productId` (string, optional)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "reviews": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
      }
    }
  }
  ```

- **Notes:**
  - If `productId` is provided, only reviews of that product are returned
  - Sorted by `reviewDate` (newest first)

- **Errors:** 500

---

### Get Review By ID

- **Method:** GET
- **URL:** `/reviews/:id`
- **Auth:** Not required
- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "rating": 5,
      "comment": "string",
      "images": [],
      "reviewDate": "timestamp",
      "customer": {},
      "orderItem": {}
    }
  }
  ```

- **Errors:** 404, 500

---

### Get Reviews By Product

- **Method:** GET
- **URL:** `/reviews/product/:productId`
- **Auth:** Not required
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `rating` (number, 1–5, optional)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "reviews": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
      },
      "averageRating": 0,
      "ratingDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      }
    }
  }
  ```

- **Notes:**
  - Reviews are aggregated from all variants of the product

- **Errors:** 500

---

### Get Reviews By Variant

- **Method:** GET
- **URL:** `/reviews/variant/:variantId`
- **Auth:** Not required
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `rating` (number, 1–5, optional)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "reviews": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
      },
      "averageRating": 0,
      "ratingDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      "variant": {
        "id": "string",
        "productId": "string"
      }
    }
  }
  ```

- **Errors:** 404, 500

---

### Create Review

- **Method:** POST
- **URL:** `/reviews`
- **Auth:** Required (Customer)
- **Body:** `multipart/form-data`

  ```json
  {
    "orderItemId": "string",
    "rating": 5,
    "comment": "string",
    "images": []
  }
  ```

- **Response:** 201

  ```json
  {
    "success": true,
    "data": {}
  }
  ```

- **Notes:**
  - Customer can only review their own order items
  - Order must be in `DELIVERED` status
  - Each order item can only be reviewed once
  - Maximum 5 images per review

- **Errors:** 400, 401, 403, 404, 500

---

### Update Review

- **Method:** PUT
- **URL:** `/reviews/:id`
- **Auth:** Required (Customer)
- **Body:** `multipart/form-data`

  ```json
  {
    "rating": 4,
    "comment": "string",
    "images": []
  }
  ```

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {}
  }
  ```

- **Notes:**
  - Customer can only update their own review
  - Uploaded images will replace existing images

- **Errors:** 400, 401, 403, 404, 500

---

### Delete Review (Admin)

- **Method:** DELETE
- **URL:** `/reviews/admin/:id`
- **Auth:** Required (Admin)
- **Response:** 200

  ```json
  {
    "success": true,
    "message": "Review deleted successfully"
  }
  ```

- **Errors:** 401, 403, 404, 500

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
