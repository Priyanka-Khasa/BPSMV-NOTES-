# Testing Notes

Use focused checks before pushing changes.

## Backend Tests

From `server/`:

```bash
npm test
```

The backend test suite uses Node's built-in test runner.

## Frontend Build

From `client/`:

```bash
npm run build
```

The build runs TypeScript checks and creates the Vite production bundle.

## Manual Smoke Test

- Open the home page.
- Register or log in with a test account.
- Complete onboarding.
- Confirm dashboard, resources, chat, jobs, profile, and gift pages load.
- Upload a small test file.
- Check the backend health route.

## Before Public Release

- Verify production environment variables.
- Confirm uploads use Cloudinary.
- Test Razorpay with test credentials.
- Check admin-only routes with an admin account and a normal student account.
