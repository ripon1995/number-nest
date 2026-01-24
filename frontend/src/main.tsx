// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// // Import these for MUI
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
//
// const root = ReactDOM.createRoot(document.getElementById('root')!);
// root.render(
//     <React.StrictMode>
//         <App/>
//     </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// MUI imports for normalization and theme
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
// Font imports (keep these)
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Create a basic theme (customize as needed later)
const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',  // Explicitly set to ensure it applies
  },
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />  {/* This removes default margins and normalizes styles */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);