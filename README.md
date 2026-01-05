# DocIntelligence - Enterprise Document Intelligence Platform

A production-ready, enterprise-grade Next.js 15 application for intelligent document processing with AI-powered OCR, classification, team collaboration, and comprehensive analytics.

## Features

### Core Document Processing
- **Multi-Source Intake**: Drag-and-drop, bulk upload, email forwarding, mobile camera capture, cloud storage integration (Google Drive, Dropbox, OneDrive)
- **Advanced OCR**: Google Cloud Vision API with multi-language support (100+ languages)
- **AI Classification**: Claude AI-powered document classification for invoices, receipts, contracts, resumes, medical records, legal documents, and more
- **Intelligent Extraction**: Field extraction with confidence scoring, table detection, signature detection, redaction identification
- **Smart Export**: Word (.docx), Excel (.xlsx), CSV, JSON, PDF, Markdown formats

### Team & Collaboration
- **Role-Based Access**: Owner, Admin, Member, and Viewer roles with granular permissions
- **Document Sharing**: Share documents with individuals or teams, expiration control
- **Team Management**: Create teams, invite members, manage team documents
- **Audit Logging**: Complete activity tracking for compliance and accountability
- **Notifications**: Real-time notifications for shares, processing status, and activities

### Business Features
- **Analytics Dashboard**: Visual charts showing document processing metrics
- **Usage Tracking**: Credits system with plan-based limits
- **Subscription Management**: Free, Starter, Professional, and Enterprise tiers with Stripe integration
- **API Access**: RESTful API for programmatic document processing
- **Security**: Row-level security, encrypted storage, SOC 2 compliance ready

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Prisma ORM + Neon PostgreSQL
- **Authentication**: Clerk
- **AI/ML**: Claude API, Google Cloud Vision
- **Payments**: Stripe
- **File Storage**: Vercel Blob
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts

## Architecture

### Authentication & Authorization
- Clerk handles user authentication with webhook integration
- Automatic user provisioning on signup
- Middleware-based route protection
- Role-based access control (RBAC) via database

### Database Schema
- 20+ Prisma models covering users, documents, teams, sharing, and analytics
- Row-level security for multi-tenant data isolation
- Audit logging for all document operations
- Subscription tracking for billing

### API Routes
- `/api/documents/upload` - File upload and storage
- `/api/documents/[id]/process` - OCR processing and classification
- `/api/documents/[id]/export` - Multi-format export
- `/api/documents/[id]/share` - Document sharing management
- `/api/teams/*` - Team management endpoints
- `/api/subscriptions/*` - Billing and payment handling
- `/api/webhooks/*` - External service integrations (Clerk, Stripe)

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Neon PostgreSQL database
- Clerk account for authentication
- Google Cloud Vision API credentials
- Stripe account for payments
- Vercel Blob storage (optional, for file storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd document-intelligence-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure `.env.local` with:
   - Database connection (Neon PostgreSQL)
   - Clerk API keys
   - Google Cloud Vision API key
   - Stripe API keys
   - Vercel Blob token (if using)

5. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed  # Optional: seed with sample data
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with these variables:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Cloud Vision
GOOGLE_CLOUD_API_KEY=your_api_key

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Vercel Blob (optional)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## File Structure

```
app/
├── (auth)/                 # Authentication pages (sign-in, sign-up)
├── (dashboard)/
│   ├── dashboard/          # Main dashboard
│   ├── dashboard/documents/
│   │   └── [id]/          # Document detail page
│   ├── dashboard/analytics/ # Analytics dashboard
│   ├── dashboard/folders/  # Folder management
│   └── dashboard/settings/ # User settings & billing
├── api/
│   ├── documents/          # Document operations
│   ├── teams/              # Team management
│   ├── subscriptions/      # Billing endpoints
│   └── webhooks/           # External webhooks
├── layout.tsx              # Root layout with Clerk provider
└── globals.css             # Tailwind styles and theme

components/
├── ui/                     # shadcn/ui components
├── sidebar.tsx             # Navigation sidebar
├── top-nav.tsx             # Top navigation bar
├── dashboard/
│   ├── dashboard-header.tsx
│   ├── document-grid.tsx
│   ├── stats-cards.tsx
│   └── empty-state.tsx
├── document-upload.tsx     # File upload component
├── document-viewer.tsx     # Document content viewer
├── document-actions.tsx    # Export/share actions
├── document-details.tsx    # Document metadata
├── share-dialog.tsx        # Document sharing UI
├── analytics/
│   ├── charts.tsx          # Analytics visualizations
│   └── audit-logs.tsx      # Activity logs
└── settings/
    ├── pricing-plans.tsx   # Subscription tiers
    └── account-settings.tsx # User profile settings

lib/
├── db.ts                   # Prisma client singleton
├── auth.ts                 # Authentication utilities
├── stripe.ts               # Stripe client
└── utils.ts                # Helper functions

prisma/
└── schema.prisma           # Database schema

middleware.ts              # Clerk authentication middleware
```

## Database Models

### Core Models
- **User**: User accounts with plan and credits
- **Document**: Document records with metadata and processing status
- **DocumentContent**: Extracted text content
- **ExtractedText**: OCR text with confidence scores
- **Table**: Detected tables in documents
- **Field**: Extracted fields with confidence scores
- **Classification**: Document type classification results
- **Annotation**: Highlights and annotations on documents
- **Comment**: User comments on documents
- **DocumentVersion**: Version history

### Collaboration Models
- **Team**: Team/workspace containers
- **TeamMember**: Team membership with roles
- **TeamInvite**: Pending team invitations
- **Share**: Document sharing with role-based access

### Business Models
- **Subscription**: Subscription tracking for billing
- **ApiKey**: API keys for programmatic access
- **AuditLog**: Audit trail for compliance
- **Notification**: User notifications

## API Documentation

### Authentication
All authenticated endpoints require valid Clerk credentials via middleware.

### Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

files: File[]  # Multiple files
```

### Process Document
```bash
POST /api/documents/[id]/process

Response: {
  id: string
  title: string
  status: "COMPLETED" | "FAILED"
  extractedText: string
  classification: { type: string, confidence: number }
}
```

### Export Document
```bash
POST /api/documents/[id]/export
Content-Type: application/json

{ "format": "docx" | "xlsx" | "csv" | "json" }

Response: Binary file
```

### Share Document
```bash
POST /api/documents/[id]/share
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "VIEWER" | "EDITOR",
  "expiresInDays": 30
}
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in project settings
4. Deploy

```bash
# Or deploy directly from CLI
vercel deploy
```

### Production Checklist
- [ ] Configure all environment variables
- [ ] Set up Neon PostgreSQL database
- [ ] Enable Clerk production keys
- [ ] Configure Stripe production keys
- [ ] Set up Vercel Blob for file storage
- [ ] Enable HTTPS and custom domain
- [ ] Configure email notifications
- [ ] Set up monitoring and logging
- [ ] Enable backups for database
- [ ] Review security and permissions

## Security

- **Authentication**: Clerk with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security (RLS) at database level
- **File Security**: Private file storage with signed URLs
- **Encryption**: HTTPS in transit, encrypted at rest
- **Audit Trail**: Complete logging of all operations
- **API Security**: Rate limiting, CORS, CSRF protection

## Performance Optimization

- Server-side rendering for SEO
- Incremental Static Regeneration (ISR)
- Image optimization with Next.js Image
- Database query optimization with Prisma
- Caching strategies for frequently accessed data
- CDN distribution via Vercel

## Monitoring & Analytics

- Vercel Analytics for performance tracking
- Database query monitoring
- Error tracking with Sentry (optional)
- Usage analytics dashboard
- Performance metrics dashboard

## Customization

### Branding
Update in `components/sidebar.tsx`:
- Logo and application name
- Color scheme in `app/globals.css`
- Fonts in `app/layout.tsx`

### Plans & Pricing
Update pricing tiers in `components/settings/pricing-plans.tsx` and adjust credit limits in `lib/auth.ts`.

### Document Types
Add new classification types in `prisma/schema.prisma` DocumentType enum and update Claude prompt in `/app/api/documents/[id]/process/route.ts`.

## Troubleshooting

### Database Connection Issues
- Verify Neon PostgreSQL URL is correct
- Check network access rules
- Ensure migrations have run: `npx prisma migrate dev`

### Clerk Authentication Errors
- Verify publishable and secret keys
- Check redirect URLs match configuration
- Clear browser cache and cookies

### OCR Processing Fails
- Verify Google Cloud Vision API is enabled
- Check API key has correct permissions
- Ensure document image is clear and legible

### Stripe Integration Issues
- Verify Stripe API keys
- Check webhook configuration
- Review Stripe dashboard for errors

## Support & Contributing

For issues or feature requests, please:
1. Open an issue on GitHub
2. Contact support at support@docintelligence.com
3. Check documentation at docs.docintelligence.com

## License

This project is proprietary and confidential.

## Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Advanced workflow automation
- [ ] Custom model training
- [ ] Multi-language document support
- [ ] Real-time collaboration editing
- [ ] Advanced security (2FA, SSO)
- [ ] White-label solution
