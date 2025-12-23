import Reader from './pages/Reader';
import Favorites from './pages/Favorites';
import Notes from './pages/Notes';
import Home from './pages/Home';
import Champions from './pages/Champions';
import Bible from './pages/Bible';
import Study from './pages/Study';
import Sermons from './pages/Sermons';
import Profile from './pages/Profile';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Quiz from './pages/Quiz';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Reader": Reader,
    "Favorites": Favorites,
    "Notes": Notes,
    "Home": Home,
    "Champions": Champions,
    "Bible": Bible,
    "Study": Study,
    "Sermons": Sermons,
    "Profile": Profile,
    "Community": Community,
    "Settings": Settings,
    "Quiz": Quiz,
}

export const pagesConfig = {
    mainPage: "Reader",
    Pages: PAGES,
    Layout: __Layout,
};