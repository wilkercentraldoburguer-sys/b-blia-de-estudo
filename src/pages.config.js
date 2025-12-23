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
import __Layout from './Layout.jsx';


export const PAGES = {
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
}

export const pagesConfig = {
    mainPage: "Reader",
    Pages: PAGES,
    Layout: __Layout,
};