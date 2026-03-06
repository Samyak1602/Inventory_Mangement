# 📦 Inventory Management System — API Documentation

> **Backend**: NestJS + TypeORM + SQLite (`database.sqlite`)  
> **Base URL**: `http://localhost:3001/api`  
> **Content-Type**: `application/json`

---

## 🚀 Quick Start (Backend)

```bash
cd backend
npm install
npm run start:dev    # Starts on http://localhost:3001
```

On first run, the database (`database.sqlite`) is auto-created. Hit the seed endpoint to populate sample data:

```
GET http://localhost:3001/api/seed
```

---

## 🔐 Auth Module — `/api/auth`

> Simple email/password auth. No JWT — returns user object directly.

### POST `/api/auth/signup`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2026-03-02T06:00:00.000Z"
}
```

**Error Response (409 — Email already exists):**
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

---

### POST `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2026-03-02T06:00:00.000Z"
}
```

**Error Response (401 — Invalid credentials):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

---

## 📦 Products Module — `/api/products`

### Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | number | auto | Primary key |
| `name` | string | ✅ | Product name |
| `sku` | string | ✅ | Unique stock keeping unit |
| `category` | string | ✅ | e.g. Electronics, Clothing |
| `price` | number | ✅ | Decimal price |
| `quantity` | number | ✅ | Stock count |
| `description` | string | ❌ | Optional description |
| `createdAt` | datetime | auto | Auto-generated |
| `updatedAt` | datetime | auto | Auto-updated |

---

### GET `/api/products`

List all products. Supports search & pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search by name, SKU, or category |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Example:** `GET /api/products?search=phone&page=1&limit=10`

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "iPhone 15",
      "sku": "ELEC-001",
      "category": "Electronics",
      "price": 999.99,
      "quantity": 50,
      "description": "Latest Apple smartphone",
      "createdAt": "2026-03-02T06:00:00.000Z",
      "updatedAt": "2026-03-02T06:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### GET `/api/products/:id`

Get a single product by ID.

**Response (200):**
```json
{
  "id": 1,
  "name": "iPhone 15",
  "sku": "ELEC-001",
  "category": "Electronics",
  "price": 999.99,
  "quantity": 50,
  "description": "Latest Apple smartphone",
  "createdAt": "2026-03-02T06:00:00.000Z",
  "updatedAt": "2026-03-02T06:00:00.000Z"
}
```

**Error (404):** `{ "statusCode": 404, "message": "Product not found" }`

---

### POST `/api/products`

Create a new product.

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24",
  "sku": "ELEC-016",
  "category": "Electronics",
  "price": 899.99,
  "quantity": 30,
  "description": "Latest Samsung flagship"
}
```

**Response (201):** Returns created product object.

---

### PATCH `/api/products/:id`

Update an existing product. Send **only the fields you want to update**.

**Request Body (partial update):**
```json
{
  "price": 849.99,
  "quantity": 25
}
```

**Response (200):** Returns updated product object.

---

### DELETE `/api/products/:id`

Delete a product by ID.

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

---

## 👥 Customers Module — `/api/customers`

### Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | number | auto | Primary key |
| `name` | string | ✅ | Customer name |
| `email` | string | ✅ | Unique email |
| `phone` | string | ✅ | Phone number |
| `address` | string | ❌ | Street address |
| `city` | string | ❌ | City name |
| `createdAt` | datetime | auto | Auto-generated |

---

### GET `/api/customers`

List all customers. Supports search & pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search by name, email, or city |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+91-9876543210",
      "address": "123 MG Road",
      "city": "Mumbai",
      "createdAt": "2026-03-02T06:00:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### GET `/api/customers/:id`

**Response (200):** Single customer object.  
**Error (404):** `{ "statusCode": 404, "message": "Customer not found" }`

---

### POST `/api/customers`

**Request Body:**
```json
{
  "name": "Priya Patel",
  "email": "priya@example.com",
  "phone": "+91-9123456789",
  "address": "456 Park Street",
  "city": "Delhi"
}
```

**Response (201):** Returns created customer object.

---

### PATCH `/api/customers/:id`

**Request Body (partial):**
```json
{
  "phone": "+91-9999999999",
  "city": "Bangalore"
}
```

**Response (200):** Returns updated customer object.

---

### DELETE `/api/customers/:id`

**Response (200):** `{ "message": "Customer deleted successfully" }`

---

## 🛒 Orders Module — `/api/orders`

### Data Model

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | number | auto | Primary key |
| `orderNumber` | string | auto | Unique, auto-generated (e.g. `ORD-001`) |
| `customerId` | number | ✅ | FK → customers table |
| `productId` | number | ✅ | FK → products table |
| `quantity` | number | ✅ | Order quantity |
| `totalPrice` | number | auto | Calculated: `product.price × quantity` |
| `status` | string | ❌ | `pending` / `completed` / `cancelled` (default: `pending`) |
| `createdAt` | datetime | auto | Auto-generated |

### Relations
- **Order → Customer**: `ManyToOne` — Each order belongs to one customer
- **Order → Product**: `ManyToOne` — Each order references one product

---

### GET `/api/orders`

List all orders **with customer and product details populated**.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search by order number, customer name, or product name |
| `status` | string | — | Filter by status: `pending`, `completed`, `cancelled` |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-001",
      "quantity": 2,
      "totalPrice": 1999.98,
      "status": "completed",
      "createdAt": "2026-03-02T06:00:00.000Z",
      "customer": {
        "id": 1,
        "name": "Rahul Sharma",
        "email": "rahul@example.com"
      },
      "product": {
        "id": 1,
        "name": "iPhone 15",
        "price": 999.99
      }
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### GET `/api/orders/:id`

**Response (200):** Single order with `customer` and `product` objects.  
**Error (404):** `{ "statusCode": 404, "message": "Order not found" }`

---

### POST `/api/orders`

Create a new order. `totalPrice` is auto-calculated from product price × quantity.

**Request Body:**
```json
{
  "customerId": 1,
  "productId": 3,
  "quantity": 5,
  "status": "pending"
}
```

**Response (201):** Returns created order with populated relations.

---

### PATCH `/api/orders/:id`

**Request Body (partial):**
```json
{
  "status": "completed",
  "quantity": 3
}
```

**Response (200):** Returns updated order.

---

### DELETE `/api/orders/:id`

**Response (200):** `{ "message": "Order deleted successfully" }`

---

## 🌱 Seed Module — `/api/seed`

### GET `/api/seed`

Populates the database with sample data. **Clears existing data first.**

**Response (200):**
```json
{
  "message": "Database seeded successfully",
  "data": {
    "users": 5,
    "products": 15,
    "customers": 10,
    "orders": 20
  }
}
```

> [!WARNING]
> This endpoint **deletes all existing data** before seeding. Use only for initial setup or reset.

---

## 🔗 Frontend Integration Guide

### Setup

The frontend (Next.js) should run on `http://localhost:3000` and make API calls to `http://localhost:3001/api`.

**Environment variable** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### API Helper (`lib/api.ts`)

Create a centralized API helper:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Usage Examples:
// GET all products:    apiRequest('/products?page=1&limit=10')
// GET one product:     apiRequest('/products/1')
// CREATE product:      apiRequest('/products', { method: 'POST', body: JSON.stringify(data) })
// UPDATE product:      apiRequest('/products/1', { method: 'PATCH', body: JSON.stringify(data) })
// DELETE product:      apiRequest('/products/1', { method: 'DELETE' })
```

### CORS Configuration

The backend must enable CORS for the frontend origin. This is configured in `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});
```

### User Session (Simple — No JWT)

Store user data in `localStorage` after login/signup:

```typescript
// After login/signup success:
localStorage.setItem('user', JSON.stringify(userData));

// Check if logged in:
const user = JSON.parse(localStorage.getItem('user') || 'null');

// Logout:
localStorage.removeItem('user');
```

### Pagination Response Format

All list endpoints return the same pagination structure:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;      // Total items in database
  page: number;       // Current page
  limit: number;      // Items per page
  totalPages: number; // Total number of pages
}
```

---

## 🧪 Testing Endpoints (cURL)

```bash
# Seed the database
curl http://localhost:3001/api/seed

# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get all products
curl http://localhost:3001/api/products

# Create a product
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","sku":"TEST-001","category":"Test","price":99.99,"quantity":10}'

# Update a product
curl -X PATCH http://localhost:3001/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":79.99}'

# Delete a product
curl -X DELETE http://localhost:3001/api/products/1

# Get all orders (with relations)
curl http://localhost:3001/api/orders

# Create an order
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"productId":2,"quantity":3}'
```

---

## 📌 Status Codes Summary

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PATCH, DELETE) |
| `201` | Created (POST) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (wrong credentials) |
| `404` | Not Found |
| `409` | Conflict (duplicate email/SKU) |
| `500` | Internal Server Error |
