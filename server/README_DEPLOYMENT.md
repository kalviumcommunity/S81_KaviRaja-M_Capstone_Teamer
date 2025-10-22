# Deployment Best Practices for MERN App

## Environment Variables
Set these in your deployment environment (e.g., Render, Netlify, Vercel):

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `SESSION_SECRET` — Session secret
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `GOOGLE_CALLBACK_URL` — Google OAuth callback URL
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME` — Cloudinary credentials
- `PORT` — Server port (default: 5000)
- `ALLOWED_ORIGINS` — Comma-separated list of allowed frontend URLs (e.g., `https://yourdomain.com,https://app.netlify.app`)
- `FRONTEND_URL` — Main frontend URL for redirects (e.g., `https://yourdomain.com`)

## CORS & Cookies
- Make sure your frontend and backend URLs are set correctly in env vars.
- For production, set cookies to `secure: true` and use HTTPS.

## Common Deployment Issues
- Hardcoded URLs: Always use env vars for API endpoints and redirects.
- CORS errors: Set `ALLOWED_ORIGINS` to match your deployed frontend.
- Cookie/session issues: Use secure cookies and sameSite settings for production.

## Example .env for Production
```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://app.netlify.app
FRONTEND_URL=https://yourdomain.com
```
