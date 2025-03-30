<<<<<<< Updated upstream
<<<<<<< HEAD
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
=======
# FortiGateX Security System

FortiGateX is a modern, glassmorphic security system with advanced authentication and role-based access control.

## Features

- 🔐 Secure authentication system with JWT
- 👤 Role-based access control
- 📱 Responsive glassmorphic UI using Material-UI
- 🛒 Order management system
- 👩‍💼 User management for administrators
- 🔄 Email verification (configurable)

## Tech Stack

### Frontend

- React.js with hooks
- Material-UI for UI components
- Context API for state management
- React Router for navigation
- Axios for API requests

### Backend

- Node.js & Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Nodemailer for email services

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- MongoDB (local or Atlas)
- NPM or Yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/Sardaar2003/fortigatex.git
   cd fortigatex
   ```

2. Install server dependencies:

   ```
   cd server
   npm install
   ```

3. Install client dependencies:

   ```
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   CLIENT_URL=http://localhost:3000
   ENABLE_EMAIL=false
   NODE_ENV=development
   ```

5. Create a `.env` file in the client directory:

   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

### Running the Application

1. Start the server:

   ```
>>>>>>> Stashed changes
   cd server
   npm run dev
   ```

<<<<<<< Updated upstream
4. Start the frontend:
   ```bash
=======
2. Start the client:

   ```
>>>>>>> Stashed changes
   cd client
   npm start
   ```

<<<<<<< Updated upstream
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
=======
=======
3. The application will be available at `http://localhost:3000`

>>>>>>> Stashed changes
## Deployment Guide for Render.com

### Backend Deployment (API Service)

1. Sign up for a Render account at <https://render.com>
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository or use the manual deploy option
4. Configure the service:
   - **Name**: `fortigatex-server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select the appropriate plan (Free tier works for testing)
5. Add the following environment variables under "Environment":
   - `PORT`: 10000 (Render assigns a port automatically, but we set this as backup)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key for JWT tokens
   - `JWT_EXPIRES_IN`: 1d
   - `EMAIL_SERVICE`: Your SMTP service (e.g., smtp.gmail.com)
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email password or app password
   - `CLIENT_URL`: URL of your frontend (e.g., <https://fortigatex-client.onrender.com>)
   - `ENABLE_EMAIL`: true/false
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: URL of your frontend (e.g., <https://fortigatex-client.onrender.com>)
6. Click "Create Web Service"

### Frontend Deployment (Static Site)

1. In Render dashboard, click "New +" and select "Static Site"
2. Connect your GitHub repository or use the manual deploy option
3. Configure the service:
   - **Name**: `fortigatex-client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Select the appropriate plan (Free tier works for testing)
4. Add the following environment variable:
   - `REACT_APP_API_URL`: URL of your backend API service (e.g., <https://fortigatex-server.onrender.com>)
5. Click "Create Static Site"

### Post-Deployment

1. After both services are deployed, verify that they're communicating correctly
2. Test user registration, login, and other key features
3. Check the logs in Render dashboard for any errors
<<<<<<< Updated upstream
4. If needed, adjust environment variables or configuration settings 
>>>>>>> a6cc220b4d14076dcc56121307b3bbbe9a5c1099
=======
4. If needed, adjust environment variables or configuration settings

## Default Admin Account

On first run, the system automatically creates an admin account:

- Email: <admin@example.com>
- Password: admin123

**IMPORTANT**: Change this password immediately after first login for security.

## License

MIT License
>>>>>>> Stashed changes
