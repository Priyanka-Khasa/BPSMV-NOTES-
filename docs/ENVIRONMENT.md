# Environment Variables

Use `server/.env.example` as the source of truth for backend configuration.

## Required Locally

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign authentication cookies. |
| `CLIENT_URL` | Main frontend origin for CORS and redirects. |
| `API_URL` | Public backend URL used by OAuth callbacks. |
| `PORT` | Backend port, usually `5000`. |

## Required In Production

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | Production database. |
| `JWT_SECRET` | Strong, unique production JWT secret. |
| `CLIENT_URL` or `CLIENT_URLS` | Allowed production frontend origins. |
| `ADMIN_EMAIL` | Destination for important admin and gift issue messages. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary upload storage. |
| `CLOUDINARY_API_KEY` | Cloudinary API access. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |

## Optional Integrations

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Enables Google OAuth. |
| `GOOGLE_CLIENT_SECRET` | Enables Google OAuth. |
| `GOOGLE_CALLBACK_URL` | Overrides the default OAuth callback URL. |
| `RAZORPAY_KEY_ID` | Enables Razorpay checkout. |
| `RAZORPAY_KEY_SECRET` | Verifies Razorpay server requests. |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies Razorpay webhooks. |
| `BREVO_API_KEY` | Enables Brevo email delivery. |
| `RESEND_API_KEY` | Enables Resend fallback delivery. |

## Safety Notes

- Never commit real `.env` files.
- Use separate Razorpay checkout and webhook secrets.
- Rotate secrets if they were ever shared in chat, screenshots, or public logs.
