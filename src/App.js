
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {LoginForm} from './Components/LoginForm/LoginForm';
import Dashboard from './Components/LoginForm/Dashboard';
import {RegisterForm} from "./Components/RegisterForm/RegisterForm";

function App() {
    return (
        <Router>
            <Routes>
                {/* Login form sayfası / path için */}
                <Route path="/" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                {/* Dashboard sayfası /dashboard path için */}
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
