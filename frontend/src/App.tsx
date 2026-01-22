import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Login from './components/Login';
import {AppRoutes} from "./constants/appRoutes.ts";
import CourseDetail from "./components/CourseDetail.tsx";
import Profile from "./components/Profile.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={AppRoutes.LOGIN} element={<Login/>}/>
                <Route path={AppRoutes.REGISTER} element={<Registration/>}/>
                <Route path={AppRoutes.DASHBOARD} element={<Dashboard/>}/>
                <Route path={AppRoutes.COURSE_DETAILS} element={<CourseDetail/>}/>
                <Route path={AppRoutes.PROFILE} element={<Profile/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
