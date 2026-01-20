import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Login from './components/Login';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/register" element={<Registration/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
