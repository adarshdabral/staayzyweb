# Staayzy - Student Accommodation Marketplace

A complete full-stack web application for students to find and book rental accommodations. Property owners can list their properties, and admins can manage the platform.

## 🚀 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/UI**
- **React Query (TanStack Query)**
- **Zustand** (Global state management)
- **Axios**

### Backend
- **Node.js + Express**
- **TypeScript**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Role-based Access Control (RBAC)**

### Other
- **Cloudinary** (Image uploads)
- **Zod** (Validation)
- **REST APIs**

## 📁 Project Structure

```
staayzy/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── tenant/            # Tenant pages
│   ├── owner/             # Owner pages
│   ├── admin/             # Admin pages
│   ├── properties/        # Property detail pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── api.ts           # Axios instance
│   ├── store.ts         # Zustand store
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── backend/             # Backend server
    ├── src/
    │   ├── config/      # Configuration files
    │   ├── controllers/ # Route controllers
    │   ├── middleware/  # Auth & RBAC middleware
    │   ├── models/      # MongoDB models
    │   ├── routes/      # API routes
    │   ├── scripts/     # Seed scripts
    │   ├── utils/       # Utility functions
    │   └── index.ts     # Server entry point
    └── package.json
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Environment Variables

#### Frontend (`.env.local` in `staayzy/` directory)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

#### Backend (`.env` in `backend/` directory)

Create a `.env` file in the `backend/` directory with the following:

```env
PORT=5001
MONGODB_URI=mongodb+srv://teamadarshdabral_db_user:%3CprojectTest%3E@cluster0.scucbje.mongodb.net/staayzy?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Admin credentials (will be seeded)
ADMIN_EMAIL=admin@staayzy.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
ADMIN_PHONE=1234567890

# Cloudinary configuration (update with your credentials)
CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET>
```

**Note**: The MongoDB password `<projectTest>` is URL-encoded as `%3CprojectTest%3E` in the connection string. The connection string includes the database name `staayzy` and uses MongoDB Atlas cluster.

#### backend/.env.example

I added a `backend/.env.example` to the repository with the variables you should set. Copy it to `backend/.env` and update values for your environment.

```bash
cp backend/.env.example backend/.env
```

### 4. Seed Admin User

```bash
cd backend
npm run seed
```

This will create an admin user with:
- Email: `admin@staayzy.com`
- Password: `admin123`

**⚠️ Important**: Change these credentials in production!

### 5. Start MongoDB

Make sure MongoDB is running on your system. If using MongoDB Atlas or another cloud service, update the `MONGODB_URI` in `.env`.

### 6. Start the Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5001`

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 👥 Roles & Features

### Public (Non-logged-in)
- View landing page
- Browse featured rooms
- View testimonials
- See coming soon services (Mess & Laundry)

### Tenant
- **Landing Page**: Search for rooms with filters (location, rent, distance, sharing)
- **Room Detail**: View images, ratings, rent, availability, rules, reviews
- **Dashboard**:
  - Current booking status
  - Booked property details
  - Wishlist management
  - Add reviews
  - Raise complaints
  - View referral code
  - Profile management

### Owner
- **Landing Page**: List property CTA, view properties, benefits
- **Property Listing Flow**:
  - Property name, nearest college, distance
  - Facilities and images
  - Add multiple room types (single/sharing)
  - Set rent, security deposit, capacity
  - Room rules
- **Dashboard**:
  - Total properties, bookings, revenue
  - View/Edit properties
  - Manage booking requests (Approve/Reject)
  - View interested tenants
  - Earnings summary

### Admin
- **Dashboard**:
  - Total listings, bookings, revenue, users
  - Property approval/rejection
  - Complaint management
  - User role management
  - Audit logs

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes and API endpoints
- Automatic token refresh handling

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Properties
- `GET /api/properties` - Get all approved properties (public/tenant)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (owner/admin)
- `POST /api/properties/:propertyId/rooms` - Add room to property (owner/admin)
- `PUT /api/properties/:id` - Update property (owner/admin)
- `DELETE /api/properties/:id` - Delete property (owner/admin)

### Bookings
- `POST /api/bookings` - Create booking (tenant)
- `GET /api/bookings` - Get user bookings (tenant/owner)
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status (owner/admin)

### Reviews
- `POST /api/reviews` - Create review (tenant)
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/property/:id` - Get property reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Complaints
- `POST /api/complaints` - File complaint (tenant)
- `GET /api/complaints` - Get complaints
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/status` - Update complaint status (admin)

### Wishlist
- `POST /api/wishlist` - Add to wishlist (tenant)
- `GET /api/wishlist` - Get wishlist (tenant)
- `DELETE /api/wishlist/:id` - Remove from wishlist (tenant)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/properties/pending` - Get pending properties
- `PUT /api/admin/properties/:id/approve` - Approve property
- `PUT /api/admin/properties/:id/reject` - Reject property
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/audit-logs` - Get audit logs

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

## 🗄️ Database Models

- **User**: name, email, password, phone, role, referralCode
- **Property**: owner, name, nearestCollege, distanceFromCollege, facilities, images, status
- **Room**: property, roomType, capacity, availableCount, monthlyRent, securityDeposit, rules
- **Booking**: tenant, property, room, rent, securityDeposit, status, startDate, endDate
- **Review**: property, tenant, rating, comment
- **Complaint**: tenant, property, subject, description, status, adminNotes
- **Wishlist**: tenant, property
- **Referral**: referrer, referred, referralCode
- **AuditLog**: admin, action, resource, resourceId, details, ipAddress, userAgent

## 🔒 Business Rules

- Only admin-approved properties are visible to tenants
- Properties with no vacant rooms cannot be booked
- Owners can list same room type with multiple availability
- Tenants can only review properties after completing a booking
- Overbooking is prevented through room availability checks
- All routes are protected using RBAC middleware

## 🚨 Important Notes

1. **Cloudinary Setup**: You need to set up a Cloudinary account and add credentials to the `.env` file for image uploads to work properly.

2. **Admin Access**: The admin user is seeded via the seed script. Make sure to change the default credentials in production.

3. **Image Uploads**: Currently, the frontend uses temporary URLs for images. You'll need to integrate with Cloudinary on the backend for production use.

4. **Environment Variables**: Never commit `.env` files to version control. Use `.env.example` files as templates.

## 📦 Building for Production

### Frontend
```bash
cd staayzy
npm run build
npm start
```

### Backend
```bash
cd server
npm run build
npm start
```

## 🐛 Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running and the connection string in `.env` is correct.

2. **Port Already in Use**: Change the `PORT` in `.env` or kill the process using the port.

3. **CORS Errors**: Make sure the frontend URL is allowed in the backend CORS configuration.

4. **Authentication Errors**: Check that JWT_SECRET is set correctly and tokens are being sent in request headers.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Development

For development, both servers should be running simultaneously:
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3000`

The frontend is configured to proxy API requests to the backend server.

---

Built with ❤️ for students seeking accommodation
