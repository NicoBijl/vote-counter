import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={createTheme({
            palette: {
            },
            components: {
                MuiTextField: {
                    defaultProps: {
                        variant: "filled",
                        margin: "dense",
                        fullWidth: true
                    }
                },
                MuiButton: {
                    defaultProps: {
                        variant: "contained"
                    }
                }
            }
        })}>
            <CssBaseline/>

            <App/>
        </ThemeProvider>
    </React.StrictMode>,
)
