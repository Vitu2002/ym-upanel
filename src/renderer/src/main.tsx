import { ContentProvider } from '@providers/ContentProvider';
import axios from 'axios';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './App';

import '@styles/_global.scss';
import '@styles/_toastify.scss';

axios.defaults.baseURL = import.meta.env.VITE_API_URI;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ContentProvider>
            <App />
            <ToastContainer autoClose={3000} theme="dark" pauseOnHover={true} />
        </ContentProvider>
    </StrictMode>
);
