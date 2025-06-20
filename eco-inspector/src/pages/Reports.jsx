import React, { useEffect, useState } from 'react';
import { fetchReports } from '../utils/api';
import './Reports.css';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetchReports(1, 100, {
          search: searchTerm,
          minScore: filterScore
        });
        console.log('Fetched reports from backend:', res);
        setReports(res.data?.analyses || res.analyses || []); // ✅ FIXED structure
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    };
    loadReports();
  }, [searchTerm, filterScore]);

  const handleDelete = async (id, title) => {
    const confirm = window.confirm(`Are you sure you want to delete report: "${title}"?`);
    if (confirm) {
      setReports(reports.filter((r) => r.id !== id && r._id !== id));
    }
  };

  const getScoreClass = (score) => {
    if (score >= 7) return 'high-score';
    if (score >= 4) return 'medium-score';
    return 'low-score';
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>Eco Inspector Reports</h2>
        <p>All analyzed product reports</p>

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setFilterScore(e.target.value)} defaultValue="">
            <option value="">All Scores</option>
            <option value="7">7+</option>
            <option value="5">5+</option>
            <option value="3">3+</option>
          </select>
        </div>
      </div>

      <div className="report-list">
        {reports.length === 0 && <p>No reports found.</p>}

        {reports.map((report, i) => (
          <div key={report._id || report.id || i} className={`report-card ${getScoreClass(report.score)}`}>
            <div className="report-header">
              <h3>{report.product_name || 'Untitled'}</h3>
              <span className="score">{report.score ?? 'N/A'}/10</span>
            </div>
            <div className="report-actions">
              <button className="view-btn" onClick={() => setSelectedReport(report)}>View</button>
              <button className="share-btn" onClick={() => navigator.clipboard.writeText(JSON.stringify(report))}>Share</button>
              <button className="delete-btn" onClick={() => handleDelete(report._id, report.title)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedReport.product_name}</h3>
              <span className="score large">{selectedReport.score}/10</span>
            </div>
            <div className="modal-body">
              <h4>Description</h4>
              <p>{selectedReport.description || 'No description available'}</p>
              <h4>Justification</h4>
              <p>{selectedReport.justification || 'No justification provided'}</p>
              <h4>Confidence</h4>
              <p>{selectedReport.confidence || 'Not available'}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
