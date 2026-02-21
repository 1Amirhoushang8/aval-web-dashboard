import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';
import Router from "./router.tsx";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "../public/assets/fonts/fonts.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();





createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <StrictMode>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </StrictMode>
    </QueryClientProvider>
);
