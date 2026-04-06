# Scripts Directory

This directory contains utility scripts for database management, deployment, and verification.

## Database Scripts

### verify-cms-seed.ts
Verifies that CMS seed data was created correctly.

```bash
npx tsx scripts/verify-cms-seed.ts
```

**Output**: Lists all settings, pages, and navigation items with their details.

### verify-cms-tables.ts
Verifies that CMS database tables exist with correct structure.

```bash
npx tsx scripts/verify-cms-tables.ts
```

### verify-cms-indexes.ts
Verifies that database indexes are properly created for performance.

```bash
npx tsx scripts/verify-cms-indexes.ts
```

## Deployment Scripts

### Windows (PowerShell)

- `pre-deploy-check.ps1` - Pre-deployment validation
- `setup-production.ps1` - Production environment setup
- `deploy-database.ps1` - Database deployment
- `add-vercel-env.ps1` - Add environment variables to Vercel
- `add-sentry-to-vercel.ps1` - Configure Sentry on Vercel
- `update-domain.ps1` - Update domain configuration

### Linux/Mac (Bash)

- `pre-deploy-check.sh` - Pre-deployment validation
- `setup-production.sh` - Production environment setup
- `deploy-database.sh` - Database deployment

## Usage

### Running TypeScript Scripts

```bash
npx tsx scripts/<script-name>.ts
```

### Running PowerShell Scripts

```powershell
.\scripts\<script-name>.ps1
```

### Running Bash Scripts

```bash
./scripts/<script-name>.sh
```

## Script Purposes

| Script | Purpose |
|--------|---------|
| verify-cms-seed.ts | Verify CMS data seeding |
| verify-cms-tables.ts | Check database schema |
| verify-cms-indexes.ts | Validate database indexes |
| pre-deploy-check | Validate before deployment |
| setup-production | Configure production environment |
| deploy-database | Deploy database changes |
| add-vercel-env | Manage Vercel environment variables |
| add-sentry-to-vercel | Setup error monitoring |
| update-domain | Update domain settings |

## Adding New Scripts

When adding new scripts:

1. Place in this directory
2. Use `.ts` for TypeScript, `.ps1` for PowerShell, `.sh` for Bash
3. Add execution instructions to this README
4. Include error handling and clear output messages
5. Document in relevant guide files

## Related Documentation

- `../CMS_SEED_GUIDE.md` - CMS seeding documentation
- `../DEPLOYMENT_GUIDE.md` - Deployment instructions
- `../prisma/seed-cms.ts` - CMS seed script
