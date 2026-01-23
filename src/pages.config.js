import Career from './pages/Career';
import SWOT from './pages/SWOT';
import Nemesis from './pages/Nemesis';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Career": Career,
    "SWOT": SWOT,
    "Nemesis": Nemesis,
}

export const pagesConfig = {
    mainPage: "Career",
    Pages: PAGES,
    Layout: __Layout,
};