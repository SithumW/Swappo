import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnv } from './config/env'

// Validate environment variables on app startup
validateEnv();

createRoot(document.getElementById("root")!).render(<App />);
