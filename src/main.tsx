import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
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
            <HashRouter>
                <App/>
            </HashRouter>
        </ThemeProvider>
    </React.StrictMode>,
)