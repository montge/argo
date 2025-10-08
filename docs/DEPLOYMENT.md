# Argo Deployment Guide

**Version:** 5.0
**Last Updated:** 2025-10-07

## Overview

This document explains how Argo v5.0 is deployed and installed. **Modern Office Add-ins are fundamentally different from traditional COM/VSTO plugins.**

---

## Important: Web-Based vs Compiled Add-ins

### Argo v5.0 (Office.js Add-in) - Web-Based ✅

**What it is:**
- A web application (HTML/CSS/JavaScript/TypeScript)
- Hosted on a web server (or CDN)
- Excel loads it like a website inside the app

**What it is NOT:**
- ❌ Not a compiled .dll or .xll file
- ❌ Not a native executable
- ❌ Not installed on the file system (except manifest)
- ❌ Does NOT require code signing for basic use

**How it works:**
```
User's Excel Desktop
    │
    ├──> Reads manifest.xml (tells Excel where the add-in lives)
    │    - Location: C:\Users\<user>\AppData\Local\Microsoft\Office\16.0\Wef\
    │    - Contains: <SourceLocation> pointing to web URL
    │
    └──> Loads web app from URL
         - Dev: https://localhost:3000
         - Prod: https://cdn.example.com/argo/
         - Runs in embedded browser (EdgeHTML/WebView2)
```

**Advantages:**
- ✅ Cross-platform (Windows, Mac, Web)
- ✅ No compilation needed (just bundle JavaScript)
- ✅ Easy updates (change files on server)
- ✅ No installation pain (just sideload manifest)
- ✅ Develop on Linux, deploy anywhere
- ✅ No code signing required for development/testing

### Original Argo (COM/VSTO) - Compiled Plugin ❌

**What it was:**
- Compiled .NET assembly (.dll)
- Excel-DNA wrapper (.xll file)
- Installed on Windows file system
- Registered with Excel via COM

**Requirements:**
- ✅ Code signing certificate required (for distribution)
- ✅ Windows-only
- ✅ Installer package (.msi or .exe)
- ✅ Admin rights often needed
- ✅ Antivirus/security warnings

**Why we're NOT using this approach:**
- Limited to Windows
- Requires Visual Studio and .NET SDK
- Code signing costs $300-500/year
- Installation friction
- Can't develop on Linux

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────┐
│  Developer Machine (Linux/Mac/Windows)              │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Argo Source Code                          │    │
│  │  ├── src/ (TypeScript/React)               │    │
│  │  ├── manifest.xml                          │    │
│  │  └── vite.config.ts                        │    │
│  └────────────────────────────────────────────┘    │
│                   │                                  │
│                   v                                  │
│  ┌────────────────────────────────────────────┐    │
│  │  npm run dev                               │    │
│  │  - Compiles TypeScript → JavaScript        │    │
│  │  - Bundles with Vite                       │    │
│  │  - Serves on https://localhost:3000        │    │
│  └────────────────────────────────────────────┘    │
│                   │                                  │
│                   v                                  │
│  ┌────────────────────────────────────────────┐    │
│  │  Sideload manifest.xml into Excel          │    │
│  │  - Points to https://localhost:3000        │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                    │
                    v
┌─────────────────────────────────────────────────────┐
│  Excel Desktop                                       │
│  - Loads add-in from https://localhost:3000         │
│  - Hot reload during development                    │
└─────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────┐
│  Build Process (CI/CD)                              │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  npm run build                             │    │
│  │  - Compiles TypeScript                     │    │
│  │  - Bundles and minifies JavaScript         │    │
│  │  - Optimizes assets                        │    │
│  │  - Outputs to dist/                        │    │
│  └────────────────────────────────────────────┘    │
│                   │                                  │
│                   v                                  │
│  ┌────────────────────────────────────────────┐    │
│  │  Deploy to CDN/Web Server                  │    │
│  │  - Upload dist/ to hosting                 │    │
│  │  - URL: https://cdn.example.com/argo/      │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                    │
                    v
┌─────────────────────────────────────────────────────┐
│  manifest.xml (distributed to users)                │
│  <SourceLocation>                                   │
│    https://cdn.example.com/argo/taskpane.html      │
│  </SourceLocation>                                  │
└─────────────────────────────────────────────────────┘
                    │
                    v
┌─────────────────────────────────────────────────────┐
│  User's Excel                                        │
│  - Reads manifest.xml                               │
│  - Loads add-in from CDN                            │
│  - No local installation needed                     │
└─────────────────────────────────────────────────────┘
```

---

## Deployment Methods

### 1. Sideloading (Development & Testing)

**What it is:** Manually loading the add-in for testing

**Steps (Windows):**
```bash
# 1. Build the add-in
npm run build

# 2. Start local dev server
npm run dev  # Serves on https://localhost:3000

# 3. Sideload manifest in Excel
# - Open Excel
# - Insert > Add-ins > Upload My Add-in
# - Select manifest.xml
# - Or copy manifest.xml to:
#   C:\Users\<user>\AppData\Local\Microsoft\Office\16.0\Wef\
```

**Steps (Mac):**
```bash
# Same as Windows, but copy manifest to:
# ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/
```

**Steps (Excel Online):**
```bash
# 1. Upload manifest via Office 365 Admin Center
# 2. Or use "Upload My Add-in" in Excel Online
```

**Advantages:**
- Quick testing
- No approval needed
- Works offline (Excel Desktop)

**Limitations:**
- Only visible to you
- Must manually update manifest URL for production

### 2. Microsoft AppSource (Public Distribution)

**What it is:** Microsoft's app store for Office Add-ins

**Requirements:**
- Microsoft Partner Center account (free)
- Manifest validation (automated)
- App certification review (~5 days)
- Privacy policy URL
- Support documentation

**Process:**
```
1. Create Partner Center account
   https://partner.microsoft.com/dashboard

2. Submit add-in
   - Upload manifest.xml
   - Provide metadata (name, description, screenshots)
   - Specify hosting URL
   - Submit privacy policy and terms

3. Certification review
   - Microsoft tests functionality
   - Security scan
   - Compliance check
   - Approval or feedback

4. Published
   - Users find in AppSource
   - One-click install
   - Automatic updates
```

**Advantages:**
- ✅ Widest reach (millions of Office users)
- ✅ Built-in discovery (users search AppSource)
- ✅ Trust and credibility (Microsoft certified)
- ✅ Automatic updates

**Code Signing:**
- **Manifest can be signed** (optional, but recommended)
- Use digital certificate to sign manifest.xml
- Provides additional trust indicator
- Not required for AppSource submission

### 3. Centralized Deployment (Enterprise)

**What it is:** IT admins deploy to entire organization

**Steps:**
```
1. Admin logs into Microsoft 365 Admin Center

2. Navigate to Integrated Apps

3. Upload custom app
   - Upload manifest.xml
   - Specify which users/groups get access

4. Deploy
   - Add-in appears automatically in users' Excel
   - No user action required
```

**Advantages:**
- Controlled rollout
- Organization-wide deployment
- No end-user installation
- Centralized management

### 4. Network Share (On-Premises)

**What it is:** Host manifest on internal network share

**Steps:**
```
1. Copy manifest.xml to network share
   \\server\share\argo\manifest.xml

2. Configure Excel trust center
   - File > Options > Trust Center > Trust Center Settings
   - Trusted Add-in Catalogs
   - Add network share URL

3. Users install from "MY ORGANIZATION" tab
```

**Advantages:**
- Works without internet
- Full IT control
- No external dependencies

---

## Manifest File Structure

### manifest.xml (Add-in Only Manifest)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
           xmlns:ov="http://schemas.microsoft.com/office/taskpaneappversionoverrides"
           xsi:type="TaskPaneApp">

  <!-- Basic Settings -->
  <Id>12345678-1234-1234-1234-123456789012</Id>
  <Version>2.0.0</Version>
  <ProviderName>Booz Allen Hamilton</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Argo" />
  <Description DefaultValue="Monte Carlo Simulation for Excel"/>
  <IconUrl DefaultValue="https://cdn.example.com/argo/assets/icon-32.png"/>
  <HighResolutionIconUrl DefaultValue="https://cdn.example.com/argo/assets/icon-64.png"/>
  <SupportUrl DefaultValue="https://github.com/boozallen/argo/issues" />
  <AppDomains>
    <AppDomain>https://cdn.example.com</AppDomain>
  </AppDomains>

  <!-- Host settings -->
  <Hosts>
    <Host Name="Workbook" />
  </Hosts>

  <!-- Default settings -->
  <DefaultSettings>
    <SourceLocation DefaultValue="https://cdn.example.com/argo/taskpane.html"/>
  </DefaultSettings>

  <!-- Permissions -->
  <Permissions>ReadWriteDocument</Permissions>

  <!-- Version overrides (ribbon, custom functions, etc.) -->
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/taskpaneappversionoverrides" xsi:type="VersionOverridesV1_0">
    <!-- Ribbon customization -->
    <Hosts>
      <Host xsi:type="Workbook">
        <DesktopFormFactor>
          <!-- Custom ribbon tab -->
          <ExtensionPoint xsi:type="PrimaryCommandSurface">
            <OfficeTab id="TabHome">
              <Group id="ArgoGroup">
                <Label resid="ArgoGroupLabel" />
                <Icon>
                  <bt:Image size="16" resid="Icon.16x16" />
                  <bt:Image size="32" resid="Icon.32x32" />
                  <bt:Image size="80" resid="Icon.80x80" />
                </Icon>
                <Control xsi:type="Button" id="TaskpaneButton">
                  <Label resid="TaskpaneButton.Label" />
                  <Supertip>
                    <Title resid="TaskpaneButton.Label" />
                    <Description resid="TaskpaneButton.Tooltip" />
                  </Supertip>
                  <Icon>
                    <bt:Image size="16" resid="Icon.16x16" />
                    <bt:Image size="32" resid="Icon.32x32" />
                    <bt:Image size="80" resid="Icon.80x80" />
                  </Icon>
                  <Action xsi:type="ShowTaskpane">
                    <TaskpaneId>ButtonId1</TaskpaneId>
                    <SourceLocation resid="Taskpane.Url" />
                  </Action>
                </Control>
              </Group>
            </OfficeTab>
          </ExtensionPoint>
        </DesktopFormFactor>
      </Host>
    </Hosts>

    <!-- Resources -->
    <Resources>
      <bt:Images>
        <bt:Image id="Icon.16x16" DefaultValue="https://cdn.example.com/argo/assets/icon-16.png"/>
        <bt:Image id="Icon.32x32" DefaultValue="https://cdn.example.com/argo/assets/icon-32.png"/>
        <bt:Image id="Icon.80x80" DefaultValue="https://cdn.example.com/argo/assets/icon-80.png"/>
      </bt:Images>
      <bt:Urls>
        <bt:Url id="Taskpane.Url" DefaultValue="https://cdn.example.com/argo/taskpane.html"/>
      </bt:Urls>
      <bt:ShortStrings>
        <bt:String id="ArgoGroupLabel" DefaultValue="Argo"/>
        <bt:String id="TaskpaneButton.Label" DefaultValue="Open Argo"/>
      </bt:ShortStrings>
      <bt:LongStrings>
        <bt:String id="TaskpaneButton.Tooltip" DefaultValue="Open the Argo simulation panel"/>
      </bt:LongStrings>
    </Resources>
  </VersionOverrides>
</OfficeApp>
```

**Key Points:**
- **SourceLocation:** URL where your web app is hosted
- **Id:** Unique GUID for your add-in
- **Version:** Semantic version (update for each release)
- **Permissions:** ReadWriteDocument (can read/write cells)
- **Icons:** Hosted online (PNG files)

---

## Hosting Options

### Option 1: GitHub Pages (Free)

```bash
# Build add-in
npm run build

# Deploy to GitHub Pages
npm run deploy  # Uses gh-pages package

# URL: https://yourusername.github.io/argo/
```

**manifest.xml:**
```xml
<SourceLocation DefaultValue="https://yourusername.github.io/argo/taskpane.html"/>
```

**Advantages:**
- Free hosting
- Automatic HTTPS
- Git-based deployment

**Limitations:**
- Public only (no private repos on free plan)
- Limited to static sites

### Option 2: Azure Static Web Apps (Free tier available)

```bash
# Deploy via GitHub Actions
# Automatically deploys on git push

# URL: https://argo-12345.azurestaticapps.net/
```

**Advantages:**
- Free tier (100 GB bandwidth/month)
- Custom domains
- Automatic CI/CD
- Microsoft integration

### Option 3: AWS S3 + CloudFront (Low cost)

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://argo-add-in/ --delete

# Serve via CloudFront
# URL: https://d1234.cloudfront.net/
```

**Advantages:**
- Scalable
- Global CDN
- Low cost (~$1-5/month)

### Option 4: Self-Hosted (On-Premises)

```bash
# Build
npm run build

# Copy to web server
scp -r dist/* user@server:/var/www/argo/

# Serve via Nginx/Apache
# URL: https://intranet.company.com/argo/
```

**Advantages:**
- Full control
- No external dependencies
- Works without internet (intranet)

---

## Updates and Versioning

### Updating Your Add-in

**Two types of updates:**

1. **Code Updates (No manifest change)**
   - Change files on server
   - Users get updates automatically next time they load Excel
   - No action required from users

2. **Manifest Updates (New version)**
   - Increment `<Version>` in manifest.xml
   - Re-distribute manifest (or update in AppSource)
   - Users must re-install or admin must update

**Example Update Flow:**
```bash
# 1. Fix bug or add feature
vim src/engine/SimulationEngine.ts

# 2. Test locally
npm run dev

# 3. Build for production
npm run build

# 4. Deploy to hosting
npm run deploy
# Or: git push (if using CI/CD)

# 5. Users get update automatically
# - Next time they open Excel
# - Add-in loads updated code from server
```

**Manifest version bumps needed when:**
- Changing permissions
- Adding new ribbon buttons
- Adding new custom functions
- Changing hosting URL

---

## Security Considerations

### HTTPS Required

**All add-ins MUST use HTTPS:**
- Office.js will not load HTTP URLs (except localhost in dev)
- Get free SSL certificates from Let's Encrypt
- GitHub Pages / Azure / CloudFront provide HTTPS automatically

### Content Security Policy

```html
<!-- In taskpane.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://appsforoffice.microsoft.com; style-src 'self' 'unsafe-inline';">
```

### CORS Configuration

```typescript
// Server must allow Excel's origin
res.setHeader('Access-Control-Allow-Origin', '*');
// Or specific domains:
// res.setHeader('Access-Control-Allow-Origin', 'https://excel.office.com');
```

### Optional: Manifest Signing

**When to sign manifest:**
- Submitting to AppSource (recommended)
- Enterprise deployment (recommended)
- Building trust with users

**How to sign:**
```bash
# Get code signing certificate
# - Purchase from CA (DigiCert, Sectigo, etc.)
# - Or use self-signed for testing

# Sign manifest.xml
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com manifest.xml

# Verify signature
signtool verify /pa manifest.xml
```

**Cost:** Code signing certificates cost $200-500/year

**Note:** Unlike COM/VSTO add-ins, **signing is optional** for Office.js add-ins. The web app itself is not signed, only the manifest can be.

---

## Comparison: Deployment Methods

| Method | Reach | Setup Complexity | Updates | Cost |
|--------|-------|------------------|---------|------|
| **Sideloading** | Individual users | Easy | Manual | Free |
| **AppSource** | Public (millions) | Medium | Automatic | Free |
| **Centralized (M365)** | Organization | Easy (for admin) | Automatic | Free |
| **Network Share** | Organization | Medium | Manual | Free |

---

## Troubleshooting

### Add-in won't load

**Check:**
1. Is URL accessible? (Open in browser)
2. Is it HTTPS? (or localhost in dev)
3. Is manifest.xml valid? (Use validator)
4. Are there JavaScript errors? (F12 dev tools in Excel)

### Updates not appearing

**Solution:**
1. Clear Office cache:
   - Windows: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
   - Mac: `~/Library/Containers/com.microsoft.Excel/Data/Library/Caches/`
2. Restart Excel
3. Force refresh (Ctrl+F5 in task pane)

### CORS errors

**Solution:**
- Configure server to allow Office origins
- Check browser console (F12) for specific error

---

## CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

      # Or deploy to Azure
      # - name: Deploy to Azure Static Web Apps
      #   uses: Azure/static-web-apps-deploy@v1
      #   with:
      #     azure_static_web_apps_api_token: ${{ secrets.AZURE_TOKEN }}
      #     repo_token: ${{ secrets.GITHUB_TOKEN }}
      #     action: "upload"
      #     app_location: "/dist"
```

---

## Summary: Key Differences

### Office.js Add-ins (Argo v5.0) ✅

- **Format:** Web app (HTML/JS/CSS)
- **Hosting:** Web server or CDN
- **Installation:** Copy manifest.xml
- **Code Signing:** Optional (manifest only)
- **Updates:** Automatic (change files on server)
- **Cross-Platform:** Yes (Windows/Mac/Web)
- **Development:** Any OS (Linux, Mac, Windows)
- **Cost:** Free (hosting only)

### COM/VSTO Add-ins (Original Argo) ❌

- **Format:** Compiled .dll/.xll
- **Hosting:** Local file system
- **Installation:** .msi installer
- **Code Signing:** Required for distribution
- **Updates:** Reinstall
- **Cross-Platform:** No (Windows only)
- **Development:** Windows + Visual Studio
- **Cost:** Code signing cert ($300-500/year)

---

## Next Steps

1. ✅ Understand deployment model (this document)
2. ⏳ Create manifest.xml template
3. ⏳ Set up local development environment
4. ⏳ Choose hosting provider
5. ⏳ Implement add-in code
6. ⏳ Test with sideloading
7. ⏳ Deploy to production hosting
8. ⏳ Submit to AppSource (optional)

---

## Resources

- **Manifest Reference:** https://learn.microsoft.com/office/dev/add-ins/develop/add-in-manifests
- **AppSource Submission:** https://learn.microsoft.com/office/dev/store/submit-to-appsource-via-partner-center
- **Sideloading Guide:** https://learn.microsoft.com/office/dev/add-ins/testing/test-debug-office-add-ins
- **Centralized Deployment:** https://learn.microsoft.com/microsoft-365/admin/manage/centralized-deployment-of-add-ins
