# 🚀 Unipay - Deployment Guide

## Quick Deployment Steps

### Prerequisites
✅ Supabase project created
✅ All migrations applied
✅ Environment variables set

---

## 1️⃣ **Prepare Environment Variables**

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 2️⃣ **Verify Database Setup**

Check that all migrations are applied:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Run this query to check tables:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

# Should return 25+ tables
```

Verify report views:

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Should return 13+ views
```

---

## 3️⃣ **Deploy to Vercel**

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to deploy
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

---

## 4️⃣ **Deploy to Netlify**

### Using Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod

# Add environment variables in Netlify Dashboard
```

---

## 5️⃣ **Configure Supabase for Production**

### Enable RLS on All Tables

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Should return no rows (all tables have RLS enabled)
```

### Create Admin User

```sql
-- After signing up a user, promote to admin:
UPDATE user_profiles 
SET role = 'university_admin'
WHERE email = 'admin@university.edu';
```

### Set Up Auth Redirects

In Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Add your production URL to:
   - Site URL
   - Redirect URLs
   - Additional Redirect URLs

Example:
```
Site URL: https://unipay.youruni.edu
Redirect URLs: 
  - https://unipay.youruni.edu/auth/callback
  - https://unipay.youruni.edu/dashboard
```

---

## 6️⃣ **Post-Deployment Checklist**

### Test Core Functionality

- [ ] Sign up new user
- [ ] Sign in
- [ ] View dashboard
- [ ] Submit timesheet
- [ ] Create allowance (as admin)
- [ ] Create deduction (as admin)
- [ ] Process payroll (as payroll officer)
- [ ] Download payslip
- [ ] Generate report
- [ ] Export CSV

### Security Checklist

- [ ] All RLS policies active
- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] HTTPS enabled
- [ ] Auth redirects configured
- [ ] Password requirements enforced

### Performance Checklist

- [ ] Images optimized
- [ ] API responses < 500ms
- [ ] Pages load < 2s
- [ ] No console errors
- [ ] Mobile responsive

---

## 7️⃣ **Initial Data Setup**

### Create Your University

```sql
INSERT INTO universities (name, code, address, phone, email)
VALUES (
  'Your University Name',
  'UNI',
  '123 Main St, City, State',
  '+1-555-0100',
  'contact@university.edu'
);
```

### Create Departments

```sql
INSERT INTO departments (university_id, name, code)
VALUES 
  ('uni-id', 'Computer Science', 'CS'),
  ('uni-id', 'Mathematics', 'MATH'),
  ('uni-id', 'Physics', 'PHYS'),
  ('uni-id', 'Administration', 'ADMIN');
```

### Create Pay Periods

```sql
INSERT INTO payroll_periods (
  university_id, 
  period_name, 
  period_start_date, 
  period_end_date, 
  payment_date
)
VALUES 
  ('uni-id', 'January 2025', '2025-01-01', '2025-01-31', '2025-02-05'),
  ('uni-id', 'February 2025', '2025-02-01', '2025-02-28', '2025-03-05'),
  ('uni-id', 'March 2025', '2025-03-01', '2025-03-31', '2025-04-05');
```

### Create Standard Allowances

```sql
-- Using the UI at /admin/allowances:
-- 1. Housing Allowance: $500/month, taxable
-- 2. Transport Allowance: $200/month, taxable
-- 3. Meal Allowance: $150/month, non-taxable
-- 4. Research Allowance: 5% of base, taxable
```

### Create Standard Deductions

```sql
-- Using the UI at /admin/deductions:
-- 1. Federal Tax: 20%, mandatory
-- 2. State Tax: 5%, mandatory
-- 3. Social Security: 6.2%, mandatory
-- 4. Medicare: 1.45%, mandatory
-- 5. Health Insurance: $200/month, optional
```

---

## 8️⃣ **Monitoring & Maintenance**

### Set Up Monitoring

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Supabase Monitoring:**
- Go to Supabase Dashboard > Reports
- Monitor:
  - API requests
  - Database size
  - Active connections
  - Query performance

### Database Backups

Enable automatic backups in Supabase:
1. Go to Database > Backups
2. Enable daily backups
3. Configure retention period (7+ days recommended)

### Regular Maintenance Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Review failed payroll runs
- [ ] Monitor database size

**Monthly:**
- [ ] Review audit logs
- [ ] Check for unused data
- [ ] Update documentation
- [ ] Review access permissions

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Feature updates

---

## 9️⃣ **Scaling Considerations**

### For 100-500 Employees
✅ Current setup is perfect
✅ No additional configuration needed

### For 500-2,000 Employees
- Consider database connection pooling
- Add caching layer (Redis)
- Optimize report queries
- Use materialized views for reports

```sql
-- Create materialized view for faster reports
CREATE MATERIALIZED VIEW mv_payroll_summary AS
SELECT * FROM vw_payroll_comprehensive_report;

-- Refresh daily
REFRESH MATERIALIZED VIEW mv_payroll_summary;
```

### For 2,000+ Employees
- Upgrade Supabase plan
- Add read replicas
- Implement queue system for payroll processing
- Consider microservices architecture

---

## 🔒 **Security Best Practices**

### Environment Variables
```bash
# NEVER commit these
.env.local
.env.production

# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### API Security
```typescript
// Always validate on server
// Never trust client data
// Use Supabase RLS
// Sanitize inputs
```

### Audit Logging
```sql
-- Review audit logs regularly
SELECT * FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 📊 **Performance Optimization**

### Database Indexes

Already created in migrations, but verify:

```sql
-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Should have indexes on all foreign keys
```

### Query Optimization

Use EXPLAIN ANALYZE to check slow queries:

```sql
EXPLAIN ANALYZE
SELECT * FROM vw_payroll_comprehensive_report
WHERE university_id = 'your-uni-id';
```

### Frontend Optimization

```bash
# Analyze bundle size
npm run build
npm install -g @next/bundle-analyzer

# Optimize images
# (Already using Next.js Image component)
```

---

## 🆘 **Troubleshooting**

### Common Issues

**Issue: "Missing environment variables"**
```bash
# Solution: Check .env.local
# Make sure variables are prefixed with NEXT_PUBLIC_
```

**Issue: "RLS policy violation"**
```sql
-- Solution: Check user profile exists
SELECT * FROM user_profiles WHERE id = 'user-id';

-- Create if missing
INSERT INTO user_profiles (id, email, role, university_id)
VALUES ('user-id', 'email@example.com', 'employee', 'uni-id');
```

**Issue: "Payroll processing fails"**
```sql
-- Solution: Check for approved timesheets
SELECT * FROM timesheets 
WHERE payroll_period_id = 'period-id'
AND status = 'approved';

-- Check employee has active assignment
SELECT * FROM vw_active_assignments
WHERE employee_id = 'emp-id';
```

**Issue: "PDF not downloading"**
```typescript
// Solution: Check browser popup blocker
// Make sure pop-ups are allowed for your domain
```

---

## 📞 **Support**

### Getting Help

1. Check this deployment guide
2. Review `COMPLETE_USER_GUIDE.md`
3. Check Supabase logs
4. Review browser console
5. Check database audit logs

### Useful Commands

```bash
# Check Next.js logs
npm run dev -- --turbo

# Check database connections
# In Supabase SQL Editor:
SELECT count(*) FROM pg_stat_activity;

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## ✅ **Deployment Complete!**

Your Unipay system is now:
- ✅ Deployed to production
- ✅ Secured with RLS
- ✅ Backed up automatically
- ✅ Monitored for performance
- ✅ Ready for users!

**Next:** Share the `COMPLETE_USER_GUIDE.md` with your team and start processing payroll! 🎉



