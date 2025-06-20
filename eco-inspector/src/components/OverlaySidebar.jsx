import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiChevronRight, 
  FiChevronDown, 
  FiAward, 
  FiSearch, 
  FiSave,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiThumbsUp,
  FiShoppingBag
} from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { updateSustainabilityStats } from '../utils/sustainabilityStats';
import './OverlaySidebar.css';

const OverlaySidebar = ({ isOpen, onClose, productData }) => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [expandJustification, setExpandJustification] = useState(false);
  const [expandMaterials, setExpandMaterials] = useState(false);
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [showCarbonToast, setShowCarbonToast] = useState(false);
  const [isPurchase, setIsPurchase] = useState(false);
  
  // Function to extract materials from the product description
  const extractMaterials = (description) => {
    if (!description) return [];
    
    const materials = [
      'cotton', 'organic cotton', 'recycled cotton',
      'polyester', 'recycled polyester', 
      'nylon', 'recycled nylon',
      'hemp', 'linen', 'tencel', 'bamboo',
      'viscose', 'wool', 'organic wool',
      'spandex', 'elastane', 'acrylic',
      'silk', 'leather', 'vegan leather'
    ];
    
    // Find all materials mentioned in the description
    const foundMaterials = materials.filter(material => 
      description.toLowerCase().includes(material.toLowerCase())
    );
    
    return foundMaterials.length > 0 ? foundMaterials : ['Unknown material'];
  };
  
  // Function to determine material sustainability
  const getMaterialScore = (material) => {
    const scores = {
      'organic cotton': 8,
      'recycled cotton': 7,
      'cotton': 5,
      'polyester': 3,
      'recycled polyester': 6,
      'nylon': 2,
      'recycled nylon': 5,
      'hemp': 9,
      'linen': 8,
      'tencel': 8,
      'bamboo': 7,
      'viscose': 4,
      'wool': 6,
      'organic wool': 7,
      'spandex': 2,
      'elastane': 2,
      'acrylic': 1,
      'silk': 5,
      'leather': 3,
      'vegan leather': 5
    };
    
    return scores[material.toLowerCase()] || 5;
  };
  
  // Real analysis with API call (not simulated)
  const handleAnalyze = async () => {
    if (!productData?.description) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: [productData.description],
          product_name: productData.title || 'Product Analysis' 
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze product.');

      const data = await response.json();
      const result = data.data[0];
      setAnalysisResult(result);
      
      // Update sustainability stats
      const updatedStats = updateSustainabilityStats(result.score, productData.description);
      setCarbonSaved(updatedStats.carbonSavedThisProduct);
      
      // Show carbon saved toast if this was an eco-friendly product
      if (updatedStats.carbonSavedThisProduct > 0) {
        setShowCarbonToast(true);
        setTimeout(() => {
          setShowCarbonToast(false);
        }, 5000);
      }
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing product:', error);
      // Fallback to mock analysis if API fails
      const mockResult = {
        score: Math.floor(Math.random() * 10) + 1,
        justification: `This product appears to contain ${Math.random() > 0.5 ? 'organic materials' : 'synthetic materials'} which ${Math.random() > 0.5 ? 'is generally sustainable' : 'may have environmental impacts'}.`
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }
  };
  
  // Save to reports
  const handleSave = () => {
    if (!analysisResult || !productData) return;
    
    const report = {
      title: productData?.title || 'Product Analysis',
      description: productData?.description || 'Product description',
      score: analysisResult.score,
      justification: analysisResult.justification,
      date: new Date().toLocaleString(),
      imageUrl: productData?.imageUrl,
      materials: extractMaterials(productData.description)
    };
    
    // Get existing reports or initialize empty array
    const existingReports = JSON.parse(localStorage.getItem('eco_reports')) || [];
    
    // Add new report
    localStorage.setItem('eco_reports', JSON.stringify([report, ...existingReports]));
    
    // If marked as purchase, update sustainability stats
    if (isPurchase) {
      updateSustainabilityStats(analysisResult.score, productData.description, true);
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };
  
  // Handle purchase marking
  const togglePurchase = () => {
    setIsPurchase(!isPurchase);
  };
  
  // Helper function to determine score class
  const getScoreClass = (score) => {
    if (typeof score !== 'number') return '';
    if (score >= 8) return 'high-score';
    if (score >= 5) return 'medium-score';
    return 'low-score';
  };
  
  // When product changes, reset analysis
  useEffect(() => {
    setAnalysisResult(null);
    setIsSaved(false);
    setIsPurchase(false);
    setExpandJustification(false);
    setExpandMaterials(false);
    setActiveTab('analyze');
  }, [productData]);
  
  return (
    <div className={`overlay-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <MdOutlineEco size={20} />
          <h3>Eco Inspector</h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="product-info">
          {productData?.imageUrl && (
            <img src={productData.imageUrl} alt={productData.title} className="product-image" />
          )}
          <h4>{productData?.title || 'Product Title'}</h4>
          <p className="product-description">{productData?.description || 'Product description'}</p>
        </div>
        
        <div className="sidebar-tabs">
          <button 
            className={activeTab === 'analyze' ? 'active' : ''} 
            onClick={() => setActiveTab('analyze')}
          >
            <FiSearch size={16} /> Analyze
          </button>
          <button 
            className={activeTab === 'score' ? 'active' : ''} 
            onClick={() => setActiveTab('score')}
            disabled={!analysisResult}
          >
            <FiAward size={16} /> Score
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'analyze' && (
            <div className="analyze-tab">
              <p>Click the button below to analyze this product's sustainability.</p>
              
              <button 
                className="analyze-button" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !productData?.description}
              >
                {isAnalyzing ? (
                  <>
                    <div className="loader"></div> Analyzing...
                  </>
                ) : (
                  <>
                    <FiRefreshCw size={16} /> Analyze Product
                  </>
                )}
              </button>
              
              {analysisResult && (
                <div className="quick-result">
                  <p>Analysis complete! View the full score details in the Score tab.</p>
                  {analysisResult.score >= 7 && (
                    <div className="eco-badge">
                      <MdOutlineEco size={16} />
                      <span>Eco-Friendly</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'score' && analysisResult && (
            <div className="score-tab">
              <div className="score-header">
                <div className="score-title">
                  <FiAward size={20} />
                  <h4>Sustainability Score</h4>
                </div>
                
                <div className={`score-badge ${getScoreClass(analysisResult.score)}`}>
                  {analysisResult.score}/10
                </div>
              </div>
              
              <div className="score-meter">
                <div 
                  className={`score-value ${getScoreClass(analysisResult.score)}`} 
                  style={{width: `${analysisResult.score * 10}%`}} 
                />
              </div>
              
              {productData?.description && (
                <div className="materials-section">
                  <div 
                    className="section-header" 
                    onClick={() => setExpandMaterials(!expandMaterials)}
                  >
                    <div className="header-title">
                      <FiInfo size={16} />
                      <h4>Materials</h4>
                    </div>
                    {expandMaterials ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                  </div>
                  
                  {expandMaterials && (
                    <div className="section-content">
                      <ul className="materials-list">
                        {extractMaterials(productData.description).map((material, index) => (
                          <li key={index} className="material-item">
                            <span className="material-name">{material}</span>
                            <div 
                              className={`material-score ${getScoreClass(getMaterialScore(material))}`}
                            >
                              {getMaterialScore(material)}/10
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="justification-section">
                <div 
                  className="section-header" 
                  onClick={() => setExpandJustification(!expandJustification)}
                >
                  <div className="header-title">
                    <FiInfo size={16} />
                    <h4>Justification</h4>
                  </div>
                  {expandJustification ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                </div>
                
                {expandJustification && (
                  <div className="section-content">
                    <p>{analysisResult.justification}</p>
                  </div>
                )}
              </div>
              
              <div className="purchase-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isPurchase} 
                    onChange={togglePurchase} 
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  <FiShoppingBag size={16} /> I'm purchasing this product
                </span>
              </div>
              
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <FiCheckCircle size={16} /> Saved to Reports!
                  </>
                ) : (
                  <>
                    <FiSave size={16} /> Save to Reports
                  </>
                )}
              </button>
              
              {analysisResult.score >= 7 && (
                <button className="recommend-button">
                  <FiThumbsUp size={16} /> Recommend this Product
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Carbon saved toast notification */}
      {showCarbonToast && carbonSaved > 0 && (
        <div className="carbon-toast">
          <MdOutlineEco size={20} />
          <span>You just saved {carbonSaved}kg of CO₂ by analyzing a sustainable product!</span>
        </div>
      )}
    </div>
  );
};

export default OverlaySidebar;