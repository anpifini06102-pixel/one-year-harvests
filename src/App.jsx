import React, { useState } from 'react';
import Layout from './components/Layout';
import AlmanacView from './views/AlmanacView';
import QuestBoardView from './views/QuestBoardView';
import HarvestFieldView from './views/HarvestFieldView';

function App() {
    const [currentView, setCurrentView] = useState('almanac');
    const [selectedCycleId, setSelectedCycleId] = useState(1);

    const renderView = () => {
        switch (currentView) {
            case 'almanac':
                return <AlmanacView onSelectCycle={(id) => { setSelectedCycleId(id); setCurrentView('quest'); }} />;
            case 'quest':
                return <QuestBoardView cycleId={selectedCycleId} onBack={() => setCurrentView('almanac')} />;
            case 'harvest':
                return <HarvestFieldView />;
            default:
                return <AlmanacView />;
        }
    };

    return (
        <Layout currentView={currentView} setView={setCurrentView}>
            {renderView()}
        </Layout>
    );
}

export default App;
