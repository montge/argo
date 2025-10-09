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

## Questions?

- Documentation: `packages/argo-excel/README.md`
- Issues: https://github.com/boozallen/argo/issues
- Security: [contact info]

---

**Last Updated:** 2025-10-09
**Version:** 5.0.0
**Contact:** Booz Allen Hamilton
