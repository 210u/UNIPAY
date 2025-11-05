# 🔧 Fix Environment Variables Error

## The Problem
Your app is missing the Supabase environment variables needed to connect to your database.

## ✅ Quick Fix (2 minutes)

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (unipay or whichever project you created)
3. Click on the **Settings** icon (gear) in the left sidebar
4. Click on **API**
5. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

### Step 2: Create `.env.local` File

In your project root (`C:\Users\HP\Desktop\unipay`), create a file called `.env.local` with this content:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace** the values with your actual credentials from Step 1.

### Step 3: Restart Your Dev Server

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

## 🎯 Alternative: Use PowerShell Command

Run this in PowerShell (in your project directory):

```powershell
@"
NEXT_PUBLIC_SUPABASE_URL=your_actual_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here
"@ | Out-File -FilePath .env.local -Encoding utf8
```

Then edit `.env.local` and replace the placeholder values.

## 📝 Example `.env.local` File

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzM1NzYwMCwiZXhwIjoxOTM4OTMzNjAwfQ.abcdefg1234567890
```

## ✅ Verify It Works

After creating the file and restarting:

1. The error should be gone
2. You should see: `✓ Ready in X seconds`
3. Open http://localhost:3000
4. You should see your app!

## 🔒 Security Note

- `.env.local` is already in your `.gitignore` (just added)
- Never commit this file to Git
- Never share your keys publicly

---

**After fixing this, your app will be fully functional!** 🚀



