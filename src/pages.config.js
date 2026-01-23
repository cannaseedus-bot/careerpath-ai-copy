import APIManager from './pages/APIManager';
import CLIPlayground from './pages/CLIPlayground';
import Career from './pages/Career';
import Home from './pages/Home';
import ModelManager from './pages/ModelManager';
import Nemesis from './pages/Nemesis';
import Pricing from './pages/Pricing';
import SWOT from './pages/SWOT';
import Success from './pages/Success';
import __Layout from './Layout.jsx';


export const PAGES = {
    "APIManager": APIManager,
    "CLIPlayground": CLIPlayground,
    "Career": Career,
    "Home": Home,
    "ModelManager": ModelManager,
    "Nemesis": Nemesis,
    "Pricing": Pricing,
    "SWOT": SWOT,
    "Success": Success,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};