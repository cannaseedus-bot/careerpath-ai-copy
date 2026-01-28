# BASE44 Project Documentation

**Last Updated:** 2026-01-28

---

## Project Overview

This is a comprehensive AI-powered development platform featuring:
- **Runtime Studio**: AI-assisted Python development environment
- **Bot Orchestrator**: Multi-bot deployment and management system
- **Micronaut Architecture**: μ-service framework with CSS control vectors
- **Compression Models**: SCXQ2, N-gram, tensor folding
- **CLI Management**: Custom CLI builder and deployment tools
- **XCFE-PS-ENVELOPE**: Governed PowerShell execution system

---

## Core Pages

### Development Tools
- **RuntimeStudio** (`/RuntimeStudio`) - Main IDE with AI code generation, execution, and debugging
- **CLIPlayground** (`/CLIPlayground`) - Interactive CLI testing environment
- **CLIEditor** (`/CLIEditor`) - Custom CLI builder and configuration editor
- **ShellAssistant** (`/ShellAssistant`) - AI-powered shell command generator

### Management & Orchestration
- **BotOrchestrator** (`/BotOrchestrator`) - Deploy and manage bot swarms
- **ClusterManagement** (`/ClusterManagement`) - Cluster configuration and monitoring
- **ModelManager** (`/ModelManager`) - HuggingFace model management
- **APIManager** (`/APIManager`) - API endpoint configuration

### Monitoring & DevOps
- **Monitoring** (`/Monitoring`) - System metrics, logs, and alerts
- **CIPipelines** (`/CIPipelines`) - CI/CD pipeline management
- **IDEIntegrations** (`/IDEIntegrations`) - VSCode, JetBrains, etc.

### Documentation
- **CompressionDocs** (`/CompressionDocs`) - SCXQ2, N-gram, tensor compression
- **Commands** (`/Commands`) - CLI command reference
- **Extensions** (`/Extensions`) - Marketplace for extensions

### Personal
- **Career** (`/Career`) - Career portfolio and goals
- **SWOT** (`/SWOT`) - SWOT analysis visualization
- **Nemesis** (`/Nemesis`) - Design project showcase

---

## AI Code Generation System

### Core Capabilities (Latest Enhancement - 2026-01-28)

#### 1. Standard Module Generation
- Complete Python modules with type hints and docstrings
- Comprehensive pytest test suites
- Usage examples and documentation
- Dependency management
- Code quality analysis (1-10 score)
- Security vulnerability detection

#### 2. Micronaut Service Generation
**Features:**
- μ-service implementation with CSS control vectors
- Entity schemas (XJSON format)
- Controller/API endpoints
- Integration with other Micronauts
- Unit test coverage
- Fold assignment (tensor folding)

**Control Vectors:**
- `velocity` - Execution speed
- `mass` - Resource weight
- `entropy` - Randomness/variance
- `stability` - Reliability score
- `flow` - Data throughput
- `intensity` - Processing power

#### 3. Micronaut Entity Generation
**Outputs:**
- XJSON entity schemas
- Control vector configurations
- N-gram compressed data structures
- Fold recommendations

#### 4. API Documentation Generation
**Outputs:**
- OpenAPI 3.0 specifications
- Markdown documentation
- Postman collections (import-ready)
- Integration examples (Python, JS, curl)
- Error handling guides

#### 5. Data Model Generation
**Multi-format output:**
- Python Dataclass (with type hints)
- Pydantic models (API validation)
- JSON Schema (validation)
- SQL schema (CREATE TABLE + indexes)
- TypeScript interfaces
- SQLAlchemy ORM models
- Database migration scripts

---

## XCFE-PS-ENVELOPE (PowerShell Governance System)

**Status:** In Development (2026-01-28)

A governed PowerShell execution system that turns `powershell-utils` from a raw OS bridge into a **governed XCFE delegate** with formal legality verification.

### Architecture

```
[XJSON Intent]
   ↓
[XCFE Legality Envelope]
   ↓
[PS-DSL Lowering]
   ↓
[CM-1 Annotated Stream]
   ↓
[powershell-utils]
   ↓
[Host PowerShell Runtime]
   ↓
[Observation + Audit]
```

### Key Guarantees

✅ **No arbitrary text execution** - PowerShell never receives raw user text
✅ **No expression evaluation** - No `Invoke-Expression`, no script blocks, no pipes
✅ **No privilege escalation** - Capability restrictions enforced
✅ **Full auditability** - Every execution has CM-1 provenance
✅ **Replayable** - Deterministic lowering enables exact replay
✅ **Explainable** - Clear intent → command mapping

### Components

#### 1. XCFE Legality Envelope
Authoritative execution gating with hard legality rules:

```json
{
  "@xcfe": "ps-envelope.v1",
  "@control": {
    "phase": "delegate.external",
    "target": "powershell",
    "audit": true
  },
  "@capability": {
    "powershell": true,
    "interactive": false,
    "network": false,
    "filesystem": "read-only"
  },
  "@intent": {
    "action": "process.list",
    "params": {}
  },
  "@constraints": {
    "allowlist": ["Get-Process"],
    "denylist": ["Invoke-Expression", "Add-Type", "Start-Process"],
    "max_output_kb": 512
  }
}
```

#### 2. PowerShell Command DSL (PS-DSL-1)
Finite, declarative command language:

**Design Constraints:**
- ❌ No free-form strings
- ❌ No script blocks
- ❌ No pipes or expressions
- ❌ No loops or variables
- ✅ Declarative only
- ✅ Finite command set
- ✅ Single cmdlet lowering

**Example DSL Intents:**
```json
{ "action": "process.list" }
{ "action": "service.query", "params": { "status": "running" } }
```

#### 3. Deterministic Lowering
Static mapping from DSL to PowerShell cmdlets:

| DSL Action       | PowerShell Cmdlet |
| ---------------- | ----------------- |
| `process.list`   | `Get-Process`     |
| `service.query`  | `Get-Service`     |
| `eventlog.query` | `Get-EventLog`    |

#### 4. CM-1 Binding (Control Mark-1)
Audit and phase geometry annotations:

```
[SOH] ps-envelope.v1
[GS] action=process.list
[GS] lowered=Get-Process
[STX]
Get-Process
[ETX]
[EOT]
```

**CM-1 Properties:**
- Does not affect execution (projection invariant)
- Survives Base64 encoding and transport
- Enables logging, replay, diff, and audit
- Provides full provenance

#### 5. Command Registry (Deny-by-Default)
```javascript
{
  allow: {
    "process.list": { cmdlet: "Get-Process", params: [] },
    "service.query": { cmdlet: "Get-Service", params: ["status"] }
  },
  deny: [
    "Invoke-Expression", "iex", "Add-Type", "Start-Process",
    "New-Object", "Set-Item", "Remove-Item", "Invoke-WebRequest"
  ]
}
```

### NPM Dependencies

- **powershell-utils** (installed 2026-01-28)

### Planned Implementation Files

- `ps-dsl.schema.xjson` - DSL schema definition
- `ps-command-registry.v1.js` - Allowlist/denylist registry
- `ps-dsl.verifier.v1.js` - Legality verification
- `cm1.wrap.v1.js` - CM-1 annotation wrapper
- `psx.cli.v1.js` - Safe CLI interface
- `functions/ps-executor` - Backend execution function

### Security Posture

**Prevented:**
- Remote shell exploitation
- Arbitrary code execution
- Privilege escalation
- Runtime branching
- Environment mutation
- Network access (when disabled)
- Persistence

**Enabled:**
- Delegated observation
- Auditable operations
- Replay verification
- Compliance checking

### Use Cases

1. **System Monitoring** - Read-only process/service queries
2. **Event Log Analysis** - Query Windows Event Logs
3. **Configuration Reading** - Read system configuration (no writes)
4. **Resource Observation** - CPU, memory, disk usage
5. **Audit Trail Generation** - Every action fully logged

---

## Key Components

### Runtime Studio Components

#### Code Editor
- **RuntimeEditor** - Monaco-based Python editor with syntax highlighting
- **EnhancedOutputTerminal** - Advanced terminal with filtering and logs
- **DebugAssistant** - AI-powered error analysis and auto-fix
- **CodeLinter** - Real-time code quality analysis
- **TestGenerator** - Automated test generation

#### AI Assistants
- **CodeGenerationAssistant** - Full module generation from descriptions
- **RuntimeChat** - Conversational AI for coding help
- **DebuggerPanel** - Step-through debugging with AI suggestions

#### Configuration Panels
- **EnvironmentVariablesPanel** - Manage env vars
- **HFModelsPanel** - Browse HuggingFace models
- **RemoteRuntimeConfig** - Connect to remote execution clusters

#### Widgets
- **WidgetTray** - Quick access to tools (terminal, chat, settings)
- **WidgetModal** - Popup widgets for focused tasks

### Bot System Components

#### Management
- **BotCreationWizard** - Step-by-step bot builder
- **DeploymentWizard** - Multi-cluster deployment
- **OptimizationWizard** - Performance tuning
- **AIAssistant** - Bot code generation

#### Visualization
- **TensorSchemaVisualizer** - SVG-3D tensor visualization
- **CompressionMetrics** - Compression efficiency graphs
- **OptimizationInsights** - AI-driven optimization suggestions

### Micronaut Components

- **MicronautDashboard** - Central control panel
- **MicronautFactory** - Create and configure μ-services
- **MicronautAIMonitor** - AI-driven performance monitoring
- **AdaptiveControlPanel** - Dynamic control vector adjustments
- **NGramDataVisualizer** - N-gram compression visualization
- **QuantumEntanglementVisualizer** - Fold correlation visualization

### Cluster Components

- **ClusterCard** - Cluster status and info
- **ClusterForm** - Add/edit clusters
- **ClusterNodeDetail** - Individual node metrics
- **ResourceUtilizationChart** - CPU/memory/GPU usage

---

## Backend Functions

### Code Generation & Analysis
- `code-generator` - Multi-type code generation (enhanced 2026-01-28)
- `code-extractor` - Extract code from markdown/text
- `code-merger` - Merge and deduplicate code
- `debug-analyzer` - Analyze errors and suggest fixes
- `micronaut-analyzer` - Micronaut performance analysis

### Bot & Deployment
- `bot-orchestrator` - Coordinate bot swarms
- `bot-deployment` - Deploy to clusters
- `bot-execution-engine` - Execute bot tasks
- `bot-optimization-agent` - AI-driven optimization
- `agent-swarm-coordinator` - Multi-agent coordination

### Runtime & Execution
- `scriptExecutor` - Execute Python scripts in sandboxed environment
- `generateWebGPURuntime` - Generate local WebGPU runtime
- `shell-assistant` - Generate shell commands from natural language

### Compression & Training
- `compression-engine` - SCXQ2/N-gram compression
- `compression-inference-engine` - Inference on compressed models
- `geometric-tensor-brain` - Tensor folding and shaping
- `ngram-data-map` - N-gram data mapping
- `quantum-acceleration-layer` - GPU acceleration

### Infrastructure
- `micronaut-controller` - Micronaut lifecycle management
- `llm-agent-orchestrator` - Multi-LLM coordination
- `log-cli-event` - CLI usage logging
- `log-cli-metric` - Performance metrics
- `record-usage` - Usage analytics

---

## Data Entities

### Core Entities

#### Runtime & Development
- **HFModel** - HuggingFace model configurations
- **APIEndpoint** - External API configurations
- **CLIConfig** - CLI tool configurations
- **PersonalizedCLI** - User-customized CLI instances
- **CLICommand** - Custom command definitions

#### Bot System
- **Bot** - Bot definitions and scripts
- **BotVersion** - Versioned bot snapshots
- **BotDeployment** - Deployment records
- **BotOptimization** - Optimization suggestions

#### Micronauts
- **Micronaut** - μ-service definitions with control vectors
- **CompressionModel** - Trained compression models

#### Cluster Management
- **Cluster** - Cluster configurations
- **TrainingRun** - Model training sessions
- **Dataset** - Training datasets
- **ModelServingConfig** - Model serving configurations

#### Monitoring & Operations
- **PerformanceMetric** - System performance data
- **CLILog** - CLI execution logs
- **Alert** - System alerts
- **UsageAnalytics** - Usage statistics

#### Integrations
- **IDEIntegration** - IDE plugin configurations
- **CIPipeline** - CI/CD pipeline definitions
- **Extension** - Marketplace extensions

#### Personal
- **CareerGoal** - Career development goals

---

## AI Agent Configuration

### runtime-studio Agent
**Purpose:** AI code generator for executable Python

**Capabilities:**
- Generate complete Python modules
- Create Micronaut services and entities
- Write unit tests
- Provide code explanations
- Debug and fix errors

**Entity Access:**
- Bot (CRUD)
- BotVersion (read, create, update)
- HFModel (CRUD)
- TrainingRun (CRUD)
- Dataset (CRUD)
- ModelServingConfig (CRUD)
- BotDeployment (CRUD)
- BotOptimization (CRUD)
- CompressionModel (CRUD)
- Micronaut (CRUD)

**WhatsApp Integration:** Enabled

---

## Recent Updates

### 2026-01-28: XCFE PowerShell Governance System
**Added:**
- Installed `powershell-utils` npm package
- Documented XCFE-PS-ENVELOPE architecture
- Defined PS-DSL (PowerShell DSL) specification
- Designed CM-1 binding for audit trails
- Created deny-by-default command registry design

### 2026-01-28: Enhanced AI Code Generation
**Added capabilities:**
1. **Micronaut Service Generation**
   - Complete μ-service implementation
   - Entity schemas (XJSON)
   - Controller endpoints
   - Unit tests
   - Control vectors configuration

2. **API Documentation Generation**
   - OpenAPI 3.0 specs
   - Markdown docs
   - Postman collections
   - Integration examples
   - Error handling guides

3. **Data Model Generation**
   - Python Dataclass
   - Pydantic models
   - JSON Schema
   - SQL schemas with indexes
   - TypeScript interfaces
   - ORM models (SQLAlchemy)
   - Migration scripts

4. **Enhanced UI**
   - Dynamic tab system based on generation type
   - Display control vectors
   - Show relationships
   - Fold assignments
   - Quality metrics
   - Dependencies

**Files Modified:**
- `functions/code-generator.js`
- `components/runtime/CodeGenerationAssistant.jsx`

---

## Architecture Patterns

### Micronaut Pattern
- μ-service architecture
- CSS control vectors
- Fold-based organization
- N-gram compression
- XJSON schemas

### Compression Stack
- **SCXQ2**: Semantic Codex Query Quantization
- **N-gram**: Pattern-based compression
- **Tensor Folding**: Multi-dimensional optimization
- **SVG-3D**: Visual tensor representation

### XCFE Pattern
- External execution formalism
- Legality verification
- Audit trails via CM-1
- Non-Turing-complete delegation
- Projection invariance

---

## NPM Dependencies

### Development Tools
- `powershell-utils` - Governed PowerShell execution (installed 2026-01-28)

### Frontend Core
- React 18
- TailwindCSS
- shadcn/ui components
- Framer Motion
- Recharts
- Three.js
- React Query (@tanstack/react-query)
- Lucide React

---

## Environment Variables

### Required Secrets
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `CPANEL_API` - cPanel API for file storage

### Auto-Provided
- `BASE44_APP_ID` - Automatically set by Base44

---

**End of Documentation**