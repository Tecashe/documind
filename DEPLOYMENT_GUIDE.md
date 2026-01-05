# DocIntelligence Deployment Guide

## Overview

DocIntelligence is a production-ready document intelligence platform built with Next.js, Clerk authentication, Prisma ORM, and Neon PostgreSQL. This guide covers everything needed to deploy to production.

## Prerequisites

- Vercel account
- Neon PostgreSQL database
- Clerk authentication project
- Google Cloud Vision API credentials (optional for OCR)
- Google OAuth credentials (for Drive integration)
- Stripe account (for payments)
- Email service provider (Mailgun/SendGrid for email forwarding)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Google Cloud
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CLOUD_VISION_API_KEY=...

# Google Drive
GOOGLE_DRIVE_CLIENT_ID=...
GOOGLE_DRIVE_CLIENT_SECRET=...

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Email
EMAIL_DOMAIN=documents.example.com
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Redis (for queue processing)
REDIS_URL=redis://...
```

## Database Setup

1. Create a PostgreSQL database with Neon
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Deployment Steps

### 1. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy:
   ```bash
   git push origin main
   ```

### 2. Database Migration

```bash
npx prisma migrate deploy
```

### 3. Verify Webhooks

- Clerk: Configure webhook endpoint to `/api/webhooks/clerk`
- Stripe: Configure webhook endpoint to `/api/webhooks/stripe`
- Email: Configure webhook endpoint to `/api/webhooks/email`

## Monitoring

Monitor your application using:
- Vercel Analytics
- Clerk Dashboard
- Stripe Dashboard
- Neon Dashboard

## Scaling Considerations

- Enable Vercel Edge Runtime for optimal performance
- Use Upstash Redis for distributed caching
- Monitor database connections with Neon
- Set up CDN for static assets

## Maintenance

- Regularly update dependencies
- Monitor error rates in Clerk dashboard
- Check database performance metrics
- Review audit logs monthly

## Support

For issues or questions, contact support@docintelligence.com
