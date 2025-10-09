# Security & Privacy Policy

**Argo Monte Carlo Simulation for Excel v5.0**

## Data Privacy

### Local Processing Only
- **All simulations run locally** in your Excel session
- **No data is transmitted** to external servers
- **No telemetry or analytics** collected
- **No user tracking** of any kind

### Data Flow
1. User enters parameters in task pane
2. Simulation runs in browser JavaScript engine
3. Results written directly to Excel worksheet
4. **No network requests** during simulation

### Office.js Permissions
```xml
<Permissions>ReadWriteDocument</Permissions>
```

**What this means:**
- Add-in can read data from your Excel workbook
- Add-in can write results back to your Excel workbook
- **Cannot access**: Files outside current workbook, network, other Office apps

**Minimal permissions principle applied** - Only what's necessary for simulation.

## Security Features

### Secure Random Number Generation
- Uses cryptographically-seeded SimpleRNG (George Marsaglia's MWC algorithm)
- Deterministic when seeded (for reproducibility)
- Non-deterministic by default (`Date.now()` seed)

### No External Dependencies at Runtime
- All distributions implemented in `@argo/core` (local npm package)
- Fluent UI and Recharts bundled in add-in
- Office.js hosted by Microsoft CDN (required for all Excel add-ins)

### HTTPS Required
- Development server runs on `https://localhost:3000`
- Self-signed certificates for local development
- Production will use valid SSL certificates

## Data Handling

### What We Store
- **Nothing.** Add-in has no database, no backend, no storage.

### What We Access
- Selected Excel ranges (when user clicks "Run Simulation")
- Active worksheet (to write results)

### What We DON'T Access
- Other Excel files
- File system
- Network resources
- User credentials
- Personal information

## Compliance

### Government Cloud (GCC High / DoD)
- Architecture supports air-gapped environments
- No external API calls during simulation
- Can be deployed to isolated networks
- Meets FedRAMP requirements for data locality

### GDPR / CCPA
- No personal data collected = No privacy concerns
- No cookies, no tracking, no profiling
- User data never leaves their machine

## Vulnerability Reporting

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: [security contact - to be determined]
3. Include: Description, steps to reproduce, impact assessment
4. We will respond within 48 hours

## Security Best Practices for Users

### Before Installing
✅ Verify add-in source (official AppSource or trusted organization)
✅ Review permissions in manifest.xml
✅ Check HTTPS certificate (no browser warnings)

### During Use
✅ Only load add-in from trusted sources
✅ Keep Excel and Windows updated
✅ Use antivirus software
✅ Don't share sideload files from untrusted sources

### For Organizations
✅ Test in isolated environment first
✅ Review source code (open source)
✅ Deploy via centralized add-in management
✅ Use Office 365 admin controls for add-in policies

## Source Code

Argo is **open source**:
- GitHub: https://github.com/boozallen/argo
- License: MIT
- Audit-friendly: All code visible and reviewable

## Updates

- Security updates will be released promptly
- Users notified via GitHub releases
- No forced updates (user controls installation)

## Privacy Policy

### Information Collection and Use

**Argo does not collect, store, or transmit any user data.**

#### What Information We Do NOT Collect:
- ❌ Personal information (name, email, phone, etc.)
- ❌ Excel workbook contents
- ❌ Simulation parameters or results
- ❌ Usage statistics or analytics
- ❌ Device information
- ❌ Location data
- ❌ Cookies or tracking identifiers
- ❌ IP addresses

#### How the Add-in Works:
1. **User Input:** You enter simulation parameters in the task pane
2. **Local Processing:** JavaScript code runs entirely in your browser
3. **Local Output:** Results written to your Excel workbook
4. **No Server Communication:** Zero network requests during operation

### Third-Party Services

#### Microsoft Office.js
- **Purpose:** Required framework for Excel add-ins
- **Provider:** Microsoft Corporation
- **Data Shared:** None (standard Office.js initialization only)
- **Privacy Policy:** https://privacy.microsoft.com/

#### No Other Third Parties
- No advertising networks
- No analytics services (e.g., Google Analytics, Mixpanel)
- No error tracking services
- No CDN for libraries (all bundled in add-in)

### Data Retention

**We retain ZERO data** because we never collect it in the first place.

Your Excel workbook data:
- Stays in your Excel application
- Controlled by you and your organization
- Subject to your own backup/retention policies
- Never uploaded to Argo servers (we don't have servers!)

### Children's Privacy

Argo does not knowingly collect information from anyone under 13 years of age. Since we collect no information at all, this is inherently compliant with COPPA (Children's Online Privacy Protection Act).

### International Data Transfers

**Not applicable** - No data leaves your computer.

For organizations in specific jurisdictions:
- **EU (GDPR):** Compliant by design (no personal data processing)
- **California (CCPA):** No sale or sharing of personal information
- **China (PIPL):** No cross-border data transfer
- **Government Cloud:** Meets data locality requirements

### Your Rights

Under various privacy laws (GDPR, CCPA, etc.), you typically have rights to:
- Access your data
- Delete your data
- Export your data
- Opt-out of data collection

**For Argo:** These rights are automatically satisfied because we never collect your data.

### Changes to Privacy Policy

If our privacy practices change:
- We will update this document
- Changes will be noted in GitHub release notes
- Major changes will be highlighted in release announcements
- **You are always in control:** Review code changes on GitHub

### Open Source Transparency

Unlike proprietary software, you can verify our privacy claims:
- **Source Code:** https://github.com/boozallen/argo
- **License:** MIT (fully open)
- **Build Process:** Reproducible builds
- **No Hidden Code:** What you see is what you get

### Contact Information

For privacy questions:
- GitHub Issues: https://github.com/boozallen/argo/issues
- Security/Privacy: Create a private security advisory
- Organization: Booz Allen Hamilton

### Legal Basis for Processing (GDPR)

**Not applicable** - We do not process personal data.

If your organization's IT policies require a legal basis statement:
- **Basis:** User consent (you choose to install and use the add-in)
- **Purpose:** Mathematical simulation tool
- **Data:** None collected

### California Resident Rights (CCPA)

**We do not sell personal information.** (We don't have any personal information to sell!)

California residents have the right to:
1. Know what personal information is collected ✅ None
2. Delete personal information ✅ Not applicable
3. Opt-out of sale ✅ Nothing to opt-out of
4. Non-discrimination ✅ All users treated equally

## Questions?

- Documentation: `packages/argo-excel/README.md`
- Issues: https://github.com/boozallen/argo/issues
- Privacy/Security: Create a GitHub security advisory

---

**Last Updated:** 2025-10-09
**Version:** 5.0.0
**Contact:** Booz Allen Hamilton
**Privacy Commitment:** Zero data collection, forever.
