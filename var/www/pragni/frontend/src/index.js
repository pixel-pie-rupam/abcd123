import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SeoProvider } from './context/SeoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <SeoProvider>
        <App />
      </SeoProvider>
    </ThemeProvider>
  </React.StrictMode>
);
