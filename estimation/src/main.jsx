import React from 'react';
import ReactDOM from 'react-dom/client';
import { FrappeProvider } from 'frappe-react-sdk';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FrappeProvider 
      url="http://93.127.143.238"
      socketPort={9000}
    >
      <App />
    </FrappeProvider>
  </React.StrictMode>
);