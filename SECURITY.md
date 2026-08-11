# Security

Please report security issues privately instead of opening a public issue.

## Sensitive Areas

- Authentication and JWT cookies.
- Google OAuth callbacks.
- Razorpay checkout and webhook verification.
- Resource file uploads.
- Public profile fields.
- Admin-only moderation routes.

## Secret Handling

- Do not commit `.env` files.
- Use strong unique secrets in production.
- Keep Razorpay webhook secrets separate from checkout secrets.
- Rotate credentials after accidental exposure.

## Upload Safety

- Keep upload limits conservative.
- Store production uploads in Cloudinary.
- Avoid exposing raw upload paths publicly.
- Restrict protected files to authenticated and subscribed users.

## Reporting

When reporting a security issue, include:

- The affected route or feature.
- Steps to reproduce.
- Expected and actual behavior.
- Any screenshots or logs with secrets removed.
