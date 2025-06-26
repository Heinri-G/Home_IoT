import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css' // Global styles
import { BrowserRouter } from 'react-router-dom';
// import { MqttProvider } from './context/MqttContext.tsx'; // Will be created later

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <MqttProvider> */}
        <App />
      {/* </MqttProvider> */}
    </BrowserRouter>
  </React.StrictMode>,
)
