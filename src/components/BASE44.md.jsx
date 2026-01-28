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