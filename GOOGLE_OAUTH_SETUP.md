# Google OAuth Setup Guide

To enable Google authentication, you need to:

## 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Select "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:8080/auth/callback` (development)
   - `http://localhost:3001/auth/callback`
   - Your production domain/auth/callback

6. Copy the **Client ID** and **Client Secret**

## 2. Update Backend Configuration

Edit `backend/.env`:

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback
```

## 3. Update Frontend Configuration

Edit `frontend/.env` (create if not exists):

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

## 4. Restart Servers

After updating credentials, restart both backend and frontend servers.

## Testing

1. Open http://localhost:8080
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to dashboard
5. Check database: `SELECT * FROM users;`
