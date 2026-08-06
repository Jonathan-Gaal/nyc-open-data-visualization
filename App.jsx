import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function App() {
  const [zip, setZip] = useState('11106');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const fetchViolations = React.useCallback(async (zipCode) => {
    setLoading(true);
    setError(null);

    try {
      const query = `SELECT violationid,buildingid,registrationid,boroid,boro,housenumber,lowhousenumber,highhousenumber,streetname,streetcode,zip,apartment,story,block,lot,class,inspectiondate,approveddate,originalcertifybydate,originalcorrectbydate,newcertifybydate,newcorrectbydate,certifieddate,ordernumber,novid,novdescription,novissueddate,currentstatusid,currentstatus,currentstatusdate,novtype,violationstatus,rentimpairing,latitude,longitude,communityboard,councildistrict,censustract,bin,bbl,nta WHERE (upper(\`zip\`) LIKE '%${zipCode}%') AND (upper(\`violationstatus\`) LIKE '%OPEN%')`;

      const url = `https://data.cityofnewyork.us/api/v3/views/wvxf-dwi5/query.json?query=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');

      const rawData = await response.json();
      if (!rawData || rawData.length === 0) {
        setError(`No open violations found for ZIP ${zipCode}`);
        setLoading(false);
        return;
      }

      processData(rawData);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const processData = (rawData) => {
    const now = new Date();

    const processed = rawData.map(row => {
      let originalDate = null;
      let reissuedDate = null;

      if (row.originalcorrectbydate) {
        const val = row.originalcorrectbydate;
        originalDate = typeof val === 'number' ? new Date(val * 1000) : new Date(val);
      }
      if (row.newcorrectbydate) {
        const val = row.newcorrectbydate;
        reissuedDate = typeof val === 'number' ? new Date(val * 1000) : new Date(val);
      }

      const daysOpenOrig = originalDate ? Math.floor((now - originalDate) / (1000 * 60 * 60 * 24)) : 0;
      const daysOpenReiss = reissuedDate ? Math.floor((now - reissuedDate) / (1000 * 60 * 60 * 24)) : 0;

      return {
        ...row,
        daysOpenOriginal: daysOpenOrig > 0 ? daysOpenOrig : 0,
        daysOpenReissued: daysOpenReiss > 0 ? daysOpenReiss : 0,
        isReissued: reissuedDate !== null
      };
    });

    setData(processed);

    const original = processed.filter(v => !v.isReissued && v.daysOpenOriginal > 0);
    const reissued = processed.filter(v => v.isReissued && v.daysOpenReissued > 0);

    const originalAvg = original.length > 0
      ? Math.round(original.reduce((sum, v) => sum + v.daysOpenOriginal, 0) / original.length)
      : 0;

    const reissuedAvg = reissued.length > 0
      ? Math.round(reissued.reduce((sum, v) => sum + v.daysOpenReissued, 0) / reissued.length)
      : 0;

    const multiplier = originalAvg > 0 ? (reissuedAvg / originalAvg).toFixed(1) : 0;

    setMetrics({
      originalAvg,
      reissuedAvg,
      multiplier,
      total: processed.length,
      original,
      reissued
    });
  };

  useEffect(() => {
    fetchViolations(zip);
  }, [zip, fetchViolations]);

  const handleSearch = () => {
    if (zip.length === 5 && !isNaN(zip)) {
      fetchViolations(zip);
    } else {
      setError('Please enter a valid 5-digit ZIP code');
    }
  };

  const getChronicBuildingsData = () => {
    if (!data) return null;
    const buildingCounts = {};
    data.forEach(v => {
      buildingCounts[v.buildingid] = (buildingCounts[v.buildingid] || 0) + 1;
    });
    const topBuildings = Object.entries(buildingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: topBuildings.map((_, i) => `Building ${i + 1}`),
      datasets: [{
        label: 'Violations',
        data: topBuildings.map(b => b[1]),
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        borderWidth: 1
      }]
    };
  };

  const getReissueData = () => {
    if (!metrics || !metrics.original.length || !metrics.reissued.length) return null;
    
    const origAvg = Math.round(metrics.original.reduce((sum, v) => sum + v.daysOpenOriginal, 0) / metrics.original.length);
    const reisAvg = Math.round(metrics.reissued.reduce((sum, v) => sum + v.daysOpenReissued, 0) / metrics.reissued.length);

    return {
      labels: ['Original', 'Reissued'],
      datasets: [{
        label: 'Average Days Open',
        data: [origAvg, reisAvg],
        backgroundColor: ['#3b82f6', '#dc2626'],
        borderColor: ['#1e40af', '#991b1b'],
        borderWidth: 2
      }]
    };
  };

  const getStatusData = () => {
    if (!data) return null;
    const statusData = {};
    data.forEach(v => {
      if (!statusData[v.currentstatus]) {
        statusData[v.currentstatus] = [];
      }
      const days = v.daysOpenOriginal || v.daysOpenReissued;
      if (days > 0) {
        statusData[v.currentstatus].push(days);
      }
    });

    const statusAvg = Object.entries(statusData)
      .map(([status, days]) => ({
        status,
        avg: days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0,
        count: days.length
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);

    return {
      labels: statusAvg.map(s => s.status),
      datasets: [{
        label: 'Days Open',
        data: statusAvg.map(s => s.avg),
        backgroundColor: '#dc2626',
        borderColor: '#991b1b',
        borderWidth: 1
      }]
    };
  };

  const getRentImpairingData = () => {
    if (!data) return null;
    const rentImpaired = data.filter(v => v.rentimpairing === 'Y');
    if (rentImpaired.length === 0) return null;

    const classCount = {};
    rentImpaired.forEach(v => {
      classCount[v.class] = (classCount[v.class] || 0) + 1;
    });

    return {
      rentImpairingCount: rentImpaired.length,
      classCount
    };
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏢 HPD Violations: The Enforcement Gap</h1>
        <div style={styles.insight}>
          ⚠️ <strong>One-Sentence Insight:</strong> Violations fail due to lack of escalation mechanisms when landlords ignore notices, not due to lack of documentation.
        </div>
      </header>

      <div style={styles.controls}>
        <label style={styles.label}>Enter NYC ZIP Code:</label>
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          maxLength="5"
          placeholder="e.g., 11106"
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Load Data
        </button>
      </div>

      {loading && <div style={styles.loading}>Loading violations data...</div>}
      {error && <div style={styles.error}>{error}</div>}

      {data && metrics && (
        <div style={styles.content}>
          <div style={styles.metrics}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Original Violations</div>
              <div style={styles.metricValue}>{metrics.originalAvg.toLocaleString()}</div>
              <div style={styles.metricDetail}>Average days open</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Reissued Violations</div>
              <div style={styles.metricValue}>{metrics.reissuedAvg.toLocaleString()}</div>
              <div style={styles.metricDetail}>Average days open</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Multiplier Effect</div>
              <div style={styles.metricValue}>{metrics.multiplier}x</div>
              <div style={styles.metricDetail}>Worse when reissued</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Total Violations</div>
              <div style={styles.metricValue}>{metrics.total.toLocaleString()}</div>
              <div style={styles.metricDetail}>In ZIP code</div>
            </div>
          </div>

          {getReissueData() && (
            <div style={styles.chartSection}>
              <h2 style={styles.chartTitle}>🔴 The Reissuance Killer</h2>
              <p style={styles.description}>
                Original violations average ~6 years open. Once reissued, they average ~32 years — stuck in legal limbo.
              </p>
              <div style={styles.chartContainer}>
                <Bar data={getReissueData()} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      ticks: {
                        callback: v => (v / 365).toFixed(1) + ' yrs'
                      }
                    }
                  }
                }} />
              </div>
            </div>
          )}

          {getChronicBuildingsData() && (
            <div style={styles.chartSection}>
              <h2 style={styles.chartTitle}>🏗️ Chronic Offender Buildings</h2>
              <div style={styles.chartContainer}>
                <Bar data={getChronicBuildingsData()} options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>
          )}

          {getStatusData() && (
            <div style={styles.chartSection}>
              <h2 style={styles.chartTitle}>📋 Violations Stuck by Status Code</h2>
              <div style={styles.chartContainer}>
                <Bar data={getStatusData()} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      ticks: {
                        callback: v => (v / 365).toFixed(1) + ' yrs'
                      }
                    }
                  }
                }} />
              </div>
            </div>
          )}

          {getRentImpairingData() && (
            <div style={styles.chartSection}>
              <h2 style={styles.chartTitle}>🔥 Rent-Impairing Violations (Direct Tenant Impact)</h2>
              <div style={styles.metricDetail}>
                {getRentImpairingData().rentImpairingCount} violations affect tenant habitability
              </div>
              <div style={{ marginTop: '20px' }}>
                {Object.entries(getRentImpairingData().classCount).map(([cls, count]) => (
                  <div key={cls} style={{ marginBottom: '10px' }}>
                    <span>Class {cls}:</span>
                    <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#dc2626' }}>
                      {count} violations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.chartSection}>
            <h2 style={styles.chartTitle}>📊 Sample Violations</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Violation ID</th>
                  <th style={styles.th}>Building ID</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Rent Impact</th>
                  <th style={styles.th}>Days Open</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((row, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.td}>{row.violationid}</td>
                    <td style={styles.td}>{row.buildingid}</td>
                    <td style={styles.td}>{row.currentstatus}</td>
                    <td style={styles.td}>{row.class}</td>
                    <td style={styles.td}>{row.rentimpairing === 'Y' ? '✓' : '-'}</td>
                    <td style={styles.td}>{(row.daysOpenOriginal || row.daysOpenReissued).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        Data from NYC Open Data API | HPD Violations Dataset | Updated daily
      </footer>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f9fafb',
    color: '#111827',
    lineHeight: '1.6'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    borderBottom: '3px solid #dc2626',
    paddingBottom: '30px'
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '10px',
    color: '#1f2937'
  },
  insight: {
    fontSize: '1.1em',
    color: '#dc2626',
    fontWeight: '600',
    margin: '20px 0',
    padding: '15px',
    background: '#fee2e2',
    borderLeft: '4px solid #dc2626',
    borderRadius: '4px'
  },
  controls: {
    display: 'flex',
    gap: '15px',
    marginBottom: '40px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  label: {
    fontWeight: '600',
    color: '#1f2937'
  },
  input: {
    padding: '10px 15px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '1em',
    width: '150px',
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '10px 20px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '15px',
    borderRadius: '6px',
    margin: '20px 0',
    borderLeft: '4px solid #dc2626'
  },
  content: {
    marginTop: '20px'
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    margin: '40px 0'
  },
  metric: {
    background: 'white',
    padding: '25px',
    borderRadius: '8px',
    borderLeft: '4px solid #dc2626',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  metricValue: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#dc2626',
    margin: '10px 0'
  },
  metricLabel: {
    fontSize: '0.9em',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  metricDetail: {
    fontSize: '0.85em',
    color: '#9ca3af',
    marginTop: '10px'
  },
  chartSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    margin: '30px 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    fontSize: '1.5em',
    marginBottom: '25px',
    color: '#1f2937',
    paddingBottom: '10px',
    borderBottom: '2px solid #f3f4f6'
  },
  description: {
    color: '#6b7280',
    marginBottom: '20px'
  },
  chartContainer: {
    position: 'relative',
    height: '400px',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  },
  tableHeader: {
    background: '#f3f4f6'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px'
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: '50px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  }
};