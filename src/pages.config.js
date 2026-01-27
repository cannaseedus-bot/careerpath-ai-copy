import APIManager from './pages/APIManager';
import CLIEditor from './pages/CLIEditor';
import CLIPlayground from './pages/CLIPlayground';
import Career from './pages/Career';
import Home from './pages/Home';
import ModelManager from './pages/ModelManager';
import Monitoring from './pages/Monitoring';
import Nemesis from './pages/Nemesis';
import Pricing from './pages/Pricing';
import SWOT from './pages/SWOT';
import Success from './pages/Success';
import IDEIntegrations from './pages/IDEIntegrations';
import CIPipelines from './pages/CIPipelines';
import Extensions from './pages/Extensions';
import Commands from './pages/Commands';
import __Layout from './Layout.jsx';


export const PAGES = {
    "APIManager": APIManager,
    "CLIEditor": CLIEditor,
    "CLIPlayground": CLIPlayground,
    "Career": Career,
    "Home": Home,
    "ModelManager": ModelManager,
    "Monitoring": Monitoring,
    "Nemesis": Nemesis,
    "Pricing": Pricing,
    "SWOT": SWOT,
    "Success": Success,
    "IDEIntegrations": IDEIntegrations,
    "CIPipelines": CIPipelines,
    "Extensions": Extensions,
    "Commands": Commands,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};