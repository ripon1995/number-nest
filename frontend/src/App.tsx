import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Login from './components/Login';
import {AppRoutes} from "./constants/appRoutes.ts";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={AppRoutes.LOGIN} element={<Login/>}/>
                <Route path={AppRoutes.REGISTER} element={<Registration/>}/>
                <Route path={AppRoutes.DASHBOARD} element={<Dashboard/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
