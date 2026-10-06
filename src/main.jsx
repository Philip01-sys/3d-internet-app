import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  // No StrictMode: its double-mounted effects race with drei's <Html>
  // portals (each label is its own React root) and log spurious errors.
  <App />,
)
