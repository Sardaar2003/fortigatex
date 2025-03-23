## Deployment Guide for Render.com

### Backend Deployment (API Service)

1. Sign up for a Render account at https://render.com
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
   - `CLIENT_URL`: URL of your frontend (e.g., https://fortigatex-client.onrender.com)
   - `ENABLE_EMAIL`: true/false
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: URL of your frontend (e.g., https://fortigatex-client.onrender.com)
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
   - `REACT_APP_API_URL`: URL of your backend API service (e.g., https://fortigatex-server.onrender.com)
5. Click "Create Static Site"

### Post-Deployment

1. After both services are deployed, verify that they're communicating correctly
2. Test user registration, login, and other key features
3. Check the logs in Render dashboard for any errors
4. If needed, adjust environment variables or configuration settings 