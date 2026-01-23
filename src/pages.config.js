import Career from './pages/Career';
import SWOT from './pages/SWOT';
import Nemesis from './pages/Nemesis';
import ModelManager from './pages/ModelManager';
import APIManager from './pages/APIManager';
import CLIPlayground from './pages/CLIPlayground';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Career": Career,
    "SWOT": SWOT,
    "Nemesis": Nemesis,
    "ModelManager": ModelManager,
    "APIManager": APIManager,
    "CLIPlayground": CLIPlayground,
    "Home": Home,
    "Pricing": Pricing,
    "Success": Success,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};