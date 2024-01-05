import './App.css'
import MainContainer from "./templates/dashboard/MainContainer.tsx";
import {PositionsContext, usePositions} from "./context.ts";


function App() {
    const positions = usePositions()

    return (
        <>
            <PositionsContext.Provider value={positions}>
                <MainContainer/>
            </PositionsContext.Provider>
        </>
    )
}

export default App
