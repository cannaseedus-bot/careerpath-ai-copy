import APIManager from './pages/APIManager';
import BotOrchestrator from './pages/BotOrchestrator';
import CIPipelines from './pages/CIPipelines';
import CLIEditor from './pages/CLIEditor';
import CLIPlayground from './pages/CLIPlayground';
import Career from './pages/Career';
import ClusterManagement from './pages/ClusterManagement';
import Commands from './pages/Commands';
import CompressionDocs from './pages/CompressionDocs';
import Extensions from './pages/Extensions';
import Home from './pages/Home';
import IDEIntegrations from './pages/IDEIntegrations';
import ModelManager from './pages/ModelManager';
import Monitoring from './pages/Monitoring';
import Nemesis from './pages/Nemesis';
import Pricing from './pages/Pricing';
import RuntimeStudio from './pages/RuntimeStudio';
import SWOT from './pages/SWOT';
import ShellAssistant from './pages/ShellAssistant';
import Success from './pages/Success';
import __Layout from './Layout.jsx';


export const PAGES = {
    "APIManager": APIManager,
    "BotOrchestrator": BotOrchestrator,
    "CIPipelines": CIPipelines,
    "CLIEditor": CLIEditor,
    "CLIPlayground": CLIPlayground,
    "Career": Career,
    "ClusterManagement": ClusterManagement,
    "Commands": Commands,
    "CompressionDocs": CompressionDocs,
    "Extensions": Extensions,
    "Home": Home,
    "IDEIntegrations": IDEIntegrations,
    "ModelManager": ModelManager,
    "Monitoring": Monitoring,
    "Nemesis": Nemesis,
    "Pricing": Pricing,
    "RuntimeStudio": RuntimeStudio,
    "SWOT": SWOT,
    "ShellAssistant": ShellAssistant,
    "Success": Success,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};