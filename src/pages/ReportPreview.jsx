import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { db } from '../utils/storage';

export default function ReportPreview() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(state);
  const [testDetails, setTestDetails] = useState(null);

  useEffect(() => {
    // If we loaded without state (e.g., refresh), we'd fetch from storage by ID
    if (!report) {
      db.getReports().then(reports => {
        const found = reports.find(r => r.id.toString() === id?.toString());
        if (found) setReport(found);
      });
    }

    // Fetch all tests into a lookup map if needed, but storage.getReports now enriches them
    // However, if we came from 'state', we might not have 'test_details' for each tp
    if (report && report.tests_performed && !report.tests_performed[0]?.test_details) {
      db.getTests().then(allTests => {
        const enrichedTests = report.tests_performed.map(tp => ({
          ...tp,
          test_details: allTests.find(t => t.id.toString() === tp.test_id.toString()) || null
        }));
        setReport(prev => ({ ...prev, tests_performed: enrichedTests }));
      });
    } else if (report && report.test_id && !testDetails) {
      // Legacy single test fallback
      db.getTests().then(data => {
        if (data) {
          const found = data.find(t => t.id.toString() === report.test_id.toString());
          setTestDetails(found || data[0]);
        }
      });
    }
  }, [report]);

  const handlePrint = () => {
    window.print();
  };

  if (!report || (!testDetails && (!report.tests_performed || report.tests_performed.length === 0))) return <div>Loading...</div>;

  return (
    <div>
      <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} /> Print to PDF
        </button>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '1rem', width: '100%' }}>
        <div className="card preview-card" style={{ display: 'flex', flexDirection: 'column', padding: '3rem', width: '210mm', minWidth: '794px', minHeight: '297mm', margin: '0 auto', backgroundColor: 'white' }}>

          {/* Header */}
          {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {/* Logo Section */}
          {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
            <svg width="65" height="65" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M25,10 L60,10 C85,10 95,30 95,50 C95,70 85,90 60,90 L25,90 Z M35,20 L35,80 L60,80 C75,80 82,60 82,50 C82,40 75,20 60,20 Z" fill="#0d2b7c" />
              <rect x="8" y="10" width="10" height="80" fill="#0d2b7c" />
              <path d="M52,35 C44,48 44,60 52,65 C60,60 60,48 52,35 Z" fill="#0d2b7c" />
            </svg>
            <span style={{ color: '#0d2b7c', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>Dwaraka Lab</span>
          </div> */}

          {/* Center Text
          <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
            <h1 style={{ color: '#0d2b7c', fontFamily: 'Georgia, serif', fontSize: '2.8rem', letterSpacing: '1px', margin: '0 0 0.5rem 0' }}>DWARAKA LAB</h1>
            <p style={{ color: '#0d2b7c', fontSize: '1rem', fontWeight: 'bold', margin: '0' }}>
              Appadurai Complex, Poyyundar Kottai, Orathanadu Tk,
              Thanjavur Dt -614 902.
            </p>
          </div> */}

          {/* Contact Section */}
          {/* <div style={{ textAlign: 'left', color: '#0d2b7c', fontWeight: 'bold', fontSize: '1rem', minWidth: '160px' }}>

            <p style={{ margin: 0 }}>Cell: 89401 53903</p>
          </div> */}
          {/* </div> */}

          {/* Separator */}
          <div style={{ borderTop: '2px solid #ffffffff', borderBottom: '4px solid #ffffffff', height: '2px', display: 'flex', marginBottom: '1rem', marginTop: '10rem' }}></div>

          {/* Info Grid (All fields in one box) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', padding: '1rem', border: '1px solid #000', backgroundColor: '#fff' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <strong style={{ width: '120px', color: '#000', paddingBottom: '2px' }}>Patient Name</strong>
                <span style={{ marginRight: '0.5rem', paddingBottom: '2px' }}>:</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #000', paddingBottom: '2px' }}>{report.patient_name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <strong style={{ width: '120px', color: '#000', paddingBottom: '2px' }}>Age/Gender</strong>
                <span style={{ marginRight: '0.5rem', paddingBottom: '2px' }}>:</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #000', paddingBottom: '2px' }}>{report.age} Yrs / {report.gender}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <strong style={{ width: '120px', color: '#000', paddingBottom: '2px' }}>Contact</strong>
                <span style={{ marginRight: '0.5rem', paddingBottom: '2px' }}>:</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #000', paddingBottom: '2px' }}>{report.contact_number}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <strong style={{ width: '120px', color: '#000', paddingBottom: '2px' }}>Date</strong>
                <span style={{ marginRight: '0.5rem', paddingBottom: '2px' }}>:</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #000', paddingBottom: '2px' }}>{new Date(report.date).toLocaleDateString('en-GB')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <strong style={{ width: '120px', color: '#000', paddingBottom: '2px' }}>Report No</strong>
                <span style={{ marginRight: '0.5rem', paddingBottom: '2px' }}>:</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #000', paddingBottom: '2px' }}>{report.serial_number}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <strong style={{ width: '120px', color: '#000', paddingBottom: '2px' }}>Referred By</strong>
                <span style={{ marginRight: '0.5rem', paddingBottom: '2px' }}>:</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #000', paddingBottom: '2px' }}>{report.referred_by}</span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', textDecoration: 'underline', fontSize: '1.25rem' }}>LABORATORY REPORT</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem', border: '1px solid #000', textAlign: 'left', width: '40%' }}>TEST NAME</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #000', textAlign: 'center' }}>RESULT</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #000', textAlign: 'center' }}>UNIT</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #000', textAlign: 'center' }}>NORMAL RANGE</th>
                </tr>
              </thead>
              <tbody>
                {report.tests_performed && Array.isArray(report.tests_performed) ? (
                  report.tests_performed.map((tp, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '1rem', border: '1px solid #000' }}><strong>{tp.test_details?.name || 'Unknown'}</strong></td>
                      <td style={{ padding: '1rem', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{tp.result}</td>
                      <td style={{ padding: '1rem', border: '1px solid #000', textAlign: 'center' }}>{tp.test_details?.uom}</td>
                      <td style={{ padding: '1rem', border: '1px solid #000', textAlign: 'center' }}>{tp.test_details?.normal_range}</td>
                    </tr>
                  ))
                ) : (
                  // Fallback for legacy single-test reports
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #000' }}><strong>{testDetails?.name || 'Unknown'}</strong></td>
                    <td style={{ padding: '1rem', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{report.result}</td>
                    <td style={{ padding: '1rem', border: '1px solid #000', textAlign: 'center' }}>{testDetails?.uom}</td>
                    <td style={{ padding: '1rem', border: '1px solid #000', textAlign: 'center' }}>{testDetails?.normal_range}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          {report.remarks && (
            <div style={{ marginBottom: '3rem' }}>
              <strong>Remarks:</strong>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{report.remarks}</p>
            </div>
          )}

          {/* Footer/Signatures */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '4rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '200px', borderBottom: '1px solid var(--text-main)', marginBottom: '0.5rem' }}></div>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0' }}>Analyst</p>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
