// Fixed sustainabilityStats.js - Enhanced duplicate prevention and report management

import { checkBackendHealth, getBackendStats } from './api';

/**
 * Generate truly unique IDs to prevent duplicates
 */
const generateUniqueId = (prefix = 'report') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = (window.ecoIdCounter = (window.ecoIdCounter || 0) + 1);
  return `${prefix}-${timestamp}-${random}-${counter}`;
};

/**
 * Create a unique signature for reports to prevent duplicates
 */
const createReportSignature = (report) => {
  const title = (report.title || '').toLowerCase().trim();
  const description = (report.description || '').toLowerCase().trim().substring(0, 100);
  const score = report.score || 0;
  const source = report.source || 'manual';
  
  return `${title}-${description}-${score}-${source}`.replace(/\s+/g, '-');
};

/**
 * Clean and validate report data
 */
const cleanReportData = (report) => {
  return {
    id: report.id || generateUniqueId('report'),
    title: (report.title || report.product_name || 'Untitled Report').trim(),
    description: (report.description || '').trim(),
    score: typeof report.score === 'number' ? Math.max(0, Math.min(10, report.score)) : 5,
    justification: (report.justification || '').trim(),
    materials: Array.isArray(report.materials) ? report.materials : [],
    date: report.date || new Date().toISOString(),
    source: report.source || 'manual',
    imageUrl: report.imageUrl || '',
    url: report.url || '',
    isPurchase: Boolean(report.isPurchase),
    signature: null // Will be set below
  };
};

/**
 * Check if browser extension is available
 */
const isExtensionAvailable = () => {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
};

/**
 * Get default stats structure
 */
const getDefaultStats = () => ({
  productsAnalyzed: 0,
  ecoFriendlyPurchases: 0,
  carbonSaved: 0,
  lastUpdated: new Date().toISOString(),
  version: '2.0'
});

/**
 * Enhanced duplicate prevention for reports
 */
const preventDuplicateReports = (newReport, existingReports) => {
  const newSignature = createReportSignature(newReport);
  
  // Check for exact duplicates by signature
  const exactDuplicate = existingReports.find(existing => {
    const existingSignature = createReportSignature(existing);
    return existingSignature === newSignature;
  });
  
  if (exactDuplicate) {
    console.log(`🔄 Preventing duplicate report: ${newReport.title}`);
    return null; // Don't save duplicate
  }
  
  // Check for near-duplicates (same title, similar time)
  const nearDuplicate = existingReports.find(existing => {
    const titleMatch = (existing.title || '').toLowerCase() === (newReport.title || '').toLowerCase();
    const timeMatch = Math.abs(
      new Date(existing.date || 0).getTime() - new Date(newReport.date || 0).getTime()
    ) < 60000; // Within 1 minute
    
    return titleMatch && timeMatch;
  });
  
  if (nearDuplicate) {
    console.log(`⚠️ Near-duplicate detected, updating existing: ${newReport.title}`);
    
    // Update the existing report with new data
    return {
      ...nearDuplicate,
      ...newReport,
      id: nearDuplicate.id, // Keep original ID
      date: nearDuplicate.date, // Keep original date
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Add signature to new report
  newReport.signature = newSignature;
  return newReport;
};

/**
 * Calculate carbon savings based on score and description analysis
 */
const calculateCarbonSavings = (score, description, isPurchase = false) => {
  let carbonSaved = 0;
  
  // Only calculate savings for eco-friendly products (score >= 7)
  if (score >= 7) {
    // Base carbon savings - 2kg per eco-friendly product analysis
    carbonSaved = 2;
    
    // Additional savings based on score (higher scores = more savings)
    carbonSaved += (score - 7) * 0.5; // 0.5kg per point above 7
    
    // Bonus for specific sustainable materials
    const sustainableMaterials = [
      'organic', 'recycled', 'hemp', 'tencel', 'bamboo', 'linen'
    ];
    
    const materialBonuses = sustainableMaterials.filter(material => 
      description.toLowerCase().includes(material)
    );
    
    materialBonuses.forEach(material => {
      switch (material) {
        case 'organic':
          carbonSaved += 1.2;
          break;
        case 'recycled':
          carbonSaved += 1.0;
          break;
        case 'hemp':
          carbonSaved += 0.8;
          break;
        case 'tencel':
        case 'bamboo':
        case 'linen':
          carbonSaved += 0.6;
          break;
      }
    });
    
    // Certification bonuses
    const certifications = [
      'gots', 'fair trade', 'oeko-tex', 'bluesign', 'cradle to cradle'
    ];
    
    const certificationBonuses = certifications.filter(cert => 
      description.toLowerCase().includes(cert)
    );
    
    carbonSaved += certificationBonuses.length * 0.5;
    
    // Purchasing bonus (actual purchase vs just analysis)
    if (isPurchase) {
      carbonSaved *= 1.5; // 50% bonus for actual purchases
    }
  }
  
  return Math.round(carbonSaved * 100) / 100; // Round to 2 decimal places
};

/**
 * Enhanced report saving with duplicate prevention
 */
export const saveSustainabilityReport = async (reportData) => {
  try {
    console.log('💾 Saving sustainability report...');
    
    // Clean and validate report data
    const cleanedReport = cleanReportData(reportData);
    
    // Get existing reports
    const existingReports = JSON.parse(localStorage.getItem('eco_reports') || '[]');
    
    // Check for duplicates and handle accordingly
    const processedReport = preventDuplicateReports(cleanedReport, existingReports);
    
    if (!processedReport) {
      console.log('⚠️ Duplicate report not saved');
      return null; // Duplicate prevented
    }
    
    let updatedReports;
    
    // Check if this is an update to existing report
    const existingIndex = existingReports.findIndex(r => r.id === processedReport.id);
    
    if (existingIndex !== -1) {
      // Update existing report
      updatedReports = [...existingReports];
      updatedReports[existingIndex] = processedReport;
      console.log('📝 Updated existing report');
    } else {
      // Add new report at the beginning
      updatedReports = [processedReport, ...existingReports];
      console.log('✅ Added new report');
    }
    
    // Keep only latest 100 reports to prevent storage bloat
    if (updatedReports.length > 100) {
      console.log(`🗂️ Trimming reports from ${updatedReports.length} to 100`);
      updatedReports = updatedReports.slice(0, 100);
    }
    
    // Save to localStorage
    localStorage.setItem('eco_reports', JSON.stringify(updatedReports));
    
    // Sync with extension if available
    if (isExtensionAvailable()) {
      try {
        await chrome.storage.local.set({ eco_reports: updatedReports });
        console.log('🔄 Report synced with extension');
      } catch (error) {
        console.error('Failed to sync report with extension:', error);
      }
    }
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('eco_reports_updated', {
      detail: { 
        reports: updatedReports,
        action: existingIndex !== -1 ? 'updated' : 'added',
        report: processedReport
      }
    }));
    
    console.log(`📊 Total reports: ${updatedReports.length}`);
    return processedReport;
    
  } catch (error) {
    console.error('❌ Error saving sustainability report:', error);
    throw error;
  }
};

/**
 * Enhanced report deletion with proper cleanup
 */
export const deleteSustainabilityReport = async (reportId, reportTitle = '') => {
  try {
    console.log(`🗑️ Deleting report: ${reportId}`);
    
    // Get current reports
    const currentReports = JSON.parse(localStorage.getItem('eco_reports') || '[]');
    
    // Find report to delete
    const reportToDelete = currentReports.find(r => r.id === reportId);
    
    if (!reportToDelete) {
      console.warn(`⚠️ Report not found: ${reportId}`);
      return false;
    }
    
    // Filter out the report
    const updatedReports = currentReports.filter(report => 
      report.id !== reportId && 
      (report.title || '') !== reportTitle // Extra safety check
    );
    
    console.log(`📊 Reports before delete: ${currentReports.length}, after: ${updatedReports.length}`);
    
    // Update localStorage
    localStorage.setItem('eco_reports', JSON.stringify(updatedReports));
    
    // Sync with extension if available
    if (isExtensionAvailable()) {
      try {
        await chrome.storage.local.set({ eco_reports: updatedReports });
        console.log('🔄 Deletion synced with extension');
      } catch (error) {
        console.error('Failed to sync deletion with extension:', error);
      }
    }
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('eco_reports_updated', {
      detail: { 
        reports: updatedReports,
        action: 'deleted',
        deletedReport: reportToDelete
      }
    }));
    
    console.log('✅ Report deleted successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error deleting sustainability report:', error);
    throw error;
  }
};

/**
 * Sync data between localStorage and extension storage
 */
export const syncWithExtension = async () => {
  if (!isExtensionAvailable()) {
    console.log('Extension not available, using localStorage only');
    return;
  }

  try {
    console.log('🔄 Syncing with extension...');
    
    // Get extension data
    const extensionData = await chrome.storage.local.get(['eco_sustainability_stats', 'eco_reports']);
    
    // Sync stats if extension has newer data
    if (extensionData.eco_sustainability_stats) {
      const localStats = JSON.parse(localStorage.getItem('eco_sustainability_stats') || JSON.stringify(getDefaultStats()));
      const extensionStats = extensionData.eco_sustainability_stats;
      
      // Compare timestamps to determine which is newer
      const localTime = new Date(localStats.lastUpdated || 0).getTime();
      const extensionTime = new Date(extensionStats.lastUpdated || 0).getTime();
      
      // Merge stats (use the most recent data)
      const mergedStats = extensionTime > localTime ? {
        ...localStats,
        ...extensionStats,
        lastSync: new Date().toISOString()
      } : {
        ...extensionStats,
        ...localStats,
        lastSync: new Date().toISOString()
      };
      
      // Update both storages
      localStorage.setItem('eco_sustainability_stats', JSON.stringify(mergedStats));
      await chrome.storage.local.set({ eco_sustainability_stats: mergedStats });
      
      console.log('📊 Stats synchronized between local and extension storage');
    }
    
    // Sync reports with enhanced duplicate prevention
    if (extensionData.eco_reports && extensionData.eco_reports.length > 0) {
      const localReports = JSON.parse(localStorage.getItem('eco_reports') || '[]');
      const extensionReports = extensionData.eco_reports;
      
      console.log(`📱 Merging reports: Local(${localReports.length}) + Extension(${extensionReports.length})`);
      
      // Enhanced merge with duplicate prevention
      const mergedReports = [...localReports];
      const existingSignatures = new Set(localReports.map(r => createReportSignature(r)));
      const existingIds = new Set(localReports.map(r => r.id));
      
      extensionReports.forEach(extReport => {
        const signature = createReportSignature(extReport);
        
        // Skip if duplicate by ID or signature
        if (existingIds.has(extReport.id) || existingSignatures.has(signature)) {
          return;
        }
        
        // Clean and add the report
        const cleanedReport = cleanReportData({
          ...extReport,
          source: extReport.source || 'extension'
        });
        
        mergedReports.push(cleanedReport);
        existingSignatures.add(signature);
        existingIds.add(cleanedReport.id);
      });
      
      // Sort by date (newest first) and limit to 100 reports
      mergedReports.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      if (mergedReports.length > 100) {
        mergedReports.splice(100);
      }
      
      // Update both storages
      localStorage.setItem('eco_reports', JSON.stringify(mergedReports));
      await chrome.storage.local.set({ eco_reports: mergedReports });
      
      console.log(`📋 Reports synchronized: Final count(${mergedReports.length})`);
    }
    
  } catch (error) {
    console.error('Extension sync failed:', error);
  }
};

/**
 * Update sustainability statistics when a product is analyzed
 */
export const updateSustainabilityStats = async (score, description, isPurchase = false, source = 'manual') => {
  try {
    console.log(`📈 Updating stats: Score(${score}), Purchase(${isPurchase}), Source(${source})`);
    
    // Get current stats
    const currentStats = JSON.parse(localStorage.getItem('eco_sustainability_stats') || JSON.stringify(getDefaultStats()));
    
    // Calculate carbon savings for this product
    const carbonSavedThisProduct = calculateCarbonSavings(score, description, isPurchase);
    
    // Update stats
    const updatedStats = {
      ...currentStats,
      productsAnalyzed: currentStats.productsAnalyzed + 1,
      ecoFriendlyPurchases: currentStats.ecoFriendlyPurchases + (isPurchase && score >= 7 ? 1 : 0),
      carbonSaved: Math.round((currentStats.carbonSaved + carbonSavedThisProduct) * 100) / 100,
      lastUpdated: new Date().toISOString(),
      version: '2.0'
    };
    
    // Save to localStorage
    localStorage.setItem('eco_sustainability_stats', JSON.stringify(updatedStats));
    
    // Sync with extension if available
    if (isExtensionAvailable()) {
      try {
        await chrome.storage.local.set({ eco_sustainability_stats: updatedStats });
        console.log('📊 Stats synced with extension');
      } catch (error) {
        console.error('Failed to sync stats with extension:', error);
      }
    }
    
    // Create event data for components
    const eventData = {
      ...updatedStats,
      carbonSavedThisProduct,
      source,
      isEcoFriendly: score >= 7,
      isPurchase
    };
    
    // Dispatch custom event for real-time updates across components
    window.dispatchEvent(new CustomEvent('eco_stats_updated', { 
      detail: eventData 
    }));
    
    console.log('✅ Stats updated successfully');
    return eventData;
    
  } catch (error) {
    console.error('Error updating sustainability stats:', error);
    throw error;
  }
};

/**
 * Get current sustainability statistics with backend sync
 */
export const getSustainabilityStats = async () => {
  try {
    // Sync with extension first
    await syncWithExtension();
    
    // Get local stats
    const localStats = JSON.parse(localStorage.getItem('eco_sustainability_stats') || JSON.stringify(getDefaultStats()));
    
    // Try to sync with backend and get combined view
    const backendSync = await syncWithBackend();
    
    return {
      ...localStats,
      backendSync,
      combinedView: {
        totalAnalyzed: localStats.productsAnalyzed + (backendSync?.backendStats?.totalAnalyzed || 0),
        totalEcoFriendly: localStats.ecoFriendlyPurchases + (backendSync?.backendStats?.ecoFriendly || 0),
        totalCarbonSaved: localStats.carbonSaved + (backendSync?.backendStats?.carbonSaved || 0)
      }
    };
    
  } catch (error) {
    console.error('Error getting sustainability stats:', error);
    
    // Return local stats as fallback
    const localStats = JSON.parse(localStorage.getItem('eco_sustainability_stats') || JSON.stringify(getDefaultStats()));
    return {
      ...localStats,
      backendSync: { backendConnected: false, error: error.message },
      combinedView: {
        totalAnalyzed: localStats.productsAnalyzed,
        totalEcoFriendly: localStats.ecoFriendlyPurchases,
        totalCarbonSaved: localStats.carbonSaved
      }
    };
  }
};

/**
 * Sync with backend and get combined statistics
 */
export const syncWithBackend = async () => {
  try {
    const backendHealth = await checkBackendHealth();
    if (backendHealth.status === 'operational') {
      const backendStats = await getBackendStats();
      
      // Store backend sync info
      const syncInfo = {
        lastBackendSync: new Date().toISOString(),
        backendStats: backendStats,
        backendConnected: true
      };
      
      localStorage.setItem('eco_backend_sync', JSON.stringify(syncInfo));
      return syncInfo;
    }
  } catch (error) {
    console.warn('Backend sync failed:', error);
    
    // Mark backend as disconnected
    const syncInfo = {
      lastBackendSync: new Date().toISOString(),
      backendStats: { totalAnalyzed: 0, ecoFriendly: 0, carbonSaved: 0, averageScore: 0 },
      backendConnected: false,
      error: error.message
    };
    
    localStorage.setItem('eco_backend_sync', JSON.stringify(syncInfo));
    return syncInfo;
  }
};

/**
 * Reset sustainability statistics
 */
export const resetSustainabilityStats = async () => {
  try {
    const resetStats = {
      ...getDefaultStats(),
      resetDate: new Date().toISOString(),
      previousStats: JSON.parse(localStorage.getItem('eco_sustainability_stats') || '{}')
    };
    
    // Update localStorage
    localStorage.setItem('eco_sustainability_stats', JSON.stringify(resetStats));
    
    // Update extension storage if available
    if (isExtensionAvailable()) {
      try {
        await chrome.storage.local.set({ eco_sustainability_stats: resetStats });
        console.log('Stats reset synced with extension');
      } catch (error) {
        console.error('Failed to sync reset with extension:', error);
      }
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('eco_stats_updated', { 
      detail: { ...resetStats, isReset: true }
    }));
    
    console.log('Sustainability stats reset');
    return resetStats;
    
  } catch (error) {
    console.error('Error resetting sustainability stats:', error);
    throw error;
  }
};

/**
 * Get sustainability reports without duplicates
 */
export const getSustainabilityReports = async (options = {}) => {
  try {
    console.log('📋 Getting sustainability reports...');
    
    // Sync with extension first
    await syncWithExtension();
    
    // Get all reports
    const allReports = JSON.parse(localStorage.getItem('eco_reports') || '[]');
    
    console.log(`📊 Found ${allReports.length} total reports`);
    
    // Apply filters
    let filteredReports = allReports;
    
    if (options.source) {
      filteredReports = filteredReports.filter(report => report.source === options.source);
    }
    
    if (options.minScore) {
      filteredReports = filteredReports.filter(report => report.score >= options.minScore);
    }
    
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredReports = filteredReports.filter(report => 
        (report.title || '').toLowerCase().includes(searchTerm) ||
        (report.description || '').toLowerCase().includes(searchTerm) ||
        (report.justification || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by date (newest first)
    filteredReports.sort((a, b) => {
      const dateA = new Date(a.date || a.timestamp || 0);
      const dateB = new Date(b.date || b.timestamp || 0);
      return dateB - dateA;
    });
    
    // Apply pagination if requested
    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      filteredReports = filteredReports.slice(start, end);
    }
    
    console.log(`📋 Returning ${filteredReports.length} filtered reports`);
    return filteredReports;
    
  } catch (error) {
    console.error('Error getting sustainability reports:', error);
    
    // Return empty array as fallback
    return [];
  }
};

/**
 * Initialize sustainability tracking system
 */
export const initializeSustainabilityTracking = async () => {
  try {
    console.log('🚀 Initializing enhanced sustainability tracking...');
    
    // Clean up any corrupted data
    try {
      const reports = JSON.parse(localStorage.getItem('eco_reports') || '[]');
      const cleanedReports = reports.map(report => cleanReportData(report));
      localStorage.setItem('eco_reports', JSON.stringify(cleanedReports));
    } catch (error) {
      console.warn('Cleaning up corrupted report data:', error);
      localStorage.setItem('eco_reports', '[]');
    }
    
    // Sync with extension on startup
    await syncWithExtension();
    
    // Sync with backend
    await syncWithBackend();
    
    // Set up periodic sync (every 5 minutes)
    setInterval(async () => {
      try {
        await syncWithExtension();
        await syncWithBackend();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, 5 * 60 * 1000);
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'eco_sustainability_stats' || event.key === 'eco_reports') {
        // Notify components of external changes
        window.dispatchEvent(new CustomEvent('eco_stats_external_update', {
          detail: { key: event.key, newValue: event.newValue }
        }));
      }
    });
    
    console.log('✅ Enhanced sustainability tracking initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize sustainability tracking:', error);
  }
};

// Export all functions
export default {
  updateSustainabilityStats,
  getSustainabilityStats,
  resetSustainabilityStats,
  getSustainabilityReports,
  saveSustainabilityReport,
  deleteSustainabilityReport,
  initializeSustainabilityTracking,
  syncWithExtension,
  syncWithBackend
};