# Full-Stack E-Commerce Platform

Welcome to the repository for our full-stack E-Commerce platform built using the modern **PERN Stack** (PostgreSQL, Express 5, React 19, Node.js) and powered by **Next.js 15**. This project delivers a high-performance, responsive online shopping experience with secure transaction processing, dynamic product catalogs, and custom analytics algorithms.

![Desktop](/website-demo-image/desktop.png)
![Mobile](/website-demo-image/mobile.png)
![Showcase1](/website-demo-image/1.png)
![Showcase2](/website-demo-image/2.png)

---

## Key Features

### E-Commerce Capabilities
- **Next-Gen Tech Stack:** Fully upgraded to **Next.js 15 (standalone output)**, **React 19**, and **Express 5**.
- **Dynamic Catalog Organization:** Fully manageable Categories & Subcategories.
- **Product Options:** Color/size variant configuration with interactive previews and dynamic routing.
- **Unified Checkout Options:** 
  - **Online Payment:** Integrated with Stripe (using Elements) for highly secure client-side transactions.
  - **Payment on Delivery:** Built-in checkout flow with custom processing fee calculations.
- **Secure Server-to-Server API Auth:** Centralized server communication via a shared `API_SECRET` rather than legacy high-overhead client-side token generation.
- **Advanced Search & Filtering:** Dynamic sorting, pricing range filters, and rating filters on category and search views.
- **User Dashboard & Order Tracking:** Interactive checkout tracking, transaction status, history, and detail pages.
- **Active Review & Rating Engine:** Auto-recalculates average ratings, updates product metrics, and feeds homepage product selection algorithms dynamically.

### Supporting Pages
- **Category Specific Pages & Subcategory Lists**
- **Company Blog**
- **Interactive Contact Page**
- **Service Offerings Overview**
- **Legal/Policy Documents:** Terms & Conditions, Privacy Policy, Refund & Cancellation Policy.

---

## Installation & Local Development

### 1. Clone the repository
```sh
git clone https://github.com/HarmanPreet-Singh-XYT/E-Commerce.git
cd E-Commerce
```

### 2. Install Server Dependencies
```sh
cd Server
npm install
```

### 3. Install Client Dependencies
```sh
cd ../Client
npm install
```

### 4. Setup Local Databases
1. Create a PostgreSQL database named `ecommerce`.
2. Import the initial database schema and seed data:
   ```sh
   # In the Server directory:
   psql -U postgres -d ecommerce -f ecommerce.sql
   ```

### 5. Running in Development
Start the Backend Express Server:
```sh
cd Server
npm run dev
```

Start the Frontend Next.js Dev Server:
```sh
cd Client
npm run dev
```

---

## Environment Configuration

Create a `.env` file inside both `/Client` and `/Server` directories based on the templates below.

### Client Environment Variables (`Client/.env`)
```env
BACKEND_URL=http://localhost:3500
API_SECRET=your_shared_api_secret

# Public client-side keys (Baked in at build time)
NEXT_PUBLIC_FRONTEND_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_DOMAIN=http://localhost:3000
```

### Server Environment Variables (`Server/.env`)
```env
# Database Connections
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_database_password
DB_NAME=ecommerce

# Application Config
PORT=3500
FRONTEND_SERVER_ORIGIN=http://localhost:3000
JWT_ENCRYPTION_KEY=your_jwt_encryption_key
API_SECRET=your_shared_api_secret

# SMTP Email Delivery
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_smtp_app_password
SMTP_SENDERNAME="Your Store Name"
SMTP_SUPPORT=support@yourdomain.com

# Stripe & Google OAuth Secrets
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## Getting Started with Docker

Dockerfiles are located in `/Client` and `/Server`. To maintain elite security practices, **sensitive production credentials are NEVER baked into the images**; they are passed securely at runtime.

### 1. Build the Images
To build the backend (Server) image:
```sh
cd Server
docker build -t harmanpreet27/ecommerce-backend .
```

To build the frontend (Client) image, pass public `NEXT_PUBLIC_` variables as build-time arguments (they will be statically compiled into the client assets):
```sh
cd Client
docker build \
  --build-arg NEXT_PUBLIC_FRONTEND_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key \
  --build-arg NEXT_PUBLIC_DOMAIN=https://yourstore.com \
  -t harmanpreet27/ecommerce-client .
```

### 2. Run the Containers Individually
Run the Backend (Server):
```sh
docker run -d -p 3500:3500 \
  --name ecommerce-backend \
  -e FRONTEND_SERVER_ORIGIN=http://localhost:3000 \
  -e DB_USER=postgres \
  -e DB_PASS=your_db_pass \
  -e DB_HOST=your_db_host \
  -e DB_PORT=5432 \
  -e DB_NAME=ecommerce \
  -e SMTP_USER=your_smtp_user \
  -e SMTP_PASS=your_smtp_pass \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_SENDERNAME="Your Store" \
  -e SMTP_SUPPORT=support@yourdomain.com \
  -e JWT_ENCRYPTION_KEY=your_jwt_encryption_key \
  -e API_SECRET=your_shared_api_secret \
  -e GOOGLE_CLIENT_ID=your_google_client_id \
  -e GOOGLE_CLIENT_SECRET=your_google_client_secret \
  -e STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key \
  harmanpreet27/ecommerce-backend
```

Run the Frontend (Client) at Runtime:
```sh
docker run -d -p 3000:3000 \
  --name ecommerce-client \
  -e BACKEND_URL=http://your-backend-url:3500 \
  -e API_SECRET=your_shared_api_secret \
  harmanpreet27/ecommerce-client
```

---

## Running Together with Docker Compose (Recommended)

1. Navigate to the root directory where `docker-compose.yml` is defined.
2. Ensure you have defined a root-level `.env` file containing all variables.
3. Start the entire container network (including Postgres database service with automated healthchecks):
   ```sh
   docker compose up --build -d
   ```
4. Restore the initial database inside the running Postgres container:
   ```sh
   docker exec -i $(docker compose ps -q db) psql -U postgres -d ecommerce < Server/ecommerce.sql
   ```

---

## Contributing & License

We welcome contributions! Please fork the repository and submit a pull request. This project is licensed under the MIT License. See the `LICENSE` file for details.

### Contact & Support
For questions, feedback, or support requests, reach out to: **harmanpreetsingh@programmer.net**
