export const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://teamerwork.netlify.app",
    "https://s81-kaviraja-m-capstone-teamer-2.onrender.com"
  ];
