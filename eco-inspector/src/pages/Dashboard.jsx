import React, { useState, useEffect, useRef } from 'react';
import { 
  FiExternalLink, 
  FiRefreshCw, 
  FiBarChart2,
  FiTrendingUp,
  FiTrash,
  FiWifi,
  FiWifiOff,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import hmLogo from '../assets/hm.png';
import myntraLogo from '../assets/myntra.png';
import zaraLogo from '../assets/zara.png';
import { getSustainabilityStats, resetSustainabilityStats } from '../utils/sustainabilityStats';
import { checkBackendHealth, getBackendStats } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    productsAnalyzed: 0,
    ecoFriendlyPurchases: 0,
    carbonSaved: 0
  });
  const [backendStats, setBackendStats] = useState({
    totalAnalyzed: 0,
    ecoFriendly: 0,
    averageScore: 0,
    carbonSaved: 0
  });
  const [confirmReset, setConfirmReset] = useState(false);
  const [changedStats, setChangedStats] = useState({});
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    loading: true,
    database: 'unknown'
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // Refs to track previous stats values
  const prevStatsRef = useRef(stats);
  
  // Sites data with enhanced information
  const sites = [
    { 
      name: 'H&M', 
      url: 'https://www2.hm.com', 
      logo: hmLogo,
      description: 'Global fashion retailer with sustainability initiatives',
      supported: true,
      color: '#dc2626'
    },
    { 
      name: 'Myntra', 
      url: 'https://www.myntra.com', 
      logo: myntraLogo,
      description: 'India\'s leading fashion e-commerce platform',
      supported: true,
      color: '#7c3aed'
    },
    { 
      name: 'Zara', 
      url: 'https://www.zara.com', 
      logo: zaraLogo,
      description: 'Fast fashion brand with trend-led collections',
      supported: true,
      color: '#000000'
    }
  ];

  // Load stats and backend status on component mount
  useEffect(() => {
    loadInitialData();
    
    // Listen for stats updates from other components
    const handleStatsUpdate = (event) => {
      const newStats = event.detail;
      setStats(newStats);
      
      // Check which stats changed for animation
      const changed = {};
      if (newStats.productsAnalyzed !== prevStatsRef.current.productsAnalyzed) {
        changed.productsAnalyzed = true;
      }
      if (newStats.ecoFriendlyPurchases !== prevStatsRef.current.ecoFriendlyPurchases) {
        changed.ecoFriendlyPurchases = true;
      }
      if (newStats.carbonSaved !== prevStatsRef.current.carbonSaved) {
        changed.carbonSaved = true;
      }
      
      setChangedStats(changed);
      prevStatsRef.current = newStats;
    };
    
    window.addEventListener('eco_stats_updated', handleStatsUpdate);
    window.addEventListener('storage', loadLocalStats);
    
    // Cleanup
    return () => {
      window.removeEventListener('eco_stats_updated', handleStatsUpdate);
      window.removeEventListener('storage', loadLocalStats);
    };
  }, []);
  
  // Reset animation classes after animation completes
  useEffect(() => {
    if (Object.keys(changedStats).length > 0) {
      const timer = setTimeout(() => {
        setChangedStats({});
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [changedStats]);
  
  // Load initial data (local stats + backend status)
  const loadInitialData = async () => {
    await Promise.all([
      loadLocalStats(),
      checkBackendStatus(),
      loadBackendStats()
    ]);
  };
  
  // Load local storage stats
  const loadLocalStats = async () => {
    try {
      const localStats = await getSustainabilityStats();
      setStats(localStats);
      prevStatsRef.current = localStats;
    } catch (error) {
      console.error('Error loading local stats:', error);
    }
  };
  
  // Check backend connectivity
  const checkBackendStatus = async () => {
    setBackendStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const health = await checkBackendHealth();
      setBackendStatus({
        connected: health.status === 'operational',
        loading: false,
        database: health.database || 'unknown',
        timestamp: health.timestamp
      });
    } catch (error) {
      setBackendStatus({
        connected: false,
        loading: false,
        database: 'disconnected',
        error: error.message
      });
    }
  };
  
  // Load backend statistics
  const loadBackendStats = async () => {
    try {
      const stats = await getBackendStats();
      setBackendStats(stats);
    } catch (error) {
      console.error('Error loading backend stats:', error);
    }
  };
  
  // Handle stats refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadLocalStats(),
      checkBackendStatus(),
      loadBackendStats()
    ]);
    setRefreshing(false);
  };
  
  // Handle stats reset
  const handleReset = async () => {
    if (confirmReset) {
      try {
        await resetSustainabilityStats();
        await loadLocalStats();
        setConfirmReset(false);
      } catch (error) {
        console.error('Error resetting stats:', error);
      }
    } else {
      setConfirmReset(true);
      // Auto hide after 3 seconds
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };
  
  // Calculate combined stats (local + backend)
  const combinedStats = {
    totalAnalyzed: stats.productsAnalyzed + backendStats.totalAnalyzed,
    ecoFriendly: stats.ecoFriendlyPurchases + backendStats.ecoFriendly,
    carbonSaved: stats.carbonSaved + backendStats.carbonSaved,
    averageScore: backendStats.averageScore
  };
  
  return (
    <div className="page dashboard-page">
      {/* Header Section */}
      <div className="dashboard-header">
        <MdOutlineEco size={68} className="eco-icon" />
        <div className="header-content">
          <h2>Welcome to Eco Inspector</h2>
          <p>Your AI-powered assistant for sustainable fashion choices</p>
          
          {/* Backend Status Indicator */}
          <div className="backend-status">
            {backendStatus.loading ? (
              <div className="status-indicator loading">
                <FiRefreshCw className="spinning" size={14} />
                <span>Connecting...</span>
              </div>
            ) : backendStatus.connected ? (
              <div className="status-indicator connected">
                <FiWifi size={14} />
                <span>Backend Connected</span>
                <FiCheck size={12} className="check-icon" />
              </div>
            ) : (
              <div className="status-indicator disconnected">
                <FiWifiOff size={14} />
                <span>Backend Offline</span>
                <FiX size={12} className="error-icon" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card why-sustainable">
          <div className="card-icon">🌍</div>
          <h3>Why Sustainable Fashion?</h3>
          <p>
            Fast fashion is one of the largest polluters globally, responsible for 10% of carbon emissions. 
            By making informed choices, you can reduce your environmental footprint and support ethical 
            manufacturing practices.
          </p>
          <div className="card-highlight">
            Every sustainable choice matters!
          </div>
        </div>
        
        <div className="info-card how-it-works">
          <div className="card-icon">⚡</div>
          <h3>How It Works</h3>
          <p>
            Visit any supported retailer, look for the floating 🌿 Eco Inspector button on product pages, 
            and instantly get AI-powered sustainability scores with detailed material analysis.
          </p>
          <div className="card-highlight">
            Powered by advanced AI analysis
          </div>
        </div>
      </div>
      
      {/* Supported Retailers Section */}
      <div className="retailers-section">
        <h3 className="section-title">
          <FiExternalLink size={24} />
          Supported Retailers
        </h3>
        <p className="section-description">
          Click on any retailer below to start exploring sustainability scores:
        </p>
        
        <div className="logo-grid">
          {sites.map(site => (
            <a 
              href={site.url} 
              target="_blank" 
              rel="noreferrer" 
              key={site.name} 
              className="site-card"
              style={{'--site-color': site.color}}
            >
              <div className="site-logo-container">
                <img src={site.logo} alt={site.name} />
                {site.supported && (
                  <div className="supported-badge">
                    <FiCheck size={12} />
                    Supported
                  </div>
                )}
              </div>
              <div className="site-info">
                <h3>{site.name}</h3>
                <p>{site.description}</p>
                <span className="visit-link">
                  Visit Site <FiExternalLink size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-header">
          <div className="stats-title">
            <h3>Your Sustainability Impact</h3>
            <div className="stats-subtitle">
              Combined data from web dashboard and browser extension
            </div>
          </div>
          
          <div className="stats-actions">
            <button 
              className={`refresh-stats-btn ${refreshing ? 'refreshing' : ''}`}
              title="Refresh stats"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            </button>
            
            <button 
              className={`reset-stats-btn ${confirmReset ? 'confirm' : ''}`}
              title={confirmReset ? "Click again to confirm reset" : "Reset stats"}
              onClick={handleReset}
            >
              {confirmReset ? (
                <>
                  <FiTrash size={16} /> Confirm
                </>
              ) : (
                <FiTrash size={16} />
              )}
            </button>
          </div>
        </div>
        
        <div className="stats-cards">
          <div className="stat-card products-analyzed">
            <div className="stat-icon product-icon">
              <FiBarChart2 size={24} />
            </div>
            <h4 className={changedStats.productsAnalyzed ? 'animated-value' : ''}>
              {combinedStats.totalAnalyzed}
            </h4>
            <p>Products Analyzed</p>
            <div className="stat-breakdown">
              Local: {stats.productsAnalyzed} | Backend: {backendStats.totalAnalyzed}
            </div>
          </div>
          
          <div className="stat-card eco-purchases">
            <div className="stat-icon eco-icon">
              <MdOutlineEco size={24} />
            </div>
            <h4 className={changedStats.ecoFriendlyPurchases ? 'animated-value' : ''}>
              {combinedStats.ecoFriendly}
            </h4>
            <p>Eco-Friendly Choices</p>
            <div className="stat-breakdown">
              Local: {stats.ecoFriendlyPurchases} | Backend: {backendStats.ecoFriendly}
            </div>
          </div>
          
          <div className="stat-card carbon-saved">
            <div className="stat-icon carbon-icon">
              <IoLeaf size={24} />
            </div>
            <h4 className={changedStats.carbonSaved ? 'animated-value' : ''}>
              {Math.round(combinedStats.carbonSaved * 10) / 10}
            </h4>
            <p>Carbon Saved (kg)</p>
            <div className="stat-breakdown">
              Local: {stats.carbonSaved} | Backend: {backendStats.carbonSaved}
            </div>
          </div>
          
          {backendStats.averageScore > 0 && (
            <div className="stat-card average-score">
              <div className="stat-icon score-icon">
                <FiTrendingUp size={24} />
              </div>
              <h4>{backendStats.averageScore}/10</h4>
              <p>Average Score</p>
              <div className="stat-breakdown">
                From backend analysis
              </div>
            </div>
          )}
        </div>
        
        {/* Impact Information */}
        {combinedStats.totalAnalyzed > 0 && (
          <div className="impact-info">
            <div className="impact-icon">
              <FiTrendingUp size={20} />
            </div>
            <div className="impact-text">
              <p className="impact-primary">
                {combinedStats.ecoFriendly > 0 ? 
                  `Great job! Your ${combinedStats.ecoFriendly} eco-friendly choices have saved ${Math.round(combinedStats.carbonSaved * 10) / 10}kg of carbon emissions.` :
                  "Start making eco-friendly choices to see your positive environmental impact!"
                }
              </p>
              {combinedStats.carbonSaved > 0 && (
                <p className="impact-equivalents">
                  That's equivalent to:
                  <span className="equivalent">🌳 {Math.round(combinedStats.carbonSaved / 5)} trees planted</span>
                  <span className="equivalent">🚗 {Math.round(combinedStats.carbonSaved / 0.4)} km driving avoided</span>
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Getting Started Guide */}
        {combinedStats.totalAnalyzed === 0 && (
          <div className="getting-started">
            <div className="getting-started-icon">🚀</div>
            <h4>Ready to start your sustainable journey?</h4>
            <div className="getting-started-steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>Visit any supported retailer above</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>Look for the floating 🌿 button on product pages</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>Get instant sustainability scores and insights!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;