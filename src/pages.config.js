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
import AdminUsers from './pages/AdminUsers';
import Bible from './pages/Bible';
import BibliaLeitura from './pages/BibliaLeitura';
import Champions from './pages/Champions';
import Community from './pages/Community';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import Reader from './pages/Reader';
import Sermons from './pages/Sermons';
import Settings from './pages/Settings';
import Study from './pages/Study';
import DiagnosticReport from './pages/DiagnosticReport';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminUsers": AdminUsers,
    "Bible": Bible,
    "BibliaLeitura": BibliaLeitura,
    "Champions": Champions,
    "Community": Community,
    "Favorites": Favorites,
    "Home": Home,
    "Notes": Notes,
    "Profile": Profile,
    "Quiz": Quiz,
    "Reader": Reader,
    "Sermons": Sermons,
    "Settings": Settings,
    "Study": Study,
    "DiagnosticReport": DiagnosticReport,
}

export const pagesConfig = {
    mainPage: "Reader",
    Pages: PAGES,
    Layout: __Layout,
};