# Implement Nested App Authentication (NAA) for modern Office 365 SSO

## Summary
The add-in does not implement Nested App Authentication (NAA), the new 2024 standard for Office 365 add-in authentication. This limits integration capabilities and doesn't align with current Microsoft best practices.

## Background
Microsoft introduced NAA in 2024 as a replacement for the older on-behalf-of (OBO) SSO pattern. NAA offers:

- **Better SPA support:** Works with standard MSAL.js patterns
- **Consent flows:** User consent for permissions when needed
- **Microsoft Graph access:** Easier integration with Graph APIs
- **Simpler architecture:** No middle-tier server required

Source: [What's new for Office Add-ins at Build 2024](https://devblogs.microsoft.com/microsoft365dev/whats-new-for-office-add-ins-at-build-2024/)

## Current Behavior
The add-in currently:
- Runs entirely client-side with no authentication
- Cannot access Microsoft Graph APIs
- Cannot integrate with user's OneDrive, SharePoint, etc.
- No SSO with Office 365 identity

## Expected Behavior (with NAA)
The add-in should:
1. Automatically sign in users with their Office 365 identity
2. Request consent for necessary permissions (e.g., Files.ReadWrite for saving scenarios)
3. Access Microsoft Graph to:
   - Save simulation configs to OneDrive
   - Share results via Teams/Email
   - Access organizational data for inputs
4. Provide seamless SSO experience

## Implementation Steps

### 1. Install MSAL.js
```bash
npm install @azure/msal-browser --workspace=@argo/excel
```

### 2. Register App in Azure AD
1. Go to Azure Portal > App Registrations
2. Create new registration for "Argo Excel Add-in"
3. Add redirect URI: `https://localhost:3000/auth/redirect`
4. Enable NAA in manifest
5. Configure API permissions (e.g., `Files.ReadWrite`, `User.Read`)

### 3. Configure MSAL in Add-in
```typescript
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://localhost:3000/auth/redirect',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

const msalInstance = new PublicClientApplication(msalConfig);
```

### 4. Implement SSO Flow
```typescript
async function signIn() {
  try {
    const response = await msalInstance.loginPopup({
      scopes: ['User.Read', 'Files.ReadWrite'],
    });
    // User signed in, can now call Graph API
    return response.account;
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

### 5. Add Graph API Integration
```typescript
async function saveToOneDrive(simulationData: SimulationResult) {
  const token = await msalInstance.acquireTokenSilent({
    scopes: ['Files.ReadWrite'],
  });

  // Call Microsoft Graph to save file
  const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/argo-simulations/result.json:/content', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(simulationData),
  });
}
```

## Use Cases Enabled by NAA

1. **Save/Load Scenarios:** Store simulation configs in OneDrive
2. **Team Collaboration:** Share results via Teams
3. **Data Integration:** Pull risk data from SharePoint lists
4. **Audit Trail:** Log who ran which simulations
5. **Organizational Templates:** Access company-wide distribution templates

## Priority
**HIGH** - Required for 2024 O365 best practices compliance

## Labels
`enhancement`, `authentication`, `office365`, `microsoft-graph`

## References
- [NAA Documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/enable-nested-app-authentication-in-your-add-in)
- [MSAL.js Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [Build 2024 Announcement](https://devblogs.microsoft.com/microsoft365dev/whats-new-for-office-add-ins-at-build-2024/)

## Notes
- NAA is currently in preview but recommended for new development
- Requires Azure AD app registration (can provide setup guide)
- Optional feature - add-in can still work without authentication for basic use
- Consider making authentication opt-in for privacy-conscious users
