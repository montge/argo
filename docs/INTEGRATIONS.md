# Argo Integrations - Project Management Systems

**Version:** 5.0
**Last Updated:** 2025-10-07

## Overview

Argo v5.0 extends beyond Excel to integrate with major project management platforms, enabling Monte Carlo simulation directly on project schedules, risks, and resource data.

---

## Supported Platforms

### 1. Microsoft Project 365

#### Desktop Application
**Status:** Planned for Phase 2

**Integration Method:**
- Office Add-ins platform (same as Excel)
- Project-specific JavaScript API
- Task pane UI for simulation controls

**Capabilities:**
- Read project schedules (tasks, dependencies, durations)
- Apply probability distributions to task durations
- Simulate project completion dates
- Generate risk reports
- What-if scenario analysis

**API Access:**
```typescript
// Read project tasks
await Project.run(async (context) => {
  const tasks = context.project.tasks;
  tasks.load('name,duration,start,finish');
  await context.sync();

  // Apply simulation to task durations
  tasks.items.forEach(task => {
    const distribution = new TriangularDistribution(
      task.duration * 0.8,  // Optimistic
      task.duration,         // Most likely
      task.duration * 1.5    // Pessimistic
    );
  });
});
```

#### Web Application (Project for the Web)
**Status:** Planned for Phase 3

**Integration Method:**
- Project for the Web REST API
- Dataverse integration
- Power Platform connectors

**Capabilities:**
- Read project data from Dataverse
- Cloud-based simulation execution
- Dashboard integration
- Power BI reporting

---

### 2. Atlassian JIRA

#### Self-Hosted (JIRA Server/Data Center)
**Status:** Planned for Phase 2

**Integration Method:**
- JIRA REST API v2/v3
- OAuth 2.0 authentication
- Webhook support for real-time updates

**Capabilities:**
- Read issue estimates (story points, time estimates)
- Apply distributions to sprint velocities
- Simulate release dates
- Burndown prediction
- Capacity planning

**API Access:**
```typescript
// JIRA REST API integration
const jiraClient = new JiraClient({
  host: 'https://jira.company.com',
  apiVersion: '3',
  auth: {
    oauth2: {
      clientId: '...',
      clientSecret: '...'
    }
  }
});

// Get sprint issues
const issues = await jiraClient.getSprint(sprintId);

// Apply simulation to story points
issues.forEach(issue => {
  const storyPoints = issue.fields.customfield_10016;
  const distribution = new NormalDistribution(
    storyPoints,
    storyPoints * 0.2  // 20% stddev
  );
});
```

#### Cloud (JIRA Cloud)
**Status:** Planned for Phase 2

**Integration Method:**
- Atlassian Connect framework
- Forge platform (modern apps)
- REST API v3

**Capabilities:**
- All self-hosted features
- Cloud-native deployment
- Marketplace distribution
- Atlassian Forge UI components

---

### 3. Oracle Primavera P6

#### Enterprise Project Portfolio Management (EPPM)
**Status:** Planned for Phase 3

**Integration Method:**
- P6 Web Services API (SOAP/REST)
- Direct database connection (read-only)
- P6 Gateway integration

**Capabilities:**
- Read project schedules (WBS, activities, resources)
- Critical path analysis with uncertainty
- Resource-constrained simulation
- Risk register integration
- Cost and schedule risk analysis

**API Access:**
```typescript
// P6 Web Services integration
const p6Client = new PrimaveraP6Client({
  url: 'https://p6.company.com/p6ws',
  username: '...',
  password: '...'
});

// Get project activities
const activities = await p6Client.getActivities({
  projectId: 'PROJECT-001',
  fields: ['ActivityId', 'ActivityName', 'PlannedDuration', 'RemainingDuration']
});

// Apply three-point estimates
activities.forEach(activity => {
  const distribution = new PERTDistribution(
    activity.optimisticDuration,
    activity.mostLikelyDuration,
    activity.pessimisticDuration
  );
});
```

#### Primavera Cloud
**Status:** Planned for Phase 3

**Integration Method:**
- Primavera Cloud REST API
- Oracle Cloud Infrastructure (OCI)
- OAuth 2.0 authentication

**Capabilities:**
- Cloud-native API access
- Multi-project portfolio simulation
- Integration with Oracle Cloud services
- Mobile-friendly dashboards

---

## Architecture for Integrations

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                  Argo Integration Layer                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Argo Core Library                        │   │
│  │  - Simulation Engine                             │   │
│  │  - Distributions                                 │   │
│  │  - Statistics                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                       │                                   │
│       ┌───────────────┼───────────────┐                  │
│       │               │               │                  │
│       v               v               v                  │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐             │
│  │ Excel   │   │ Project  │   │  JIRA    │             │
│  │ Adapter │   │ Adapter  │   │ Adapter  │             │
│  └─────────┘   └──────────┘   └──────────┘             │
│       │               │               │                  │
│       │               │               │                  │
│       │       ┌───────────────┐       │                  │
│       │       │               │       │                  │
│       v       v               v       v                  │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐             │
│  │ P6 EPPM │   │ P6 Cloud │   │  Others  │             │
│  │ Adapter │   │ Adapter  │   │  ...     │             │
│  └─────────┘   └──────────┘   └──────────┘             │
│       │               │               │                  │
└───────┼───────────────┼───────────────┼──────────────────┘
        │               │               │
        v               v               v
┌──────────────────────────────────────────────────────────┐
│              External Systems                             │
│  Excel | Project 365 | JIRA | P6 EPPM | P6 Cloud         │
└──────────────────────────────────────────────────────────┘
```

### Adapter Pattern

Each integration uses an adapter that implements a common interface:

```typescript
interface ProjectManagementAdapter {
  // Connection
  connect(credentials: Credentials): Promise<void>;
  disconnect(): Promise<void>;

  // Data retrieval
  getProjects(): Promise<Project[]>;
  getTasks(projectId: string): Promise<Task[]>;
  getDependencies(projectId: string): Promise<Dependency[]>;
  getResources(projectId: string): Promise<Resource[]>;

  // Simulation support
  supportedDistributions(): DistributionType[];
  applySimulation(config: SimulationConfig): Promise<SimulationResult>;

  // Write-back (optional)
  updateTask?(taskId: string, updates: Partial<Task>): Promise<void>;
  createRiskRegisterEntry?(risk: Risk): Promise<void>;
}
```

---

## Feature Requirements by Platform

### FR-100: Microsoft Project 365 Integration

**Priority:** High (Phase 2)

#### FR-101: Read Project Schedule
- Read all tasks, durations, dependencies
- Support for Gantt chart data
- Resource assignments
- Baseline data

#### FR-102: Duration Uncertainty
- Apply distributions to task durations
- Three-point estimates (optimistic, most likely, pessimistic)
- Historical data fitting

#### FR-103: Critical Path Analysis
- Identify critical path
- Simulate critical path variation
- Probability of being on critical path

#### FR-104: Project Completion Date Simulation
- Monte Carlo on finish date
- Confidence intervals
- Risk of late delivery

#### FR-105: Resource Constraints
- Simulate with resource limitations
- Resource contention modeling
- Over-allocation analysis

---

### FR-200: JIRA Integration

**Priority:** High (Phase 2)

#### FR-201: Sprint Velocity Simulation
- Historical velocity analysis
- Predict sprint outcomes
- Capacity planning

#### FR-202: Release Date Prediction
- Simulate release dates based on backlog
- Scope uncertainty
- Team velocity variation

#### FR-203: Story Point Estimation
- Apply distributions to story points
- Burndown prediction
- Sprint planning support

#### FR-204: Dependency Tracking
- Inter-issue dependencies
- Blocked issue impact
- Dependency risk analysis

---

### FR-300: Primavera P6 Integration

**Priority:** Medium (Phase 3)

#### FR-301: Enterprise Schedule Simulation
- Large-scale project networks (10,000+ activities)
- Multi-project simulation
- Portfolio risk analysis

#### FR-302: Cost Risk Analysis
- Cost distributions
- Contingency calculation
- Budget at completion prediction

#### FR-303: Resource Leveling Simulation
- Resource-constrained scheduling
- Multi-calendar support
- Global resource pools

#### FR-304: Risk Register Integration
- Import P6 risk registers
- Risk response simulation
- Contingency allocation

---

## Technical Implementation

### Module Structure

```
packages/
├── argo-core/                    # Core simulation engine
│
├── argo-integrations/            # NEW: Integration adapters
│   ├── src/
│   │   ├── common/
│   │   │   ├── ProjectAdapter.ts      # Base adapter interface
│   │   │   ├── Task.ts                # Common task model
│   │   │   └── Dependency.ts          # Common dependency model
│   │   │
│   │   ├── excel/
│   │   │   └── ExcelAdapter.ts        # Excel integration
│   │   │
│   │   ├── project365/
│   │   │   ├── ProjectDesktopAdapter.ts
│   │   │   └── ProjectWebAdapter.ts
│   │   │
│   │   ├── jira/
│   │   │   ├── JiraServerAdapter.ts
│   │   │   └── JiraCloudAdapter.ts
│   │   │
│   │   └── primavera/
│   │       ├── P6EPPMAdapter.ts
│   │       └── P6CloudAdapter.ts
│   │
│   └── tests/
│       └── ... (adapter tests)
│
├── argo-cli/                     # CLI tool
└── argo-excel/                   # Excel add-in
```

### Common Data Model

Unified data model across all platforms:

```typescript
interface Task {
  id: string;
  name: string;
  duration: number;                    // in days
  durationDistribution?: Distribution;
  start: Date;
  finish: Date;
  predecessors: string[];              // Task IDs
  resources: Resource[];

  // Platform-specific
  platform: 'excel' | 'project' | 'jira' | 'p6';
  platformSpecific: Record<string, any>;
}

interface Project {
  id: string;
  name: string;
  tasks: Task[];
  dependencies: Dependency[];
  resources: Resource[];
  start: Date;
  finish: Date;

  platform: string;
  platformSpecific: Record<string, any>;
}

interface Dependency {
  from: string;     // Task ID
  to: string;       // Task ID
  type: 'FS' | 'SS' | 'FF' | 'SF';  // Finish-Start, Start-Start, etc.
  lag: number;      // in days
}

interface Resource {
  id: string;
  name: string;
  availability: number;  // percent or hours
  cost?: number;
}
```

---

## Authentication & Security

### Microsoft Project 365

**Authentication:**
- Microsoft Entra ID (Azure AD)
- OAuth 2.0 with delegated permissions
- Same auth as Excel add-in

**Permissions Required:**
- `Project.Read.All` or `Project.ReadWrite.All`

### JIRA (Self-Hosted)

**Authentication:**
- Basic Auth (username/password)
- Personal Access Tokens (recommended)
- OAuth 2.0 (for apps)

**Network:**
- HTTPS required
- Firewall rules for API access
- VPN support for internal servers

### JIRA Cloud

**Authentication:**
- Atlassian Connect JWT
- OAuth 2.0 (3LO)
- API tokens

**Scopes:**
- `read:jira-work`
- `read:jira-user`
- `write:jira-work` (optional, for write-back)

### Primavera P6 EPPM

**Authentication:**
- LDAP/Active Directory
- Database authentication
- SSO (SAML)

**Network:**
- VPN for on-premises
- Direct database connection (read-only)
- Web Services API (SOAP/REST)

### Primavera Cloud

**Authentication:**
- Oracle Cloud Infrastructure (OCI) auth
- OAuth 2.0
- API key

---

## User Workflows

### Workflow 1: Project Manager in Microsoft Project

```
1. Open Microsoft Project 365
2. Open existing project schedule
3. Click "Argo" tab in ribbon
4. Click "Run Simulation"
5. Configure:
   - Select tasks with uncertainty
   - Define distributions (triangular, PERT, normal)
   - Set correlation between tasks
   - Choose iterations (10,000)
6. Click "Simulate"
7. View results:
   - Project completion date distribution
   - Critical path probability
   - Risk dashboard
8. Export report to PowerPoint/PDF
```

### Workflow 2: Scrum Master in JIRA

```
1. Open JIRA sprint board
2. Click "Argo" app in sidebar
3. Select sprint or release
4. Configure simulation:
   - Historical velocity data (auto-loaded)
   - Story point distributions
   - Team capacity variations
5. Run simulation
6. View results:
   - Sprint completion probability
   - Release date forecast
   - Burndown scenarios
7. Share with team
```

### Workflow 3: PMO Analyst using Primavera P6

```
1. Open Primavera P6 (desktop client or web)
2. Launch Argo integration
3. Select portfolio or program
4. Import schedules (multiple projects)
5. Configure simulation:
   - Activity duration ranges
   - Resource constraints
   - Risk register items
6. Run portfolio simulation
7. Analyze results:
   - Portfolio completion dates
   - Resource conflicts
   - Cost risk analysis
   - Contingency recommendations
8. Export to executive dashboard
```

---

## CLI Tool Integration Support

**For government/air-gapped environments:**

```bash
# Export from Project 365 to JSON
argo export --source project365 \
            --project "Project-001" \
            --output project.json

# Run simulation offline
argo simulate --config project.json \
              --iterations 10000 \
              --output results.json

# Import results back to Project
argo import --source project365 \
            --project "Project-001" \
            --results results.json
```

**For JIRA:**

```bash
# Export sprint data
argo export --source jira \
            --sprint 123 \
            --output sprint.json

# Simulate locally
argo simulate --config sprint.json --output forecast.json

# Generate report
argo report --input forecast.json --format html > report.html
```

---

## Implementation Roadmap

### Phase 1: Core + Excel (Current)
- ✅ Core simulation engine
- ✅ Excel integration (Office.js)
- ✅ Normal distribution
- ⏳ 34 more distributions

### Phase 2: Project Management Integrations
**Q3-Q4 2025**

- [ ] Common adapter interface
- [ ] Microsoft Project 365 Desktop adapter
- [ ] JIRA Cloud adapter
- [ ] JIRA Server adapter
- [ ] Basic project schedule simulation
- [ ] Duration uncertainty modeling
- [ ] Critical path analysis

### Phase 3: Advanced Integrations
**Q1-Q2 2026**

- [ ] Project for the Web (Dataverse)
- [ ] Primavera P6 EPPM adapter
- [ ] Primavera Cloud adapter
- [ ] Portfolio-level simulation
- [ ] Resource-constrained scheduling
- [ ] Cost risk analysis

### Phase 4: Enterprise Features
**Q3-Q4 2026**

- [ ] Multi-project dependencies
- [ ] Shared resource pools
- [ ] Program/portfolio dashboards
- [ ] Executive reporting
- [ ] What-if scenario comparison
- [ ] Risk mitigation recommendations (AI-powered)

---

## API Design Examples

### Project 365 Integration

```typescript
import { Project365Adapter } from '@argo/integrations/project365';
import { TriangularDistribution } from '@argo/core';

// Connect to Project
const adapter = new Project365Adapter();
await adapter.connect({
  clientId: '...',
  tenantId: '...',
  scopes: ['Project.ReadWrite.All']
});

// Get project
const project = await adapter.getProject('project-id');

// Apply distributions to tasks
project.tasks.forEach(task => {
  task.durationDistribution = new TriangularDistribution(
    task.duration * 0.8,   // Optimistic
    task.duration,          // Most likely
    task.duration * 1.5     // Pessimistic
  );
});

// Run simulation
const results = await adapter.simulate({
  project,
  iterations: 10000,
  outputMetrics: ['completion_date', 'critical_path', 'cost']
});

console.log('Project completion date (50th percentile):', results.completionDate.p50);
console.log('Risk of late delivery (>target):', results.completionDate.riskOfExceeding(targetDate));
```

### JIRA Integration

```typescript
import { JiraCloudAdapter } from '@argo/integrations/jira';
import { NormalDistribution } from '@argo/core';

// Connect to JIRA
const adapter = new JiraCloudAdapter({
  host: 'https://company.atlassian.net',
  email: 'user@company.com',
  apiToken: '...'
});

await adapter.connect();

// Get sprint backlog
const sprint = await adapter.getSprint(123);

// Simulate sprint completion
const results = await adapter.simulateSprint({
  sprint,
  velocityDistribution: new NormalDistribution(30, 5),  // velocity: 30 ± 5 points
  iterations: 10000
});

console.log('Sprint completion probability:', results.completionProbability);
console.log('Expected story points completed:', results.expectedPoints);
```

---

## Testing Strategy

### Integration Tests

Each adapter must have:
1. **Mock API tests** - Test against mock responses
2. **Sandbox tests** - Test against sandbox/demo instances
3. **Contract tests** - Verify API compatibility

### End-to-End Tests

```typescript
describe('Project 365 Integration (E2E)', () => {
  it('should simulate a project schedule', async () => {
    // 1. Create test project in Project 365
    const project = await createTestProject();

    // 2. Apply distributions
    const adapter = new Project365Adapter();
    await adapter.connect(testCredentials);

    // 3. Run simulation
    const results = await adapter.simulate({
      projectId: project.id,
      iterations: 1000
    });

    // 4. Verify results
    expect(results.completionDate.mean).toBeDefined();
    expect(results.completionDate.p95).toBeGreaterThan(results.completionDate.p5);
  });
});
```

---

## Documentation Requirements

### For Each Integration

1. **Setup Guide**
   - Authentication configuration
   - Permission requirements
   - Network/firewall setup

2. **User Guide**
   - Step-by-step workflows
   - Screenshots
   - Best practices

3. **API Reference**
   - Adapter methods
   - Data models
   - Error handling

4. **Troubleshooting**
   - Common issues
   - Error messages
   - Support contacts

---

## Success Metrics

### Phase 2 Success Criteria

- [ ] Connect to Project 365 and read schedule
- [ ] Connect to JIRA and read sprint data
- [ ] Run simulation on imported data
- [ ] Display results in native UI
- [ ] Export results to reports
- [ ] 80%+ test coverage for adapters
- [ ] Documentation complete

---

## Open Questions

1. **Licensing:** Do integrations require separate licenses from platform vendors?
2. **Rate Limits:** What are API rate limits for each platform?
3. **Data Volume:** Maximum project size (tasks) supported?
4. **Offline Support:** Cache project data for offline simulation?
5. **Write-Back:** Should Argo write simulation results back to source systems?
6. **Multi-Tenancy:** Support multiple JIRA/P6 instances simultaneously?

---

## Resources

### Microsoft Project
- **Project JavaScript API:** https://learn.microsoft.com/javascript/api/project
- **Project for the Web:** https://learn.microsoft.com/dynamics365/project-operations/

### JIRA
- **JIRA REST API:** https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **Atlassian Connect:** https://developer.atlassian.com/cloud/jira/platform/getting-started/
- **Forge Platform:** https://developer.atlassian.com/platform/forge/

### Primavera P6
- **P6 Web Services:** https://docs.oracle.com/cd/E90748_01/English/admin/p6_pro_web_services/
- **P6 Cloud:** https://docs.oracle.com/en/industries/construction-engineering/primavera-cloud/

---

**Summary:** Argo v5.0 will integrate with major PM platforms, providing Monte Carlo simulation where teams already work. The adapter pattern ensures consistent functionality across all platforms.
