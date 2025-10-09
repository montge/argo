# Sprint 12: Windows Setup Guide for Screenshots
## Running Argo Excel Add-in from WSL on Windows

### Overview
You're already running WSL on Windows, so you have the BEST setup possible:
- ✅ Development in WSL (Linux) - what you've been doing
- ✅ Excel on Windows host - for testing and screenshots
- ✅ Network bridge between them - WSL can serve to Windows!

**Path Notation Used in This Guide:**
- `{USER}` = Your WSL username (e.g., `john`, `admin`, etc.)
- `{REPO_PATH}` = Path to your argo repository (e.g., `Development/argo`, `projects/argo`, etc.)
- `{DISTRO}` = Your WSL distribution name (typically `Ubuntu`, `Debian`, etc.)

---

## Architecture: WSL → Windows Excel

```
┌─────────────────────────────────────────────────────────────┐
│ WINDOWS HOST                                                │
│                                                             │
│  ┌────────────────────┐         ┌──────────────────────┐  │
│  │  Excel 365         │  HTTP   │  Browser             │  │
│  │  Desktop           │◄────────┤  (for dev testing)   │  │
│  │                    │         │                       │  │
│  │  - Load add-in     │         │  https://localhost:  │  │
│  │  - Test features   │         │  3000                 │  │
│  │  - Take screenshots│         └──────────────────────┘  │
│  └────────────────────┘                                    │
│         ▲                                                   │
│         │ HTTPS (localhost:3000)                           │
│         │                                                   │
│  ┌──────┴─────────────────────────────────────────────┐   │
│  │  WSL2 (Ubuntu/Debian)                              │   │
│  │                                                     │   │
│  │  /home/{USER}/{REPO_PATH}/packages/argo-excel/    │   │
│  │                                                     │   │
│  │  $ npm run dev                                     │   │
│  │  → Vite dev server on https://localhost:3000      │   │
│  │  → Serves manifest.xml and React app              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Setup

### 1. Install Prerequisites on Windows (if not already)

**What you need on Windows host:**
- ✅ Excel 365 Desktop (probably already installed)
- ✅ Modern browser (Edge, Chrome - already installed)

That's it! Everything else runs in WSL.

---

### 2. Start Dev Server from WSL

**In your existing WSL terminal:**

```bash
# Navigate to argo-excel package
cd /home/{USER}/{REPO_PATH}/packages/argo-excel

# Start the dev server (HTTPS on localhost:3000)
npm run dev
```

**What happens:**
- Vite starts serving on `https://localhost:3000`
- WSL2 automatically bridges this to Windows host
- Windows can access `https://localhost:3000` directly!

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   https://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### 3. Access from Windows Browser (Test First)

**On Windows (not WSL):**
1. Open Edge or Chrome
2. Navigate to: `https://localhost:3000`
3. You'll see a certificate warning (self-signed cert)
4. Click "Advanced" → "Proceed to localhost (unsafe)"
5. You should see the Argo task pane UI!

**If you see the UI:** ✅ Server is accessible from Windows!

---

### 4. Sideload Add-in in Excel 365

**Step 4.1: Trust the localhost certificate**

Before Excel can load the add-in, Windows needs to trust the dev server certificate:

1. Open Edge or Chrome on Windows
2. Navigate to: `https://localhost:3000`
3. Accept the certificate warning: "Advanced" → "Proceed to localhost (unsafe)"
4. You should see the Argo UI
5. Close the browser (certificate is now trusted)

---

**Step 4.2: Configure Trusted Add-in Catalog**

Excel requires adding the manifest location as a trusted catalog:

1. **Open Excel 365 on Windows**

2. **Navigate to Trust Center:**
   - Click **File** → **Options**
   - Select **Trust Center** (left sidebar)
   - Click **Trust Center Settings** button
   - Select **Trusted Add-in Catalogs** (left sidebar)

3. **Add the WSL folder as trusted catalog:**

   In the "Catalog Url" field, enter:
   ```
   \\wsl$\{DISTRO}\home\{USER}\{REPO_PATH}\packages\argo-excel
   ```

   **Example:**
   ```
   \\wsl$\Ubuntu\home\john\Development\argo\packages\argo-excel
   ```

   **Note:** Replace `{DISTRO}`, `{USER}`, and `{REPO_PATH}` with your actual values

   - Click **Add catalog**
   - Check the **Show in Menu** checkbox for the newly-added catalog
   - Click **OK** to close Trust Center Settings
   - Click **OK** to close Excel Options

4. **Close and reopen Excel** (required for catalog to take effect)

---

**Step 4.3: Load the Add-in**

1. **In Excel, navigate to Add-ins:**
   - Click **Home** tab on ribbon
   - Click **Add-ins** button
   - Select **Advanced** (or "More Add-ins")

2. **Select the add-in:**
   - Choose **SHARED FOLDER** at the top
   - You should see "Argo - Monte Carlo Simulation" listed
   - Select it and click **Add**

3. **The add-in should load!**
   - Task pane appears on the right side of Excel
   - Header shows "Argo Monte Carlo Simulation v5.0"
   - You can interact with the UI
   - If add-in button doesn't appear automatically, click Home > Add-ins and select Argo from the flyout

---

### 6. Taking Screenshots

**Once the add-in is loaded in Excel:**

**Manual Screenshots (Easiest):**
1. Press `Windows Key + Shift + S` (Snipping Tool)
2. Capture the exact area you need
3. Saves to clipboard → Paste into Paint/etc.
4. Save to `assets/screenshots/` via WSL

**Automated Screenshots (Optional):**
- Use PowerShell + COM automation
- Or Playwright with Excel COM objects
- Save directly to `/mnt/c/Users/.../screenshots/`
- Then move to WSL git repo

---

## Workflow Summary

### Development (WSL - Linux):
```bash
# All development in WSL as usual
cd /home/{USER}/{REPO_PATH}/packages/argo-excel
npm run dev

# Keep server running
# Server is accessible at https://localhost:3000 from Windows
```

### Testing (Windows Host):
```powershell
# Open Excel 365
# Sideload add-in from \\wsl$\{DISTRO}\home\{USER}\{REPO_PATH}\...
# Test features
# Take screenshots
```

### Screenshot Storage (Back to WSL):
```bash
# Copy screenshots from Windows to WSL
cp /mnt/c/Users/{WINDOWS_USER}/Pictures/Screenshots/* \
   /home/{USER}/{REPO_PATH}/assets/screenshots/

# Or use \\wsl$\{DISTRO}\... path from Windows to save directly
```

---

## Key Points for Your Setup

✅ **No need to clone repo on Windows** - WSL access works via `\\wsl$\`

✅ **Dev server runs in WSL** - npm run dev from Linux terminal

✅ **Excel on Windows accesses localhost:3000** - WSL2 network bridge

✅ **Manifest file accessible** - Via `\\wsl$\{DISTRO}\home\{USER}\...`

✅ **Screenshots saved anywhere** - Can be moved to WSL easily

✅ **Git operations stay in WSL** - Your normal workflow

---

## Troubleshooting

### "Cannot connect to localhost:3000"

**Solution:** WSL2 firewall issue
```bash
# In WSL - allow port 3000
# Usually WSL2 automatically bridges, but if not:
# Check Windows Firewall → Allow app through firewall
```

### "Certificate not trusted"

**Solution:** Accept the self-signed cert in browser first
1. Visit https://localhost:3000 in Edge/Chrome
2. Click "Advanced" → "Proceed to localhost"
3. Then Excel can load it

### "Cannot find manifest file"

**Solution:** Use the WSL network path
- From Windows File Explorer: `\\wsl$\{DISTRO}\home\{USER}\{REPO_PATH}\...`
- Or copy manifest.xml to Windows temp folder

---

## What You DON'T Need

❌ Node.js on Windows - runs in WSL
❌ Git on Windows - use WSL git
❌ Clone repo on Windows - access via `\\wsl$\`
❌ Separate Windows dev environment - WSL is enough
❌ Complex networking setup - WSL2 handles it

---

## TL;DR Quick Start

```bash
# 1. In WSL terminal:
cd /home/{USER}/{REPO_PATH}/packages/argo-excel
npm run dev

# 2. In Windows:
#    - Open browser → https://localhost:3000 (accept cert)
#    - Open Excel 365
#    - File → Options → Trust Center → Trust Center Settings
#    - Trusted Add-in Catalogs → Add: \\wsl$\{DISTRO}\home\{USER}\{REPO_PATH}\packages\argo-excel
#    - Check "Show in Menu" → OK → Restart Excel
#    - Home → Add-ins → Advanced → SHARED FOLDER → Select "Argo - Monte Carlo Simulation" → Add

# 3. Take screenshots with Windows Snipping Tool

# 4. Back in WSL:
#    - Copy screenshots to assets/screenshots/
#    - Commit and push as normal
```

---

You're actually in the PERFECT setup - WSL + Windows is ideal for Office add-in development! 🎉
