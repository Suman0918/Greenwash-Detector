import React, { useState, useEffect } from 'react';
import { 
  FiWifi, 
  FiWifiOff, 
  FiChevronDown, 
  FiChevronUp,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
import './CollapsibleStatusBar.css';

const CollapsibleStatusBar = ({ backendStatus, onRetry }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastConnectionStatus, setLastConnectionStatus] = useState(null);

  useEffect(() => {
    // Show status bar when connection status changes
    if (lastConnectionStatus !== null && lastConnectionStatus !== backendStatus.connected) {
      setIsVisible(true);
      setIsCollapsed(false);
    }
    setLastConnectionStatus(backendStatus.connected);
  }, [backendStatus.connected, lastConnectionStatus]);

  // Auto-collapse after successful connection (optional)
  useEffect(() => {
    if (backendStatus.connected && !backendStatus.loading) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 3000); // Auto-collapse after 3 seconds of successful connection
      
      return () => clearTimeout(timer);
    }
  }, [backendStatus.connected, backendStatus.loading]);

  if (!isVisible) return null;

  const getStatusColor = () => {
    if (backendStatus.loading) return 'loading';
    return backendStatus.connected ? 'connected' : 'disconnected';
  };

  const getStatusIcon = () => {
    if (backendStatus.loading) return <FiRefreshCw className="spinning" size={16} />;
    return backendStatus.connected ? <FiWifi size={16} /> : <FiWifiOff size={16} />;
  };

  const getStatusText = () => {
    if (backendStatus.loading) return 'Checking backend connection...';
    if (backendStatus.connected) return 'Backend Connected & Operational';
    return 'Backend Offline - Using local storage only';
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleHide = () => {
    setIsVisible(false);
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`collapsible-status-bar ${getStatusColor()} ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="status-bar-content">
        <div className="status-main">
          <div className="status-info">
            <div className="status-icon">
              {getStatusIcon()}
            </div>
            <div className="status-text">
              <div className="status-primary">{getStatusText()}</div>
              {!isCollapsed && backendStatus.lastChecked && (
                <div className="status-secondary">
                  Last checked: {formatLastChecked(backendStatus.lastChecked)}
                  {backendStatus.error && (
                    <span className="status-error"> • {backendStatus.error}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="status-controls">
            {!backendStatus.connected && !backendStatus.loading && (
              <button 
                className="retry-btn"
                onClick={onRetry}
                title="Retry connection"
              >
                <FiRefreshCw size={14} />
                Retry
              </button>
            )}
            
            <button 
              className="collapse-btn"
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Expand status bar' : 'Collapse status bar'}
            >
              {isCollapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            </button>
            
            <button 
              className="hide-btn"
              onClick={handleHide}
              title="Hide status bar"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="status-details">
            <div className="status-stats">
              <div className="status-stat">
                <span>Database:</span>
                <span className={backendStatus.connected ? 'connected' : 'disconnected'}>
                  {backendStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="status-stat">
                <span>API Status:</span>
                <span className={backendStatus.connected ? 'operational' : 'offline'}>
                  {backendStatus.connected ? 'Operational' : 'Offline'}
                </span>
              </div>
              <div className="status-stat">
                <span>Data Sync:</span>
                <span className={backendStatus.connected ? 'active' : 'local-only'}>
                  {backendStatus.connected ? 'Active' : 'Local Only'}
                </span>
              </div>
            </div>
            
            {!backendStatus.connected && (
              <div className="status-message">
                <p>🔧 Don't worry! The app works offline using local storage. Your data will sync when the backend reconnects.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleStatusBar;