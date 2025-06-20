import React, { useState, useEffect } from 'react';
import { 
  FiWifi, 
  FiWifiOff, 
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import './EnhancedStatusBar.css';

const EnhancedStatusBar = ({ backendStatus, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastConnectionStatus, setLastConnectionStatus] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show status bar when connection status changes
    if (lastConnectionStatus !== null && lastConnectionStatus !== backendStatus.connected) {
      setIsVisible(true);
      // Auto-expand for 3 seconds when status changes
      setIsExpanded(true);
      setTimeout(() => {
        if (backendStatus.connected) {
          setIsExpanded(false);
        }
      }, 3000);
    }
    setLastConnectionStatus(backendStatus.connected);
  }, [backendStatus.connected, lastConnectionStatus]);

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

  const handleToggle = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    
    // Reset animation flag after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
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
    <div className={`enhanced-status-bar ${getStatusColor()} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Pull Tab Button */}
      <div className="status-pull-tab" onClick={handleToggle}>
        <div className="pull-tab-content">
          <div className={`plant-icon ${isAnimating ? 'animate' : ''}`}>
            <div className="leaf leaf-1">🌿</div>
            <div className="leaf leaf-2">🍃</div>
            <div className="leaf leaf-3">🌱</div>
          </div>
          <div className="pull-indicator">
            {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </div>
        </div>
        <div className="pull-tab-tooltip">
          {isExpanded ? 'Click to hide status' : 'Click to view backend status'}
        </div>
      </div>

      {/* Status Bar Content */}
      <div className="status-bar-main">
        <div className="status-content-wrapper">
          <div className="status-primary-info">
            <div className="status-icon-container">
              <div className="status-icon">
                {getStatusIcon()}
              </div>
              <div className={`status-pulse ${getStatusColor()}`}></div>
            </div>
            
            <div className="status-text-info">
              <div className="status-title">{getStatusText()}</div>
              <div className="status-subtitle">
                {backendStatus.lastChecked && (
                  <>Last checked: {formatLastChecked(backendStatus.lastChecked)}</>
                )}
                {backendStatus.error && (
                  <span className="status-error"> • {backendStatus.error}</span>
                )}
              </div>
            </div>
          </div>

          <div className="status-actions">
            {!backendStatus.connected && !backendStatus.loading && (
              <button 
                className="status-retry-btn"
                onClick={onRetry}
                title="Retry connection"
              >
                <FiRefreshCw size={14} />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Status Information */}
        <div className="status-details-grid">
          <div className="status-detail-item">
            <div className="detail-label">Database</div>
            <div className={`detail-value ${backendStatus.connected ? 'connected' : 'disconnected'}`}>
              <div className="detail-indicator"></div>
              {backendStatus.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="status-detail-item">
            <div className="detail-label">API Status</div>
            <div className={`detail-value ${backendStatus.connected ? 'operational' : 'offline'}`}>
              <div className="detail-indicator"></div>
              {backendStatus.connected ? 'Operational' : 'Offline'}
            </div>
          </div>
          
          <div className="status-detail-item">
            <div className="detail-label">Data Sync</div>
            <div className={`detail-value ${backendStatus.connected ? 'active' : 'local-only'}`}>
              <div className="detail-indicator"></div>
              {backendStatus.connected ? 'Active' : 'Local Only'}
            </div>
          </div>
        </div>

        {!backendStatus.connected && (
          <div className="status-offline-message">
            <div className="offline-icon">🔧</div>
            <div className="offline-text">
              <p><strong>Don't worry!</strong> The app works offline using local storage.</p>
              <p>Your data will automatically sync when the backend reconnects.</p>
            </div>
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="status-background-decoration">
        <div className="decoration-leaf decoration-leaf-1">🌿</div>
        <div className="decoration-leaf decoration-leaf-2">🍃</div>
        <div className="decoration-leaf decoration-leaf-3">🌱</div>
        <div className="decoration-leaf decoration-leaf-4">🌿</div>
      </div>
    </div>
  );
};

export default EnhancedStatusBar;