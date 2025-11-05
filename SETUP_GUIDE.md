# 🚀 Unipay Setup Guide

Welcome to Unipay! Your university payroll system is now ready for development.

## ✅ What's Been Completed

### 1. **Database Schema** (100% Complete)
- ✅ 18 database tables created
- ✅ Row Level Security (RLS) enabled
- ✅ 6 user roles configured
- ✅ Helper functions and views
- ✅ Sample seed data loaded

### 2. **TypeScript Types** (100% Complete)
- ✅ Auto-generated from database
- ✅ Supabase client updated
- ✅ Type-safe database queries

### 3. **Backend APIs** (100% Complete)
- ✅ Database query helpers (`src/lib/db/queries.ts`)
- ✅ Authentication utilities
- ✅ Type-safe Supabase client

### 4. **Frontend Components** (100% Complete)
- ✅ Employee Dashboard (`/dashboard`)
- ✅ Timesheets Management (`/timesheets`)
- ✅ Reusable UI components

## 📦 Project Structure

```
unipay/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Employee dashboard
│   │   ├── timesheets/
│   │   │   └── page.tsx              # Timesheet management
│   │   ├── (auth)/
│   │   │   ├── signin/               # Sign in page
│   │   │   └── forgot-password/      # Password reset
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardContent.tsx  # Main dashboard
│   │   │   ├── StatsCard.tsx         # Stats cards
│   │   │   ├── TimesheetList.tsx     # Recent timesheets
│   │   │   └── PaymentHistory.tsx    # Payment history
│   │   ├── timesheets/
│   │   │   └── TimesheetsContent.tsx # Timesheet list
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts             # Supabase client (updated)
│       │   ├── config.ts             # Configuration
│       │   ├── server.ts             # Server-side client
│       │   └── database.types.ts     # TypeScript types
│       └── db/
│           └── queries.ts            # Database queries
├── supabase/
│   └── migrations/                   # All migrations applied
├── DATABASE_SCHEMA.md                # Database documentation
├── README_SCHEMA.md                  # Schema guide
└── SETUP_GUIDE.md                    # This file
```

## 🎯 Sample Data Loaded

Your database now includes:
- **2 Universities** - UTech and SCC
- **4 Departments** - CS, Math, Physics, Library
- **5 Job Positions** - TA, RA, Lab Assistant, etc.
- **4 Tax Deduction Configs** - Federal, State, FICA
- **3 Payroll Periods** - October-November 2024

## 🔧 Next Steps

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dbhyauxwbuzwdwxrphpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Test the Application

#### Create a Test User:

1. Go to Supabase Dashboard → Authentication
2. Add a test user
3. Manually create a user_profile record:

```sql
INSERT INTO user_profiles (id, email, first_name, last_name, university_id, role)
VALUES (
  'your-auth-user-id',
  'test@example.com',
  'John',
  'Doe',
  '11111111-1111-1111-1111-111111111111', -- UTech ID
  'employee'
);
```

4. Create an employee record:

```sql
INSERT INTO employees (user_id, university_id, department_id, employee_number, employee_type, hire_date)
VALUES (
  'your-user-id',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333', -- CS Department
  'EMP001',
  'student_worker',
  '2024-10-01'
);
```

## 🎨 Features Implemented

### Employee Dashboard (`/dashboard`)
- ✅ YTD earnings display
- ✅ Active job assignments
- ✅ Pending timesheets counter
- ✅ Recent timesheet list
- ✅ Payment history
- ✅ Quick stats overview

### Timesheet Management (`/timesheets`)
- ✅ View all timesheets
- ✅ Filter by status
- ✅ Stats overview
- ✅ Status badges
- ✅ Empty states

## 📝 Available Database Queries

The `src/lib/db/queries.ts` file includes ready-to-use functions:

```typescript
// User & Employee
getCurrentUserProfile()
getCurrentEmployee()

// Assignments
getEmployeeAssignments(employeeId)

// Timesheets
getEmployeeTimesheets(employeeId, status?)
getTimesheetWithEntries(timesheetId)
createTimesheet(data)
addTimeEntry(data)
submitTimesheet(timesheetId, userId)

// Payments
getEmployeePayments(employeeId, limit)
getYTDEarnings(employeeId, year?)
calculateGrossPay(assignmentId, regularHours, overtimeHours)

// Positions
getAvailableJobPositions(universityId)
```

## 🎯 TODO: What's Next?

### Phase 1: Core Functionality (Priority)
- [ ] Create timesheet detail page
- [ ] Add time entry form
- [ ] Implement timesheet submission
- [ ] Create employee profile page
- [ ] Add bank account management

### Phase 2: HR & Admin Features
- [ ] HR admin dashboard
- [ ] Timesheet approval interface
- [ ] Employee management
- [ ] Job position management
- [ ] Department management

### Phase 3: Payroll Processing
- [ ] Payroll run creation
- [ ] Payment calculation engine
- [ ] Deduction configuration
- [ ] Pay stub generation
- [ ] Payment processing integration

### Phase 4: Advanced Features
- [ ] Email notifications
- [ ] PDF pay stubs
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Export functionality

## 🔒 Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Role-based access control**
- Employees can only see their own data
- Supervisors can view/manage their team
- HR has university-wide access
- System admins have full control

## 🐛 Troubleshooting

### Database Connection Issues
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check network connectivity

### Type Errors
- Run `npm run build` to check for TypeScript errors
- Ensure `database.types.ts` is up to date
- Check imports are correct

### Missing Data
- Check RLS policies allow access
- Verify user is authenticated
- Ensure employee record exists for user

## 📚 Resources

- **Database Schema**: See `DATABASE_SCHEMA.md`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/dbhyauxwbuzwdwxrphpm
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🆘 Need Help?

Common tasks you can ask for:
- "Create a new timesheet entry form"
- "Add email notifications for timesheet approvals"
- "Build the HR admin dashboard"
- "Generate PDF pay stubs"
- "Add employee onboarding wizard"
- "Create payroll run interface"

## 📊 Database Statistics

- **Tables**: 18
- **Views**: 5
- **Functions**: 10+
- **RLS Policies**: 30+
- **Sample Records**: 15+

---

**🎉 Your Unipay development environment is ready! Start coding!**



