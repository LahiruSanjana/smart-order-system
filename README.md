# Smart Order System

A full-stack order management application with branch-aware order allocation.
Customers can browse products, choose a delivery location, and place orders. Administrators can manage products and branches, review orders, update fulfillment status, and inspect order details.

## Features

- Customer signup and JWT-based sign in
- Product catalog with product details and image URLs
- Location-based delivery selection with Leaflet
- Automatic branch allocation based on delivery location and stock
- Customer order history and order tracking
- Admin dashboard for products, branches, and orders
- Order status management: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- MongoDB persistence with Mongoose

## Tech Stack

- Frontend: React, Vite, React Router, Redux Toolkit, Tailwind CSS, React Leaflet
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Authentication: JSON Web Tokens and bcrypt

## Project Structure

```text
smart-order-system/
├── backend/     # Express and TypeScript API
├── frontend/    # React and Vite client
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Configuration

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart-order-system
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=5000

# Optional. These values are also the defaults used by the application.
SUPER_ADMIN_EMAIL=superadmin@smartorder.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!
```

The frontend defaults to `http://localhost:5000`. To use another backend URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Do not commit `.env` files or real secrets.

## Installation

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Seed Sample Data

Make sure MongoDB is running, configure `backend/.env`, then run:

```bash
cd backend
npm run seed
```

The seed script creates sample users, products, branches, and an order. It uses upserts, so running it again updates the sample records instead of blindly duplicating them.

## Run Locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The backend health endpoint is:

```text
GET http://localhost:5000/
```

## Sample Accounts

After seeding, you can use:

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `superadmin@smartorder.com` | `SuperAdmin123!` |
| Admin | `admin@smartorder.com` | `Admin123!` |
| Customer | `customer1@smartorder.com` | `Customer123!` |
| Customer | `customer2@smartorder.com` | `Customer123!` |

Change these credentials before using the application outside a local development environment.

## API Overview

All API paths are relative to the backend URL, normally `http://localhost:5000`.

### Users

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/users/signup` | Public |
| `POST` | `/users/login` | Public |
| `GET` | `/users/:id` | Authenticated |
| `PUT` | `/users/:id` | Authenticated |
| `PUT` | `/users/:id/password` | Authenticated |
| `PUT` | `/users/:id/role` | Super admin |
| `DELETE` | `/users/:id` | Admin or super admin |

### Products

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/products` | Public |
| `GET` | `/products/:id` | Public |
| `POST` | `/products` | Admin or super admin |
| `PUT` | `/products/:id` | Admin or super admin |
| `DELETE` | `/products/:id` | Admin or super admin |

### Branches

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/branches` | Public |
| `GET` | `/branches/:id` | Public |
| `POST` | `/branches` | Admin or super admin |
| `PUT` | `/branches/:id` | Admin or super admin |
| `DELETE` | `/branches/:id` | Admin or super admin |

### Orders

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/orders` | Authenticated |
| `GET` | `/orders/customer/:customerId` | Authenticated |
| `GET` | `/orders` | Admin or super admin |
| `GET` | `/orders/:id` | Admin or super admin |
| `GET` | `/orders/branch/:branchId` | Admin or super admin |
| `PUT` | `/orders/:id` | Authenticated |
| `DELETE` | `/orders/:id` | Admin or super admin |

Authenticated requests use:

```http
Authorization: Bearer <token>
```

## Useful Commands

### Backend

```bash
npm run dev       # Start the TypeScript API with reloads
npm run build     # Compile TypeScript to dist/
npm start         # Run the compiled API
npm run seed      # Insert or update sample data
```

### Frontend

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Troubleshooting

### Product or order requests fail with a network error

Confirm that the backend is running on port `5000` and that `VITE_API_URL` points to the correct URL. Restart Vite after changing frontend environment variables.

### Backend exits while connecting to MongoDB

Check that MongoDB is running and that `MONGO_URI` is present and valid in `backend/.env`.

### A token has expired

The frontend clears the stored token and user data when the API returns `401`, then redirects to the sign-in page.

### Admin pages are not available

Sign in with an `ADMIN` or `SUPER_ADMIN` account. Customer accounts can browse products, place orders, and view their own order history.