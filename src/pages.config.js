import Career from './pages/Career';
import SWOT from './pages/SWOT';
import Nemesis from './pages/Nemesis';
import ModelManager from './pages/ModelManager';
import APIManager from './pages/APIManager';
import CLIPlayground from './pages/CLIPlayground';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Career": Career,
    "SWOT": SWOT,
    "Nemesis": Nemesis,
    "ModelManager": ModelManager,
    "APIManager": APIManager,
    "CLIPlayground": CLIPlayground,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};