# 🌐 Network Connection Fix

## ❌ Problem Identified:
```
net::ERR_CONNECTION_RESET
Failed to fetch
```

Your browser cannot connect to Supabase servers. The code is working fine, but the network connection is being blocked or reset.

## 🔧 Solutions (Try These in Order):

### Solution 1: Disable VPN/Proxy
If you're using a VPN or proxy:
1. **Disconnect from VPN**
2. **Try again**

### Solution 2: Check Windows Firewall
1. Press **Windows + I** (Settings)
2. Go to: **Privacy & Security** → **Windows Security** → **Firewall & network protection**
3. Click: **Allow an app through firewall**
4. Find **Node.js** or **npm** in the list
5. Make sure both **Private** and **Public** are checked
6. Click **OK**

### Solution 3: Flush DNS Cache
Run these commands:

```powershell
# Flush DNS
ipconfig /flushdns

# Reset Winsock
netsh winsock reset

# Restart
```

Then restart your computer and try again.

### Solution 4: Try a Different Browser
- If using Chrome, try **Edge** or **Firefox**
- Sometimes browser extensions block requests

### Solution 5: Check Antivirus
Your antivirus might be blocking the connection:
1. Open your antivirus software (Windows Defender, Norton, etc.)
2. Look for **blocked connections** or **firewall rules**
3. **Temporarily disable** it and test
4. If it works, add an exception for `supabase.co`

### Solution 6: Use Mobile Hotspot (Quick Test)
To verify it's your network:
1. Enable mobile hotspot on your phone
2. Connect your PC to it
3. Try signing in again
4. If it works → it's your network/firewall blocking it

### Solution 7: Check Internet Connection
```powershell
# Test if you can reach Supabase
curl https://dbhyauxwbuzwdwxrphpm.supabase.co
```

### Solution 8: Add to Hosts File (Last Resort)
Run PowerShell as Administrator:

```powershell
# Add Supabase to hosts file
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "104.18.38.10 dbhyauxwbuzwdwxrphpm.supabase.co"
```

Then restart browser.

---

## Quick Test:
Run this to test if Supabase is accessible:

```powershell
Invoke-WebRequest -Uri "https://dbhyauxwbuzwdwxrphpm.supabase.co" -Method GET
```

If this fails with an error, your network is blocking Supabase.

---

## Most Common Causes:
1. ✅ **VPN/Proxy** - Disconnect and try
2. ✅ **Windows Firewall** - Allow Node.js through
3. ✅ **Antivirus** - Add Supabase as exception
4. ✅ **Corporate Network** - If on work/school network, they might block it
5. ✅ **ISP Blocking** - Rare, but possible

---

## After Fixing:
1. Close all browser tabs
2. Restart browser
3. Run: `npm run dev`
4. Try signing in again
5. The signin should work!

---

**Most likely cause: Windows Firewall or Antivirus blocking the connection.**

