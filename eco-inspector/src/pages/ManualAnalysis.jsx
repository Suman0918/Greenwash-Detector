import React, { useState, useEffect } from 'react';
import { 
  FiSend, 
  FiAward, 
  FiInfo, 
  FiCheckCircle, 
  FiAlertCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { BiAnalyse } from 'react-icons/bi';
import { MdOutlineEco } from 'react-icons/md';
import { updateSustainabilityStats } from '../utils/sustainabilityStats';
import { analyzeProduct, testConnection } from '../utils/api';
import './ManualAnalysis.css';

const ManualAnalysis = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [showCarbonToast, setShowCarbonToast] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const [backendConnected, setBackendConnected] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    materials: false,
    justification: true
  });
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Test backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
    loadAnalysisHistory();
  }, []);

  const checkBackendConnection = async () => {
    const connected = await testConnection();
    setBackendConnected(connected);
  };

  const loadAnalysisHistory = () => {
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    setAnalysisHistory(history.slice(0, 5)); // Show last 5 analyses
  };

  const saveToHistory = (analysis) => {
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    const newEntry = {
      id: Date.now(),
      title: productTitle || 'Manual Analysis',
      description: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
      score: analysis.score,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    localStorage.setItem('analysis_history', JSON.stringify(updatedHistory));
    setAnalysisHistory(updatedHistory.slice(0, 5));
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError('Please enter a product description.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Test connection first
      const connected = await testConnection();
      setBackendConnected(connected);
      
      if (!connected) {
        throw new Error('Backend server is not available. Please make sure it\'s running on http://localhost:5000');
      }

      const response = await analyzeProduct(input, productTitle || "Manual Analysis", 'manual');
      const analysisResult = response.data[0];
      setResult(analysisResult);
      
      // Save to history
      saveToHistory(analysisResult);
      
      // Update sustainability stats and get carbon saved for this product
      const updatedStats = await updateSustainabilityStats(analysisResult.score, input, false, 'manual');
      setCarbonSaved(updatedStats.carbonSavedThisProduct || 0);
      
      // Show carbon saved toast if this was an eco-friendly product
      if (updatedStats.carbonSavedThisProduct > 0) {
        setShowCarbonToast(true);
        setTimeout(() => {
          setShowCarbonToast(false);
        }, 5000);
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze product. Please check your connection and try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const saveToReports = async () => {
    if (!result) return;
    
    try {
      // Create a simple title from the input if none provided
      const title = productTitle || input.split(' ').slice(0, 5).join(' ') + '...';
      
      const report = {
        title,
        description: input,
        score: result.score,
        justification: result.justification,
        materials: result.materials || [],
        date: new Date().toLocaleString(),
        source: 'manual'
      };
      
      // Get existing reports or initialize empty array
      const existingReports = JSON.parse(localStorage.getItem('eco_reports')) || [];
      
      // Add new report
      localStorage.setItem('eco_reports', JSON.stringify([report, ...existingReports]));
      
      // Update sustainability stats to mark this as a purchase
      await updateSustainabilityStats(result.score, input, true, 'manual');
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
      console.error('Error saving report:', error);
      setError('Failed to save report. Please try again.');
    }
  };

  const loadExample = (example) => {
    setInput(example.description);
    setProductTitle(example.title);
  };

  // Helper function to determine score class based on the numeric score
  const getScoreClass = (score) => {
    if (typeof score !== 'number') return '';
    if (score >= 8) return 'high-score';
    if (score >= 5) return 'medium-score';
    return 'low-score';
  };

  // Example products for quick testing
  const examples = [
    {
      title: "Organic Cotton T-Shirt",
      description: "100% organic cotton t-shirt, GOTS certified, made with natural dyes and fair trade practices. Manufactured in a facility powered by renewable energy."
    },
    {
      title: "Recycled Polyester Jacket",
      description: "Outdoor jacket made from 100% recycled polyester from post-consumer plastic bottles. DWR coating is PFC-free and the item is bluesign approved."
    },
    {
      title: "Fast Fashion Dress",
      description: "Trendy polyester dress with sequins and synthetic materials. Mass-produced with chemical dyes and standard manufacturing processes."
    }
  ];

  return (
    <div className="page manual-analysis-page">
      <div className="analysis-header">
        <BiAnalyse size={32} className="analysis-icon" />
        <div className="header-content">
          <h2>Manual Sustainability Analysis</h2>
          <p>Paste a product description below to get instant AI-powered sustainability insights</p>
          
          {/* Backend Status */}
          <div className="backend-status">
            {backendConnected ? (
              <div className="status-connected">
                <FiCheckCircle size={16} />
                <span>Backend Connected</span>
              </div>
            ) : (
              <div className="status-disconnected">
                <FiAlertCircle size={16} />
                <span>Backend Offline</span>
                <button onClick={checkBackendConnection} className="retry-btn">
                  <FiRefreshCw size={14} />
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="examples-section">
        <h3>Quick Examples</h3>
        <div className="examples-grid">
          {examples.map((example, index) => (
            <button
              key={index}
              className="example-card"
              onClick={() => loadExample(example)}
            >
              <h4>{example.title}</h4>
              <p>{example.description.substring(0, 80)}...</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Form */}
      <div className="form-card">
        <div className="form-grid">
          <div className="form-column">
            <div className="input-group">
              <label htmlFor="product-title">Product Name (optional)</label>
              <input
                id="product-title"
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g., Organic Cotton T-Shirt"
                className="form-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="product-description">
                Product Description *
                <span className="input-hint">Include materials, certifications, and manufacturing details</span>
              </label>
              <textarea
                id="product-description"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: 100% organic cotton t-shirt, GOTS certified, naturally dyed with plant-based pigments and manufactured in a facility powered by renewable energy..."
                rows={8}
                className="form-textarea"
              />
              <div className="input-counter">
                {input.length} characters
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !input.trim() || !backendConnected}
              className={`analyze-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div> 
                  Analyzing...
                </>
              ) : (
                <>
                  <FiSend size={18} /> Analyze Sustainability
                </>
              )}
            </button>
          </div>
          
          {/* Analysis History Sidebar */}
          <div className="history-column">
            <h4>Recent Analyses</h4>
            {analysisHistory.length > 0 ? (
              <div className="history-list">
                {analysisHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-header">
                      <span className="history-title">{item.title}</span>
                      <span className={`history-score ${getScoreClass(item.score)}`}>
                        {item.score}/10
                      </span>
                    </div>
                    <p className="history-description">{item.description}</p>
                    <div className="history-date">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <MdOutlineEco size={48} />
                <p>No previous analyses yet. Start analyzing products to see your history here!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="result-section">
          <div className="result-header">
            <div className="score-display">
              <div className="score-circle">
                <div className={`score-number ${getScoreClass(result.score)}`}>
                  {result.score}/10
                </div>
              </div>
              
              <div className="score-info">
                <h3>Analysis Complete!</h3>
                <p>
                  {result.score >= 8 ? '🌟 Excellent sustainability rating!' :
                   result.score >= 6 ? '✅ Good sustainability practices' :
                   result.score >= 4 ? '⚠️ Moderate sustainability concerns' :
                   '❌ Significant sustainability issues'}
                </p>
                {result.confidence && (
                  <div className="confidence-indicator">
                    Confidence: {result.confidence}%
                  </div>
                )}
              </div>
            </div>
            
            <div className="score-meter">
              <div 
                className={`score-fill ${getScoreClass(result.score)}`} 
                style={{width: `${result.score * 10}%`}} 
              />
            </div>
          </div>

          <div className="result-content">
            {/* Materials Section */}
            {result.materials && result.materials.length > 0 && (
              <div className="result-section-item">
                <button
                  className="section-toggle"
                  onClick={() => toggleSection('materials')}
                >
                  <div className="section-title">
                    <MdOutlineEco size={20} />
                    <span>Materials Analysis</span>
                  </div>
                  {expandedSections.materials ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                
                {expandedSections.materials && (
                  <div className="section-content">
                    <div className="materials-grid">
                      {result.materials.map((material, index) => (
                        <div key={index} className="material-card">
                          <div className="material-header">
                            <span className="material-name">{material.name}</span>
                            <span className={`material-score ${getScoreClass(material.sustainability_score)}`}>
                              {material.sustainability_score}/10
                            </span>
                          </div>
                          <p className="material-impact">{material.impact_description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Justification Section */}
            <div className="result-section-item">
              <button
                className="section-toggle"
                onClick={() => toggleSection('justification')}
              >
                <div className="section-title">
                  <FiInfo size={20} />
                  <span>Detailed Analysis</span>
                </div>
                {expandedSections.justification ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </button>
              
              {expandedSections.justification && (
                <div className="section-content">
                  <p className="justification-text">{result.justification}</p>
                </div>
              )}
            </div>
          </div>

          <div className="result-actions">
            <button 
              onClick={saveToReports} 
              disabled={saved} 
              className={`save-button ${saved ? 'saved' : ''}`}
            >
              {saved ? (
                <>
                  <FiCheckCircle size={18} /> Saved to Reports!
                </>
              ) : (
                <>
                  <FiAward size={18} /> Save to Reports
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Carbon saved toast notification */}
      {showCarbonToast && carbonSaved > 0 && (
        <div className="carbon-toast">
          <MdOutlineEco size={24} />
          <div className="toast-content">
            <strong>Great choice!</strong>
            <span>You analyzed a sustainable product and saved {carbonSaved}kg of CO₂!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualAnalysis;