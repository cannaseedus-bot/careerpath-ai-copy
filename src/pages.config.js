import APIManager from './pages/APIManager';
import BotOrchestrator from './pages/BotOrchestrator';
import CIPipelines from './pages/CIPipelines';
import CLIEditor from './pages/CLIEditor';
import CLIPlayground from './pages/CLIPlayground';
import Career from './pages/Career';
import Commands from './pages/Commands';
import Extensions from './pages/Extensions';
import Home from './pages/Home';
import IDEIntegrations from './pages/IDEIntegrations';
import ModelManager from './pages/ModelManager';
import Monitoring from './pages/Monitoring';
import Nemesis from './pages/Nemesis';
import Pricing from './pages/Pricing';
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
    "Commands": Commands,
    "Extensions": Extensions,
    "Home": Home,
    "IDEIntegrations": IDEIntegrations,
    "ModelManager": ModelManager,
    "Monitoring": Monitoring,
    "Nemesis": Nemesis,
    "Pricing": Pricing,
    "SWOT": SWOT,
    "ShellAssistant": ShellAssistant,
    "Success": Success,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};