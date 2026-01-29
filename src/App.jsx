import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Layout from './components/Layout';
import AlmanacView from './views/AlmanacView';
import QuestBoardView from './views/QuestBoardView';
import HarvestFieldView from './views/HarvestFieldView';
import StatisticsView from './views/StatisticsView';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
    const [session, setSession] = useState(null);
    const [currentView, setCurrentView] = useState('almanac');
    const [selectedCycleId, setSelectedCycleId] = useState(1);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!session) {
        return <Auth />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'almanac':
                return <AlmanacView onSelectCycle={(id) => { setSelectedCycleId(id); setCurrentView('quest'); }} />;
            case 'quest':
                return <QuestBoardView cycleId={selectedCycleId} onBack={() => setCurrentView('almanac')} />;
            case 'harvest':
                return <HarvestFieldView />;
            case 'statistics':
                return <StatisticsView />;
            default:
                return <AlmanacView />;
        }
    };

    return (
        <ErrorBoundary>
            <Layout currentView={currentView} setView={setCurrentView} session={session}>
                {renderView()}
            </Layout>
        </ErrorBoundary>
    );
}

export default App;
