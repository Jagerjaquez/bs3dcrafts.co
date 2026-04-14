
# Database Restore Instructions

## To restore this backup:

1. **Using the Admin Panel:**
   - Go to /admin/backup
   - Upload the backup file: bs3dcrafts-backup-2026-04-14.json
   - Preview changes and confirm import

2. **Using the API:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/import \
     -H "Content-Type: multipart/form-data" \
     -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
     -F "file=@bs3dcrafts-backup-2026-04-14.json"
   ```

3. **Using the import script:**
   ```bash
   node scripts/restore-backup.js bs3dcrafts-backup-2026-04-14.json
   ```

## Backup Contents:
- Site Content: 5 items
- Pages: 4 items  
- Products: 4 items
- Settings: 17 items
- Navigation: 7 items
- Media: 2 items

## Created: 2026-04-14T20:59:24.365Z
## Version: 1.0
