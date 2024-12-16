import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // Varsayılan stil dosyanız
import App from './App';  // App bileşenini import edin
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')  // root id'li div'e render et
);

// Web performansını ölçmek istiyorsanız
reportWebVitals();
