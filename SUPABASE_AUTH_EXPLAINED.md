# 🔐 How Supabase Auth Works in Unipay

## ✅ **YES, You Have Both Tables!**

### **1. Supabase Auth Table** (`auth.users`)
- **Managed by Supabase** automatically
- Stores authentication data:
  - Email
  - Encrypted password
  - Auth metadata
  - Email confirmation status
  - Last sign in time
- **You don't directly access** this table
- Created when `supabase.auth.signUp()` is called

### **2. Your Custom Profile Table** (`user_profiles`)
- **Your table** in the `public` schema
- Stores application data:
  - first_name, last_name
  - **phone_number** ✅ (already exists!)
  - **username** (stored in auth metadata)
  - address, city, state, etc.
  - role (employee, hr_staff, admin, etc.)
  - university_id
- **Linked to auth.users** via foreign key:
  ```sql
  user_profiles.id -> auth.users.id
  ```

---

## 🔄 **How The Signup Process Works**

### **Step 1: User Fills Form**
User enters:
- First Name
- Last Name
- **Username** ✨ NEW!
- Email
- **Phone Number** ✨ NEW!
- Password
- Confirm Password

### **Step 2: Create Auth User**
```typescript
const { data: authData, error } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
    data: {
      first_name: data.firstName,
      last_name: data.lastName,
      username: data.username,        // ✨ NEW
      phone_number: data.phoneNumber, // ✨ NEW
    },
  },
});
```

**What happens:**
1. Supabase creates user in `auth.users` table
2. Password is encrypted automatically
3. User ID (UUID) is generated
4. **Email confirmation email is sent** (if enabled)
5. Metadata is stored in auth.users.raw_user_meta_data

### **Step 3: Create User Profile**
```typescript
await supabase.from('user_profiles').insert({
  id: authData.user.id,              // Same ID as auth.users
  email: data.email,
  first_name: data.firstName,
  last_name: data.lastName,
  phone_number: data.phoneNumber,    // ✨ Stored in your table
  role: 'employee',                  // Default role
});
```

**What happens:**
1. Creates record in YOUR table
2. Links to auth.users using the same ID
3. Stores additional data Supabase Auth doesn't handle
4. Role determines access permissions

### **Step 4: Email Confirmation** ✨
If email confirmation is enabled:
1. User sees **Welcome Message** 🎉
2. Email is sent to user's inbox
3. User clicks link in email
4. Account is confirmed
5. User can sign in

If email confirmation is disabled:
1. User is logged in immediately
2. Redirected to dashboard
3. No email needed

### **Step 5: Welcome Message** ✨ NEW!
Beautiful animated welcome screen shows:
- ✅ Green checkmark icon
- "Welcome to Unipay! 🎉"
- User's email
- Instructions to check email
- "Go to Sign In" button

---

## 📊 **Data Flow Diagram**

```
User fills form
     ↓
SignUpForm.tsx
     ↓
supabase.auth.signUp()
     ↓
┌────────────────────────┐
│   auth.users (Supabase)│
│  - id                  │
│  - email               │
│  - encrypted_password  │
│  - metadata {username} │
│  - email_confirmed_at  │
└────────────────────────┘
     ↓ (same ID)
┌────────────────────────┐
│ user_profiles (Your DB)│
│  - id (FK)             │
│  - first_name          │
│  - last_name           │
│  - phone_number ✨     │
│  - role                │
│  - university_id       │
└────────────────────────┘
     ↓
Email Confirmation Sent ✨
     ↓
Welcome Message Shown 🎉
```

---

## 🆕 **What's New in Enhanced Signup**

### **New Fields:**
1. **Username** - Unique identifier (stored in auth metadata)
2. **Phone Number** - Stored in `user_profiles.phone_number`

### **New Features:**
1. **Email Confirmation** - Supabase sends verification email
2. **Welcome Message** - Beautiful animated screen
3. **Better Validation** - Username format checking
4. **Phone Validation** - Minimum 10 digits

---

## 🔒 **How Authentication Works**

### **When User Signs Up:**
```typescript
// Creates in auth.users
await supabase.auth.signUp({ email, password })

// Creates in user_profiles
await supabase.from('user_profiles').insert({ ... })
```

### **When User Signs In:**
```typescript
// Checks auth.users
await supabase.auth.signInWithPassword({ email, password })

// Get profile from user_profiles
await supabase.from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### **Row Level Security (RLS):**
Your `user_profiles` table has RLS enabled:
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);
```

---

## 📧 **Email Confirmation Setup**

### **Option 1: Development (No Confirmation)**
Default for local development:
- Users sign up → immediately logged in
- No email sent
- Quick for testing

### **Option 2: Production (With Confirmation)**
For production:
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Enable "Email Confirmations"
4. Users must verify email before accessing

**What happens:**
- User signs up
- Welcome message shows ✨
- Email sent with confirmation link
- User clicks link
- Email confirmed
- User can sign in

---

## 🎯 **Complete User Journey**

### **New User:**
1. Visit `/signup`
2. Fill form (7 fields now!)
3. Click "Create account"
4. See welcome message 🎉
5. Check email
6. Click confirmation link
7. Go to `/signin`
8. Sign in
9. Redirected to `/dashboard`

### **Returning User:**
1. Visit `/signin`
2. Enter email & password
3. Click "Sign in"
4. Redirected to `/dashboard`

---

## 💾 **Where Data is Stored**

### **In Supabase Auth** (`auth.users`):
- ✅ Email
- ✅ Password (encrypted)
- ✅ Username (in metadata)
- ✅ Email confirmed status
- ✅ Last sign in

### **In Your Database** (`user_profiles`):
- ✅ First name
- ✅ Last name
- ✅ Phone number ✨
- ✅ Address
- ✅ Role
- ✅ University ID
- ✅ Profile image

### **Why Two Tables?**
1. **Separation of Concerns**:
   - Supabase manages authentication
   - You manage application data

2. **Security**:
   - Auth data is highly secure
   - You control profile data

3. **Flexibility**:
   - Easy to add custom fields
   - Don't mess with auth internals

---

## 🔑 **Accessing User Data**

### **Get Current User:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
// Returns: { id, email, user_metadata: {...} }
```

### **Get User Profile:**
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*, university:universities(*)')
  .eq('id', user.id)
  .single();

// Returns: {
//   first_name: "John",
//   last_name: "Doe",
//   phone_number: "1234567890", ✨
//   role: "employee",
//   university: { name: "..." }
// }
```

---

## 🎨 **New Signup Form Features**

### **Fields (7 total):**
1. ✅ First Name (with User icon)
2. ✅ Last Name (with User icon)
3. ✨ **Username** (with AtSign icon) - NEW!
4. ✅ Email (with Mail icon)
5. ✨ **Phone Number** (with Phone icon) - NEW!
6. ✅ Password (with Lock icon)
7. ✅ Confirm Password (with Lock icon)

### **Validation:**
- ✅ All fields required
- ✅ Username: min 3 chars, alphanumeric + underscore only
- ✅ Email: valid format
- ✅ Phone: min 10 digits
- ✅ Password: min 6 characters
- ✅ Passwords must match

### **UI Features:**
- ✅ Lucide icons for each field
- ✅ Real-time validation
- ✅ Error messages
- ✅ Loading states
- ✅ **Welcome message animation** ✨
- ✅ Matches signin design

---

## ✅ **Summary**

**You Now Have:**
1. ✅ Two tables: `auth.users` (Supabase) + `user_profiles` (yours)
2. ✅ Complete signup with **username** and **phone**
3. ✅ **Email confirmation** system
4. ✅ Beautiful **welcome message** 🎉
5. ✅ Data stored securely
6. ✅ Linked by user ID
7. ✅ Row Level Security
8. ✅ Professional UI

**How It's Related to Supabase Auth:**
- Supabase Auth handles authentication
- Your app handles authorization (roles, permissions)
- Both work together seamlessly
- User ID links everything

**Try it now at:** http://localhost:3000/signup 🚀



