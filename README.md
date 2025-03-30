# Glassmorphic FortiGateX Security System

This project implements a complete security system with Role-Based Access Control (RBAC) featuring:
- Login page
- Signup page
- Forgot password functionality
- Role-based authorization
- Glassmorphism UI design
- Order management
- Customer validation

## Tech Stack
- **Frontend**: React.js with Glassmorphism UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Setup Phases

### Phase 1: Project Initialization and Setup

1. **Create project structure**
   ```bash
   # Create root directory
   mkdir fortigatex
   cd fortigatex
   
   # Initialize frontend
   npx create-react-app client
   
   # Initialize backend
   mkdir server
   cd server
   npm init -y
   ```

2. **Install backend dependencies**
   ```bash
   # Server dependencies
   npm install express mongoose bcryptjs jsonwebtoken dotenv cors nodemailer express-validator
   npm install nodemon --save-dev
   ```

3. **Install frontend dependencies**
   ```bash
   # In the client directory
   cd ../client
   npm install axios react-router-dom formik yup @mui/material @emotion/react @emotion/styled
   ```

### Phase 2: Backend Development

1. **Database Setup**
   - Configure MongoDB connection
   - Create user schema with role-based fields
   - Implement password hashing

2. **Authentication API**
   - Implement user registration endpoint
   - Implement login endpoint with JWT
   - Create password reset functionality
   - Implement email verification

3. **RBAC Implementation**
   - Create roles collection/schema
   - Implement role assignment
   - Create middleware for role verification
   - Test role-based access permissions

### Phase 3: Frontend Development

1. **Core App Structure**
   - Configure routes
   - Create protected route components
   - Set up authentication context/state

2. **Glassmorphism UI Components**
   - Implement glassmorphism card component
   - Create form input components
   - Design responsive layouts

3. **Authentication Pages**
   - Build signup page with validation
   - Create login page with error handling
   - Implement forgot password flow
   - Add email verification notifications

### Phase 4: Integration & Testing

1. **Connect Frontend to Backend**
   - Implement API service
   - Create authentication methods
   - Add token management

2. **User Role Management**
   - Create role management dashboard
   - Implement user role assignment
   - Test different access levels

3. **Testing & Bug Fixes**
   - Test authentication flow
   - Verify role-based access
   - Fix UI/UX issues

### Phase 5: Deployment

1. **Prepare for Production**
   - Set up environment variables
   - Configure CORS and security headers
   - Optimize build

2. **Deployment**
   - Deploy backend to a cloud provider (Heroku, AWS, etc.)
   - Deploy frontend to a static hosting service
   - Configure domain and SSL

## Project Structure

```
fortigatex/
├── client/                    # React frontend
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── contexts/          # Context API providers
│       ├── pages/             # Page components
│       ├── services/          # API services
│       ├── styles/            # CSS and style utilities
│       └── utils/             # Helper functions
│
└── server/                    # Node.js backend
    ├── config/                # Configuration files
    ├── controllers/           # Route controllers
    ├── middleware/            # Custom middleware
    ├── models/                # Mongoose schemas
    ├── routes/                # API routes
    └── utils/                 # Utility functions
```

## Getting Started

1. Clone the repository
2. Set up environment variables:
   - Create `.env` in server directory with:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     EMAIL_SERVICE=your_email_service
     EMAIL_USER=your_email
     EMAIL_PASS=your_email_password
     CLIENT_URL=http://localhost:3000
     ```

3. Start the backend:
   ```bash
   cd server
   npm run dev
   ```

4. Start the frontend:
   ```bash
   cd client
   npm start
   ```

## Key Features Implementation Details

### Backend RBAC Implementation

The role-based access control system uses three main components:

1. **User Model**: Includes role field referencing the Role model
2. **Role Model**: Defines available roles and permissions
3. **Auth Middleware**: Verifies user roles before allowing access to protected routes

### Glassmorphism Styling

The UI implements glassmorphism using CSS with:
- Background blur effects
- Transparency
- Subtle borders
- Light shadow effects

Example CSS for glassmorphism card:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

## Next Steps and Enhancements

After completing the core functionality, consider these enhancements:

1. Two-factor authentication
2. OAuth integration (Google, Facebook, etc.)
3. Advanced permission management
4. User profile management
5. Activity logging and audit trails 