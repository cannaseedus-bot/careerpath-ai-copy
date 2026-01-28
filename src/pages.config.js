/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
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