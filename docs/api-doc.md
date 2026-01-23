# API Documentation for Frontend Developers

This guide helps frontend developers integrate with the backend API.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT token-based authentication. After login, include the access token in the `Authorization` header:

```javascript
fetch("http://localhost:5000/api/users/me", {
  headers: {
    Authorization: "Bearer YOUR_ACCESS_TOKEN",
  },
});
```

---

## Authentication

### Register User

- **Method:** POST
- **URL:** `/auth/register`
- **Body:** JSON
  ```json
  {
    "username": "string",
    "email": "string (valid email format)",
    "password": "string (min 8 characters)",
    "password_confirmation": "string (must match password)"
  }
  ```
- **Response (201):** `{ message: "Please verify your email to complete registration" }`
- **Note:**
  - Sends verification email to user
  - User must verify email before login
  - Profile auto-created on first login after verification
- **Errors:** 400 (validation, passwords don't match, email already registered), 500

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
- **Response (200):** `{ accessToken: "string", user: { id, username, email, role } }`
- **Note:**
  - Email must be verified
  - Auto-creates profile (User, Customer, Cart, Membership) if not exists
  - Returns JWT access token for subsequent requests
- **Errors:** 401 (invalid credentials), 403 (email not verified), 500

### Complete Profile

- **Method:** POST
- **URL:** `/auth/complete-profile`
- **Auth:** Required
- **Response (201):** Success message
- **Note:**
  - Manual endpoint to trigger profile creation
  - Auto-creates User, Customer, Cart, and Membership records
  - Usually called automatically during login
- **Errors:** 401, 500

### Logout User

- **Method:** POST
- **URL:** `/auth/logout`
- **Auth:** Required
- **Response (200):** Success message
- **Errors:** 401 (no token), 500

### Forgot Password

- **Method:** POST
- **URL:** `/auth/forgot-password`
- **Body:** JSON
  ```json
  {
    "email": "string"
  }
  ```
- **Response (200):** `{ message: "If the email exists, a reset link has been sent" }`
- **Note:** Always returns success for security (prevents email enumeration)
- **Errors:** 400, 500

### Reset Password

- **Method:** POST
- **URL:** `/auth/reset-password`
- **Body:** JSON
  ```json
  {
    "token": "string (from email link)",
    "newPassword": "string (min 8 characters)"
  }
  ```
- **Response (200):** Success message
- **Errors:** 400 (invalid/expired token, validation), 500

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
- **Query Params:**
  - `page` (int, default 1)
  - `limit` (int, default 10)
  - `categoryId` (string)
  - `sellerId` (string)
  - `search` (string – search by name or description)
  - `minPrice` (number)
  - `maxPrice` (number)

- **Response (200):**

  ```json
  {
    "products": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "price": 100000,
        "stockQuantity": 50,
        "images": ["string"],
        "variantTypes": ["color", "size"],
        "variantOptions": {
          "color": ["red", "blue"],
          "size": ["M", "L"]
        },
        "categoryId": "string",
        "Category": {
          "id": "string",
          "name": "string",
          "description": "string"
        },
        "Seller": {
          "id": "string",
          "User": {
            "id": "string",
            "username": "string",
            "email": "string"
          }
        },
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
  ```

- **Note:**
  - Only non-deleted products are returned
  - Results are sorted by `createdAt` (newest first)

- **Errors:** 500

---

### Get Product by ID

- **Method:** GET
- **URL:** `/products/:id`
- **Response (200):**

  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": 100000,
    "stockQuantity": 50,
    "images": ["string"],
    "variantTypes": ["color", "size"],
    "variantOptions": {
      "color": ["red", "blue"],
      "size": ["M", "L"]
    },
    "Category": {
      "id": "string",
      "name": "string",
      "description": "string"
    },
    "Seller": {
      "id": "string",
      "User": {
        "id": "string",
        "username": "string",
        "email": "string"
      }
    },
    "ProductVariant": [
      {
        "id": "string",
        "quantity": 10,
        "variantAttributes": { "color": "red", "size": "M" },
        "images": ["string"],
        "priceAdjustment": 5000
      }
    ],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

- **Errors:** 404 (product not found), 500

---

### Create Product (Admin Only)

- **Method:** POST

- **URL:** `/products`

- **Auth:** Required (Admin)

- **Body:** `multipart/form-data`

  **Product without variants**

  ```json
  {
    "name": "string",
    "description": "string",
    "price": 100000,
    "stockQuantity": 50,
    "categoryId": "string",
    "sellerId": "string",
    "images": File[]
  }
  ```

  **Product with variants**

  ```json
  {
    "name": "string",
    "description": "string",
    "price": 100000,
    "categoryId": "string",
    "sellerId": "string",
    "images": File[],
    "variants": [
      {
        "variantAttributes": { "color": "red", "size": "M" },
        "quantity": 10,
        "priceAdjustment": 5000
      }
    ]
  }
  ```

- **Response (201):** Product object

- **Note:**
  - Only Admin can create products
  - `sellerId` is required and cannot be changed later
  - If variants are provided:
    - `stockQuantity` is auto-calculated from variant quantities
    - `variantTypes` and `variantOptions` are auto-generated

  - Variant attributes must be non-empty objects
  - Duplicate variants are not allowed

- **Errors:** 400 (validation, duplicate variants, invalid seller/category), 401, 403, 500

---

### Update Product (Admin Only)

- **Method:** PUT
- **URL:** `/products/:id`
- **Auth:** Required (Admin)
- **Body:** `multipart/form-data` (optional fields)

  ```json
  {
    "name": "string",
    "description": "string",
    "price": 120000,
    "stockQuantity": 40,
    "categoryId": "string",
    "images": File[]
  }
  ```

- **Response (200):** Updated product object
- **Note:**
  - `sellerId`, `variantTypes`, `variantOptions` cannot be updated
  - Cannot manually update `stockQuantity` if product has variants
  - Uploaded images replace all existing images

- **Errors:** 400 (invalid update), 401, 403, 404, 500

---

### Update Product Stock (Seller Only)

- **Method:** PATCH
- **URL:** `/products/:id/stock`
- **Auth:** Required (Seller)
- **Body:** JSON

  ```json
  {
    "stockQuantity": 30
  }
  ```

- **Response (200):** Updated product object
- **Note:**
  - Only applies to products **without variants**
  - Seller can only update stock for their own products

- **Errors:** 400 (product has variants, invalid quantity), 401, 403, 404, 500

---

### Delete Product (Admin Only)

- **Method:** DELETE
- **URL:** `/products/:id`
- **Auth:** Required (Admin)
- **Response (200):** Success message
- **Note:**
  - Soft delete (`is_deleted = true`)
  - Deleted products are hidden from public queries

- **Errors:** 401, 403, 404, 500

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

### Get All Coupons

- **Method:** GET
- **URL:** `/coupons`
- **Query Params:** `page` (int, default 1), `limit` (int, default 10), `promotionId` (string), `search` (string, search by code)
- **Response (200):** `{ coupons: [...], pagination: {...} }`
- **Errors:** 500

### Get Coupon by ID

- **Method:** GET
- **URL:** `/coupons/:id`
- **Response (200):** Coupon object with promotion details
- **Errors:** 404, 500

### Create Coupon (Admin Only)

- **Method:** POST
- **URL:** `/coupons`
- **Auth:** Required (Admin)
- **Body:** JSON
  ```json
  {
    "promotionId": "string",
    "code": "string (auto-uppercase)",
    "discountPercentage": "number (0-100)",
    "maxUsage": "integer (>= 1)"
  }
  ```
- **Response (201):** Coupon object
- **Note:** Promotion must be ACTIVE, code must be unique
- **Errors:** 400 (promotion not active, code exists, validation), 401, 403, 404 (promotion not found), 500

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
- **Response (200):**
  ```json
  {
    "valid": true,
    "coupon": { "id", "code", "discountPercentage", "promotionName" },
    "calculation": { "originalAmount", "discountPercentage", "discountAmount", "finalAmount" },
    "remainingUsage": "number"
  }
  ```
- **Note:**
  - Validates promotion status (must be ACTIVE)
  - Validates promotion dates (must be within range)
  - Validates usage limit (must not exceed maxUsage)
  - Returns discount calculation
- **Errors:** 400 (promotion inactive/expired/not started, usage limit reached), 401, 404 (coupon not found), 500

### Get Coupons by Promotion (Admin Only)

- **Method:** GET
- **URL:** `/coupons/promotion/:id`
- **Auth:** Required (Admin)
- **Response (200):** `{ promotion: {...}, coupons: [...], totalCoupons: number }`
- **Errors:** 401, 403, 404 (promotion not found), 500

### Update Coupon (Admin Only)

- **Method:** PUT
- **URL:** `/coupons/:id`
- **Auth:** Required (Admin)
- **Body:** JSON (optional fields)
  ```json
  {
    "code": "string (auto-uppercase)",
    "discountPercentage": "number (0-100)",
    "maxUsage": "integer (>= 1)",
    "usageCount": "integer"
  }
  ```
- **Response (200):** Updated coupon object
- **Note:** Code must be unique if changed
- **Errors:** 400 (code exists, validation), 401, 403, 404 (coupon not found), 500

### Delete Coupon (Admin Only)

- **Method:** DELETE
- **URL:** `/coupons/:id`
- **Auth:** Required (Admin)
- **Response (200):** Success message
- **Errors:** 401, 403, 404 (coupon not found), 500

---

## Variants

### Get Variants by Product

- **Method:** GET
- **URL:** `/variants/product/:productId`
- **Auth:** Not required
- **Response (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "productId": "string",
        "quantity": 10,
        "variantAttributes": {
          "color": "red",
          "size": "M"
        },
        "images": ["string"],
        "priceAdjustment": 5000,
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
  }
  ```

- **Note:**
  - Only variants belonging to the given product are returned
  - Results are sorted by `createdAt` (oldest first)

- **Errors:** 400, 500

---

### Create Variant (Seller Only)

- **Method:** POST
- **URL:** `/variants`
- **Auth:** Required (Seller)
- **Body:** `multipart/form-data`

  ```json
  {
    "productId": "string",
    "quantity": 10,
    "variantAttributes": {
      "color": "red",
      "size": "M"
    },
    "priceAdjustment": 5000,
    "images": File[]
  }
  ```

- **Response (201):**

  ```json
  {
    "success": true,
    "message": "Product variant created successfully",
    "data": {
      "id": "string",
      "productId": "string",
      "quantity": 10,
      "variantAttributes": {
        "color": "red",
        "size": "M"
      },
      "images": ["string"],
      "priceAdjustment": 5000,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```

- **Note:**
  - Only sellers can create variants
  - Seller can only create variants for products assigned to them
  - `variantAttributes` must be a **non-empty object**
  - Duplicate variant attributes for the same product are not allowed
  - Images are optional
  - If not provided:
    - `quantity` defaults to `0`
    - `priceAdjustment` defaults to `0`

  - Product must not be deleted

- **Errors:** 400 (validation, duplicate variant), 401, 403, 404, 500

---

### Update Variant (Seller Only)

- **Method:** PUT
- **URL:** `/variants/:id`
- **Auth:** Required (Seller)
- **Body:** `multipart/form-data` (optional fields)

  ```json
  {
    "quantity": 15,
    "variantAttributes": {
      "color": "blue",
      "size": "L"
    },
    "priceAdjustment": 7000,
    "images": File[]
  }
  ```

- **Response (200):**

  ```json
  {
    "success": true,
    "message": "Product variant updated successfully",
    "data": {
      "id": "string",
      "productId": "string",
      "quantity": 15,
      "variantAttributes": {
        "color": "blue",
        "size": "L"
      },
      "images": ["string"],
      "priceAdjustment": 7000,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```

- **Note:**
  - Only sellers can update variants
  - Seller can only update variants of products assigned to them
  - Cannot update variants of deleted products
  - `variantAttributes`, if provided, must be a **non-empty object**
  - Duplicate variant attributes are not allowed
  - If images are uploaded:
    - All existing images are deleted
    - New images replace old ones

- **Errors:** 400 (validation, duplicate variant), 401, 403, 404, 500

---

### Delete Variant (Seller Only)

- **Method:** DELETE
- **URL:** `/variants/:id`
- **Auth:** Required (Seller)
- **Response (200):**

  ```json
  {
    "success": true,
    "message": "Product variant deleted successfully",
    "data": null
  }
  ```

- **Note:**
  - Only sellers can delete variants
  - Seller can only delete variants of products assigned to them
  - All variant images are deleted from storage
  - Product variant metadata is automatically re-synced after deletion

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

## Cancellations

### Create Cancellation Request

- **Method:** POST
- **URL:** `/orders/:id/cancel/request`
- **Auth:** Required (Customer)
- **Body:** JSON

  ```json
  {
    "reason": "string"
  }
  ```

- **Response:** 201

  ```json
  {
    "success": true,
    "message": "Cancellation request created successfully",
    "data": {}
  }
  ```

- **Notes:**
  - Customer can only cancel their own orders
  - Order status must be one of: `PENDING`, `CONFIRMED`, `SHIPPED`
  - An order can only have **one** cancellation request
  - Maximum reason length is 500 characters

- **Errors:** 400, 401, 403, 404, 500

---

### Get My Cancellations

- **Method:** GET
- **URL:** `/cancellations/me`
- **Auth:** Required (Customer)
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `status` (string, optional)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "cancellations": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
      }
    }
  }
  ```

- **Errors:** 401, 500

---

### Get All Cancellations

- **Method:** GET
- **URL:** `/cancellations`
- **Auth:** Required (Admin, Seller)
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `status` (string, optional)
  - `search` (string, optional – customer username or email)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "cancellations": [],
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
  - Seller only sees cancellations for orders containing their products

- **Errors:** 401, 403, 500

---

### Get Cancellation By ID

- **Method:** GET
- **URL:** `/cancellations/:id`
- **Auth:** Required
- **Response:** 200

  ```json
  {
    "success": true,
    "data": {}
  }
  ```

- **Notes:**
  - Customer can only access their own cancellation requests
  - Seller can only access cancellations related to their products

- **Errors:** 401, 403, 404, 500

---

### Update Cancellation Status

- **Method:** PATCH
- **URL:** `/cancellations/:id/status`
- **Auth:** Required (Admin, Seller)
- **Body:** JSON

  ```json
  {
    "status": "APPROVED | REJECTED | COMPLETED"
  }
  ```

- **Response:** 200

  ```json
  {
    "success": true,
    "message": "Cancellation status updated successfully",
    "data": {}
  }
  ```

- **Notes:**
  - Valid status transitions:
    - `REQUESTED` → `APPROVED`, `REJECTED`
    - `APPROVED` → `COMPLETED`

  - When status becomes `COMPLETED`:
    - Order status is updated to `CANCELLED`
    - Payment status is updated to `FAILED`
    - Product stock is restored

- **Errors:** 400, 401, 403, 404, 409, 500

---

## Returns

### Create Return Request

- **Method:** POST
- **URL:** `/orders/:id/return/request`
- **Auth:** Required (Customer)
- **Body:** JSON

  ```json
  {
    "reason": "string"
  }
  ```

- **Response:** 201

  ```json
  {
    "success": true,
    "message": "Return request created successfully",
    "data": {}
  }
  ```

- **Notes:**
  - Customer can only return their own orders
  - Order status must be `DELIVERED`
  - An order can only have **one** return request
  - Maximum reason length is 500 characters

- **Errors:** 400, 401, 403, 404, 500

---

### Get My Returns

- **Method:** GET
- **URL:** `/returns/me`
- **Auth:** Required (Customer)
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `status` (string, optional)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "returns": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
      }
    }
  }
  ```

- **Errors:** 401, 500

---

### Get All Returns

- **Method:** GET
- **URL:** `/returns`
- **Auth:** Required (Admin, Seller)
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `status` (string, optional)
  - `search` (string, optional – customer username or email)

- **Response:** 200

  ```json
  {
    "success": true,
    "data": {
      "returns": [],
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
  - Seller only sees returns for orders containing their products

- **Errors:** 401, 403, 500

---

### Get Return By ID

- **Method:** GET
- **URL:** `/returns/:id`
- **Auth:** Required
- **Response:** 200

  ```json
  {
    "success": true,
    "data": {}
  }
  ```

- **Notes:**
  - Customer can only access their own return requests
  - Seller can only access returns related to their products

- **Errors:** 401, 403, 404, 500

---

### Update Return Status

- **Method:** PATCH
- **URL:** `/returns/:id/status`
- **Auth:** Required (Admin, Seller)
- **Body:** JSON

  ```json
  {
    "status": "APPROVED | REJECTED | COMPLETED"
  }
  ```

- **Response:** 200

  ```json
  {
    "success": true,
    "message": "Return status updated successfully",
    "data": {}
  }
  ```

- **Notes:**
  - Valid status transitions:
    - `REQUESTED` → `APPROVED`, `REJECTED`
    - `APPROVED` → `COMPLETED`

  - When status becomes `COMPLETED`:
    - Product stock is restored
    - Payment status is updated to `REFUNDED`

- **Errors:** 400, 401, 403, 404, 409, 500

---

## Membership

### Get My Membership (Customer Only)

- **Method:** GET
- **URL:** `/memberships/me`
- **Auth:** Required (Customer)
- **Response (200):**
  ```json
  {
    "id": "string",
    "customerId": "string",
    "membership": "BRONZE | SILVER | GOLD | PLATINUM",
    "spent": "number",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "Customer": { "User": { "username", "email" } },
    "tierInfo": {
      "current": "BRONZE",
      "spent": 500000,
      "nextTier": "SILVER",
      "spentToNextTier": 500000,
      "benefits": {
        "discountPercentage": 0,
        "freeShipping": false,
        "prioritySupport": false,
        "earlyAccess": false
      }
    }
  }
  ```
- **Note:**
  - Tiers: BRONZE (0-999K), SILVER (1M-4.99M), GOLD (5M-9.99M), PLATINUM (10M+)
  - Auto-upgraded when order DELIVERED (adds payment amount to spent)
  - Auto-downgraded when order CANCELLED/RETURNED (deducts payment amount from spent)
- **Errors:** 401, 403, 404 (customer/membership not found), 500

### Get All Memberships (Admin Only)

- **Method:** GET
- **URL:** `/memberships`
- **Auth:** Required (Admin)
- **Query Params:**
  - `page` (int, default 1)
  - `limit` (int, default 10)
  - `tier` (BRONZE/SILVER/GOLD/PLATINUM)
  - `sort` (spent_asc/spent_desc, default: spent_desc)
- **Response (200):**
  ```json
  {
    "data": [
      {
        "id": "string",
        "customerId": "string",
        "membership": "string",
        "spent": "number",
        "Customer": { "User": { "username", "email" } },
        "benefits": { }
      }
    ],
    "pagination": { "page", "limit", "total", "totalPages" }
  }
  ```
- **Errors:** 401, 403, 500

### Get Membership by ID (Admin Only)

- **Method:** GET
- **URL:** `/memberships/:id`
- **Auth:** Required (Admin)
- **Response (200):** Membership object with customer info and benefits
- **Errors:** 401, 403, 404 (membership not found), 500

### Get Top Spent Members (Admin Only)

- **Method:** GET
- **URL:** `/memberships/top-spent`
- **Auth:** Required (Admin)
- **Query Params:** `limit` (int, default 10, max 100)
- **Response (200):**
  ```json
  [
    {
      "rank": 1,
      "id": "string",
      "customerId": "string",
      "membership": "PLATINUM",
      "spent": 15000000,
      "Customer": { "User": { "username", "email" } },
      "benefits": { }
    }
  ]
  ```
- **Note:** Ordered by spent (descending), includes rank position
- **Errors:** 400 (invalid limit), 401, 403, 500

---

## Reports

> **Base path:** `/reports`
> **Access:** Admin only

---

### Revenue Report

- **Method:** GET
- **URL:** `/reports/revenue`
- **Auth:** Required (Admin)
- **Query Params:**
  - `startDate` (string, **required**, format: `YYYY-MM-DD`)
  - `endDate` (string, **required**, format: `YYYY-MM-DD`)
  - `groupBy` (string, optional, default: `day`)
    - Allowed values: `day`, `month`, `year`

  - `format` (string, optional, default: `json`)
    - Allowed values: `json`, `excel`

- **Response (200 – JSON):**

  ```json
  {
    "success": true,
    "message": "Revenue report generated",
    "data": {
      "summary": {
        "totalIncome": 723000000,
        "totalRefund": 0,
        "netRevenue": 723000000
      },
      "rows": [
        {
          "period": "2026-01",
          "income": 723000000,
          "refund": 0,
          "netRevenue": 723000000
        }
      ],
      "details": {
        "totalCompletedPayments": 5,
        "totalApprovedReturns": 0,
        "totalApprovedCancellations": 0
      }
    }
  }
  ```

- **Response (200 – Excel):**
  - `Content-Type:` `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition:` `attachment; filename="revenue_report.xlsx"`

- **Note:**
  - Revenue is calculated from:
    - **Completed payments** (`Payment.status = SUCCESS`)
    - **Approved returns** (`Return.status = APPROVED`)
    - **Approved cancellations** (`Cancellation.status = APPROVED`)

  - Refund amount is taken from the related order payment
  - Net revenue = `income - refund`
  - Date range is inclusive (`00:00:00` → `23:59:59.999`)

- **Errors:** 400 (invalid params), 401, 403, 500

---

### Activity Report

- **Method:** GET
- **URL:** `/reports/activity`
- **Auth:** Required (Admin)
- **Query Params:**
  - `startDate` (string, **required**, format: `YYYY-MM-DD`)
  - `endDate` (string, **required**, format: `YYYY-MM-DD`)
  - `format` (string, optional, default: `json`)
    - Allowed values: `json`, `excel`

- **Response (200 – JSON):**

  ```json
  {
    "success": true,
    "message": "Activity report generated",
    "data": {
      "summary": {
        "totalActiveUsers": 10,
        "newUsers": 3,
        "newOrders": 5,
        "newReviews": 2,
        "newUsersByRole": {
          "CUSTOMER": 2,
          "SELLER": 1
        }
      },
      "activities": {
        "customers": [
          {
            "userId": "string",
            "username": "string",
            "email": "string",
            "lastActive": "timestamp",
            "accountCreated": "timestamp",
            "customerId": "string",
            "totalOrders": 3
          }
        ],
        "sellers": [
          {
            "userId": "string",
            "username": "string",
            "email": "string",
            "lastActive": "timestamp",
            "accountCreated": "timestamp",
            "sellerId": "string",
            "totalProducts": 5
          }
        ],
        "admins": [
          {
            "userId": "string",
            "username": "string",
            "email": "string",
            "lastActive": "timestamp",
            "accountCreated": "timestamp",
            "adminId": "string",
            "totalReportsGenerated": 2
          }
        ]
      },
      "statistics": {
        "totalCustomers": 5,
        "totalSellers": 3,
        "totalAdmins": 2
      }
    }
  }
  ```

- **Response (200 – Excel):**
  - `Content-Type:` `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition:` `attachment; filename="activity_report.xlsx"`

- **Note:**
  - Active users are determined by `User.updatedAt` within the date range
  - Includes activity details for:
    - Customers (orders)
    - Sellers (products)
    - Admins (reports generated)

  - Summary includes:
    - New users
    - New orders
    - New reviews

- **Errors:** 400 (invalid params), 401, 403, 500

---

---

## Payments

The Payment service handles transaction processing for orders. It currently supports two methods: **COD** (Cash on Delivery) and **VNPAY** (Electronic Payment Gateway).

### 1. Create New Payment

Initializes a payment transaction for an order. If using VNPAY, the API returns a URL to redirect the user to the payment gateway.

- **Method:** `POST`
- **URL:** `/payments`
- **Authentication:** `Required` (Role: `CUSTOMER`)
- **Body:** `JSON`

```json
{
  "orderId": "string (UUID)",
  "method": "COD | VNPAY",
  "returnUrl": "string (Required if method is VNPAY)"
}
```

- **Response (201):**
- **For COD method:**

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "status": "PENDING",
      "method": "COD",
      "...": "..."
    },
    "message": "COD payment created. Pay when you receive the order."
  }
}
```

- **For VNPAY method:**

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "status": "PENDING",
      "method": "VNPAY",
      "...": "..."
    },
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "message": "Redirect to VNPay to complete payment"
  }
}
```

- **Note:** - The order must be in `PENDING` or `CONFIRMED` status.
- `returnUrl` is the Frontend page address where VNPay will redirect the user after payment.

- **Errors:** 400 (Invalid method, Missing params), 403 (Not order owner), 404 (Order not found).

---

### 2. Get Payment by Order ID

Retrieves the specific payment details and status for a given order.

- **Method:** `GET`
- **URL:** `/payments/:orderId`
- **Authentication:** `Required` (Order owner, Seller of products in the order, or Admin)
- **Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 150000,
    "method": "VNPAY",
    "status": "SUCCESS",
    "paymentDate": "2024-03-20T10:00:00Z",
    "orderId": "uuid",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

- **Errors:** 403 (Forbidden access), 404 (Payment not found).

---

### 3. VNPay Callbacks (Background Processing)

These endpoints are called by VNPay to update transaction statuses in the system.

#### VNPay IPN (Instant Payment Notification)

- **Method:** `GET`
- **URL:** `/payments/vnpay/ipn`
- **Note:** - Server-to-Server background call from VNPay to update payment results even if the user closes the browser.
- Updates the `Payment` table to `SUCCESS` and the `Order` table to `CONFIRMED` if `vnp_ResponseCode` is `00`.

- **Response:** Returns VNPay specific format (e.g., `{"RspCode": "00", "Message": "Success"}`).

#### VNPay Return URL

- **Method:** `GET`
- **URL:** `/payments/vnpay/return`
- **Note:** - VNPay redirects the user's browser here.
- After processing, the Server performs a **Redirect** to the Frontend with the following URL structure:
  `${frontendUrl}/payment/result?success=true&orderId=...&message=...`

- **Frontend Action:** The result page on the Frontend should use these query parameters to display the appropriate notification.

---

## Notes for Payment Implementation

- **Status Flow:** Default status upon creation is `PENDING`. It only transitions to `SUCCESS` upon verified successful response from the payment gateway.
- **Security:** All VNPay transactions are verified via `vnp_SecureHash` signature using `HMAC-SHA512` before updating the database.
- **Environment Variables:** Ensure `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`, and `FRONTEND_URL` are configured in the `.env` file.

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
