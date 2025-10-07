# Argo in Government Cloud Environments

**Version:** 2.0
**Last Updated:** 2025-10-07

## Overview

This document addresses deployment of Argo in **U.S. Government Cloud environments**, particularly:
- **GCC (Government Community Cloud)**
- **GCC High**
- **DoD (Department of Defense)**

---

## Government Cloud Considerations

### Office 365 Government Clouds

Microsoft offers three government cloud tiers:

| Environment | Security Level | Typical Users | Add-in Support |
|-------------|---------------|---------------|----------------|
| **Commercial** | Standard | Public/private sector | ✅ Full support |
| **GCC** | Moderate (CJIS, IRS 1075, etc.) | State/local government | ✅ Supported |
| **GCC High** | High (ITAR, DFARS, etc.) | Federal agencies, contractors | ⚠️ Limited |
| **DoD** | Highest (IL4/IL5) | Department of Defense | ⚠️ Very Limited |

---

## Key Issues for Argo in Government Clouds

### 1. External URLs Restricted

**Problem:**
- GCC High and DoD environments restrict connections to external URLs
- Office Add-ins load from web URLs (our architecture)
- **CDN hosting won't work** if it's on public internet

**Impact on Argo:**
- ❌ Cannot use GitHub Pages, Azure Static Web Apps (public), AWS S3 (public)
- ❌ Cannot load add-in from commercial cloud CDN
- ⚠️ Must use government cloud infrastructure or on-premises hosting

### 2. AppSource Distribution Not Available

**Problem:**
- GCC High and DoD do not have access to Microsoft AppSource
- Public add-ins from AppSource won't install

**Impact on Argo:**
- ❌ Cannot distribute via AppSource
- ✅ Must use centralized deployment or network share
- ✅ Sideloading may be restricted by policy

### 3. Hosting Requirements

**Solution for GCC High/DoD:**

**Option A: Government Cloud Hosting**
```
Azure Government Cloud
├── Region: US Gov Virginia, US Gov Texas, US Gov Arizona
├── Compliance: FedRAMP High, DoD IL4, DoD IL5
├── URL: https://app.usgovcloudapi.net/argo/
└── Isolation: Government-only network
```

**Option B: On-Premises Hosting**
```
Organization's Internal Network
├── Web Server: Nginx/Apache/IIS
├── URL: https://intranet.agency.gov/argo/
├── Access: Internal only
└── No external dependencies
```

**Option C: Hybrid Approach**
```
CLI Tool (Linux)
├── Runs on local machine or server
├── No network dependencies
├── No Excel required
├── Full feature set
└── Export results to Excel files
```

---

## Recommended Architecture for Government

### For GCC (Moderate)

**✅ Standard Office.js Add-in works:**
- Host on Azure Government Cloud or on-premises
- Use centralized deployment (M365 Admin)
- Manifest points to gov cloud URL

```xml
<!-- manifest.xml for GCC -->
<SourceLocation DefaultValue="https://argo.azurewebsites.us/taskpane.html"/>
```

### For GCC High / DoD

**⚠️ Two-tier approach:**

#### Tier 1: CLI Tool (Primary for Government)

**Why:**
- ✅ No external URLs needed
- ✅ Runs entirely on local Linux/Windows machines
- ✅ Can be air-gapped
- ✅ No Office.js restrictions
- ✅ Full feature parity

**Architecture:**
```
Government User's Machine
├── argo-cli (standalone binary)
├── Input: JSON config file
├── Processing: Local computation
└── Output: JSON/CSV/Excel file

No network calls required
```

**Usage:**
```bash
# Create simulation config
vim simulation.json

# Run simulation (all local)
argo simulate --config simulation.json --output results.json

# Export to Excel format
argo export --input results.json --format xlsx --output results.xlsx

# User opens results.xlsx in Excel (no add-in needed)
```

#### Tier 2: On-Premises Office.js Add-in (If Permitted)

**Requirements:**
- Host on government network
- Internal URL only
- No external dependencies
- Approval from IT security

**Architecture:**
```
Government Network
├── Web Server (IIS/Nginx)
│   ├── URL: https://tools.agency.local/argo/
│   ├── Hosts: Add-in files
│   └── No internet access
│
├── File Share
│   ├── Path: \\server\apps\argo\manifest.xml
│   └── Users install from share
│
└── User's Excel
    ├── Loads from https://tools.agency.local/argo/
    └── All computation client-side (no external calls)
```

---

## Implementation Plan for Government Support

### Phase 1: CLI Tool (Priority)

**Target:** Government users who need air-gapped solution

**Features:**
- Standalone executables (Windows/Linux)
- No network dependencies
- JSON/YAML/CSV input/output
- Full Monte Carlo simulation
- All 35+ distributions
- All 50+ statistical functions
- Excel file export (.xlsx)

**Distribution:**
```bash
# Government users download from:
# - Approved software repository
# - Internal network share
# - Air-gapped USB transfer

# Install (no internet needed)
chmod +x argo-linux
sudo mv argo-linux /usr/local/bin/argo

# Use
argo simulate --config sim.json --output results.json
```

### Phase 2: On-Premises Add-in (If Allowed)

**Target:** Organizations that allow internal web apps

**Requirements:**
- IT approval for internal hosting
- Government cloud infrastructure
- Security review and approval

**Deployment:**
```
1. Deploy add-in to internal web server
2. Configure manifest.xml with internal URL
3. Distribute manifest via network share
4. Users install from "MY ORGANIZATION" tab
```

---

## Compliance Considerations

### FedRAMP Compliance

**For Office.js Add-in:**
- ✅ Host on Azure Government Cloud (FedRAMP High authorized)
- ✅ Use government-compliant CDN
- ✅ Audit logging enabled
- ✅ Data residency in US Gov regions

**For CLI Tool:**
- ✅ No cloud services needed
- ✅ Local processing only
- ✅ No data transmission
- ✅ Audit logs to local file

### ITAR Compliance (International Traffic in Arms Regulations)

**Concerns:**
- Source code
- Cryptographic functions (RNG for simulation)
- Distribution to foreign nationals

**Argo Approach:**
- ✅ Open source (Apache 2.0 license)
- ✅ Public GitHub repository
- ✅ Cryptographic RNG is standard (not ITAR-controlled)
- ✅ Statistical software generally exempt

**Note:** Always consult legal counsel for ITAR applicability.

### DoD IL4/IL5 (Impact Levels)

**For IL4/IL5:**
- Must use Azure Government Secret or Top Secret regions
- Office.js add-ins may not be approved
- **CLI tool is best option**

---

## Network Isolation Strategies

### Air-Gapped Deployment

**For maximum security (classified environments):**

```
┌───────────────────────────────────────────────┐
│  Classified Network (Air-Gapped)              │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │  User Workstation                   │     │
│  │  ├── argo-cli (standalone binary)   │     │
│  │  ├── Excel (view results)           │     │
│  │  └── No network access              │     │
│  └─────────────────────────────────────┘     │
│                                               │
│  Transfer via:                                │
│  - Approved USB (malware scan)                │
│  - Secure file transfer                       │
│  - Burned CD/DVD                              │
└───────────────────────────────────────────────┘

External Network
  - NO CONNECTION -
```

**CLI Tool Advantages:**
- Entire application in single binary
- No dependencies to download
- No network calls during operation
- Results exportable to Excel files

---

## Security Features for Government

### Required for Government Deployment

1. **Audit Logging**
```typescript
// Log all simulation runs
logger.info({
  user: getCurrentUser(),
  timestamp: new Date(),
  action: 'simulation_run',
  iterations: 10000,
  duration_ms: 234
});
```

2. **No Data Exfiltration**
```typescript
// Ensure no network calls
// All computation local
// No telemetry, analytics, or external APIs
```

3. **Reproducible Results**
```typescript
// Seeded RNG for audit trail
const simulation = new SimulationEngine({
  seed: 42,  // Documented seed for reproducibility
  iterations: 10000
});
```

4. **Digital Signatures** (Optional)
```bash
# Sign CLI binaries
signtool sign /f certificate.pfx /p password /t timestamp argo-win.exe

# Sign manifest.xml
signtool sign /f certificate.pfx /p password /t timestamp manifest.xml
```

---

## Recommended Solution Matrix

| Environment | Recommended Solution | Why |
|-------------|---------------------|-----|
| **Commercial O365** | Office.js Add-in | Full features, easy deployment |
| **GCC** | Office.js Add-in | Supported, host on Azure Gov |
| **GCC High** | CLI Tool (primary) + On-Prem Add-in (optional) | Network restrictions |
| **DoD** | CLI Tool only | Maximum isolation required |
| **Air-Gapped** | CLI Tool only | No network at all |

---

## Development Approach

### Build Both Versions

**Office.js Add-in (Commercial/GCC):**
- Full UI/UX
- Task pane, dialogs, ribbons
- Interactive charts
- Real-time updates

**CLI Tool (GCC High/DoD):**
- Command-line interface
- Batch processing
- Scriptable
- Excel file export

**Shared Core:**
```
argo-core/ (shared library)
├── distributions/
├── engine/
├── stats/
└── utils/

argo-excel/ (Office.js UI)
└── Uses argo-core

argo-cli/ (Command-line)
└── Uses argo-core
```

**Benefit:** Develop once, deploy to all environments

---

## Deployment Checklist for Government

### GCC Deployment
- [ ] Host on Azure Government Cloud
- [ ] Use .usgovcloudapi.net URLs
- [ ] Centralized deployment via M365 Admin
- [ ] Test in GCC tenant
- [ ] Document compliance (FedRAMP, CJIS, etc.)

### GCC High Deployment
- [ ] Build standalone CLI tool
- [ ] Code sign binaries
- [ ] Create installation package
- [ ] Provide air-gap installation guide
- [ ] If using add-in: On-premises hosting only
- [ ] Security review and approval
- [ ] Compliance documentation (ITAR, DFARS, etc.)

### DoD Deployment
- [ ] CLI tool only (no add-in)
- [ ] Air-gapped deployment procedure
- [ ] Authority to Operate (ATO) package
- [ ] IL4/IL5 compliance documentation
- [ ] Security Control Assessment (SCA)

---

## FAQ

### Q: Can we use Argo in GCC High?
**A:** Yes, but use the **CLI tool** instead of the Office.js add-in. The CLI tool runs entirely locally with no network dependencies.

### Q: Does Argo send data to external servers?
**A:** No. Both the add-in and CLI tool perform all computations locally. No data is sent anywhere.

### Q: Can we host Argo on Azure Commercial for GCC High?
**A:** No. You must use Azure Government Cloud or on-premises hosting. Or better yet, use the CLI tool which requires no hosting.

### Q: Is Argo FedRAMP authorized?
**A:** Argo itself doesn't need FedRAMP authorization (it's software, not a service). If you host the Office.js add-in, host it on FedRAMP-authorized infrastructure (like Azure Government).

### Q: What about IL6 (NSA/CSS)?
**A:** For IL6, you'll need the CLI tool with specific security controls. The Office.js add-in is unlikely to be approved at this level. Consult your security team.

---

## Next Steps for Government Support

1. **Priority: Build CLI Tool**
   - Standalone binaries for Windows/Linux
   - Full feature parity with add-in
   - Excel file export
   - Air-gap friendly

2. **Document Compliance**
   - Create FedRAMP package
   - ITAR compliance statement
   - DoD compliance documentation

3. **Test in Government Clouds**
   - Get GCC tenant for testing
   - Test centralized deployment
   - Validate on-premises hosting

4. **Create Government-Specific Docs**
   - Installation guide for air-gapped environments
   - Security configuration guide
   - Compliance documentation

---

## Resources

- **Azure Government:** https://azure.microsoft.com/global-infrastructure/government/
- **Office 365 GCC:** https://learn.microsoft.com/office365/servicedescriptions/office-365-platform-service-description/office-365-us-government/gcc
- **Office 365 GCC High:** https://learn.microsoft.com/office365/servicedescriptions/office-365-platform-service-description/office-365-us-government/gcc-high-and-dod
- **FedRAMP:** https://www.fedramp.gov/
- **DoD Cloud Computing SRG:** https://public.cyber.mil/dccs/

---

**Summary:** For government cloud (GCC High/DoD), prioritize the **CLI tool** approach. It provides full functionality without network restrictions or approval hurdles.
