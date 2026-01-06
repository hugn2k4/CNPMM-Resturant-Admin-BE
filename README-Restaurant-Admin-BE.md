# Restaurant Admin Backend

> Backend API for restaurant admin panel built with NestJS, TypeORM, and MySQL.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User & Customer Management
- 🍽️ Product & Category Management
- 📦 Order Management & Tracking
- 🔔 Real-time Notifications
- 📧 Email Service Integration
- 🛡️ Role-based Access Control (Admin, Manager, Staff)

## Tech Stack

**Framework:** NestJS 11.0  
**Language:** TypeScript 5.6  
**Database:** MySQL 8.0 with TypeORM 0.3  
**Authentication:** JWT with Passport  
**Email:** Nodemailer with Mailer module  
**Validation:** class-validator & class-transformer  

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd ADMIN/CNPMM-Resturant-Admin-BE
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Cài đặt MySQL

Đảm bảo MySQL đã được cài đặt và đang chạy trên máy của bạn.

## ⚙️ Cấu hình

### 1. Tạo file môi trường

Tạo file `.env` trong thư mục gốc:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_Getting Started

```bash
# Clone repository
git clone <repository-url>
cd ADMIN/CNPMM-Resturant-Admin-BE

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Create database
mysql -u root -p -e "CREATE DATABASE restaurant_admin"

# Run migrations (if any)
npm run migration:run

# Start development server
npm run start:dev
```

## Environment Variables

Create `.env` file in the root directory
# Rate Limiting
THROTTLE_TTL=60
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=restaurant_admin

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRATION=24h

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_password

# CORS
CORS_ORIGIN=http://localhost:3001
```

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
GET    /api/v1/auth/profile
```

### Users
```
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Products
```
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

### Orders
```
GET    /api/v1/orders
GET    /api/v1/orders/:id
PATCH  /api/v1/orders/:id/status
GET    /api/v1/orders/statistics
```

### Categories
```
GET    /api/v1/categories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

### Customers
```
GET    /api/v1/customers
GET    /api/v1/customers/:id
GET    /api/v1/customers/:id/orders
```

### Notifications
```
GETProject Structure

```
src/
├── common/          # Shared decorators, filters, guards, interceptors
├── config/          # Configuration files
├── modules/         # Feature modules
│   ├── auth/       # Authentication & authorization
│   ├── users/      # User management
│   ├── customers/  # Customer management
│   ├── products/   # Product management
│  Scripts

```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run seed         # Seed database
```

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Roles
- **Admin** - Full access
- **Manager** - Manage products, orders, customers
- **Staff** - View and update orders

## Database

### Entities
- User (Admin/Staff)
- Customer
- Category
- Product
- Order & OrderItem
- Notification

### Seeding
```bash
npm run seed
```

## Documentation

See [API-STRUCTURE.md](./API-STRUCTURE.md) for detailed API documentation.

## License

UNLICENSED

## Team

Developed by CNPMM Team