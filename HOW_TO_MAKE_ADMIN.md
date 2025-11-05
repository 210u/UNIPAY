# 🔐 How to Assign Admin Role

## Three Ways to Make a User an Admin:

### Method 1: Using SQL Function (Easiest)

After running the migration, you can use this SQL function in Supabase SQL Editor:

```sql
-- Make a user an admin
SELECT * FROM assign_admin_role('user@example.com');
```

Or change to any role:
```sql
-- Change to HR Staff
SELECT * FROM change_user_role('user@example.com', 'hr_staff');

-- Change to Payroll Officer
SELECT * FROM change_user_role('user@example.com', 'payroll_officer');

-- Change to University Admin
SELECT * FROM change_user_role('user@example.com', 'university_admin');

-- Change to System Admin (super admin)
SELECT * FROM change_user_role('user@example.com', 'system_admin');
```

### Method 2: Direct SQL Update

Go to Supabase SQL Editor and run:

```sql
-- Update role directly
UPDATE user_profiles 
SET role = 'university_admin'
WHERE email = 'user@example.com';
```

### Method 3: Using Supabase Table Editor

1. Go to Supabase Dashboard
2. Navigate to: Table Editor → user_profiles
3. Find the user by email
4. Click on the 'role' field
5. Change from 'employee' to 'university_admin'
6. Click save

---

## Available Roles:

1. **employee** - Default role for all users
2. **department_head** - Can manage their department
3. **hr_staff** - Can manage employees
4. **payroll_officer** - Can process payroll
5. **university_admin** - University administrator
6. **system_admin** - Super admin (full access)

---

## How to Check Current Roles:

```sql
-- See all users and their roles
SELECT 
    email,
    first_name,
    last_name,
    role,
    phone_number,
    created_at
FROM user_profiles
ORDER BY created_at DESC;
```

---

## Admin vs User Dashboard:

**Employee Dashboard** (`/dashboard`):
- View own timesheets
- Submit time entries
- View payment history
- View own profile

**Admin Dashboard** (`/admin/*`):
- Employee management (`/admin/employees`)
- Allowance management (`/admin/allowances`)
- Deduction management (`/admin/deductions`)
- Payroll processing (`/admin/payroll`)
- Reports (`/admin/reports`)

The system automatically shows the appropriate dashboard based on the user's role in `user_profiles.role`.

