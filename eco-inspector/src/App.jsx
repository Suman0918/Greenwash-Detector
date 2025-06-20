import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import EnhancedStatusBar from './components/EnhancedStatusBar';
import Dashboard from './pages/Dashboard';
import ManualAnalysis from './pages/ManualAnalysis';
import Reports from './pages/Reports';
import { initializeSustainabilityTracking } from './utils/sustainabilityStats';
import { testConnection } from './utils/api';
import './styles/global.css';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    loading: true,
    lastChecked: null,
    error: null
  });

  useEffect(() => {
    // Initialize the sustainability tracking system
    initializeApp();
    
    // Set up periodic backend health checks
    const healthCheckInterval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds
    
    // Cleanup on unmount
    return () => {
      clearInterval(healthCheckInterval);
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Eco Inspector App...');
      
      // Initialize sustainability tracking with backend sync
      await initializeSustainabilityTracking();
      
      // Check initial backend connection
      await checkBackendHealth();
      
      console.log('✅ App initialization complete!');
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setBackendStatus(prev => ({
        ...prev,
        loading: false,
        connected: false,
        error: error.message
      }));
    }
  };

  const checkBackendHealth = async () => {
    try {
      setBackendStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const connected = await testConnection();
      const timestamp = new Date().toISOString();
      
      setBackendStatus({
        connected,
        loading: false,
        lastChecked: timestamp,
        error: connected ? null : 'Unable to connect to backend server'
      });
      
      // Dispatch global event for components to react to backend status changes
      window.dispatchEvent(new CustomEvent('backend_status_changed', {
        detail: { connected, timestamp }
      }));
      
      console.log(`Backend status: ${connected ? '✅ Connected' : '❌ Disconnected'}`);
      
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus({
        connected: false,
        loading: false,
        lastChecked: new Date().toISOString(),
        error: error.message || 'Connection failed'
      });
    }
  };

  // Manual retry function for the status bar
  const handleRetryConnection = async () => {
    console.log('🔄 Manually retrying backend connection...');
    await checkBackendHealth();
  };

  // Listen for network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network connection restored');
      checkBackendHealth();
    };

    const handleOffline = () => {
      console.log('📡 Network connection lost');
      setBackendStatus(prev => ({ 
        ...prev, 
        connected: false,
        error: 'No internet connection'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Enhanced Status Bar with Pull Tab */}
        <EnhancedStatusBar 
          backendStatus={backendStatus}
          onRetry={handleRetryConnection}
        />

        <Sidebar />
        
        <div className="content" style={{ paddingTop: '40px' }}> {/* Reduced padding for pull tab design */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manual" element={<ManualAnalysis />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>

        {/* Enhanced Offline Indicator */}
        {!navigator.onLine && (
          <div className="offline-indicator">
            📡 You're offline - data will sync when connection is restored
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;