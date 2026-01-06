import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';
import Router from "./router.tsx";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "./assets/fonts/fonts.css";





createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </StrictMode>
);
