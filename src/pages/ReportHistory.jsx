import React, { useState, useEffect } from 'react';
import { Search, Calendar, FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../utils/storage';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  // Load History from local storage
  useEffect(() => {
    db.getReports()
      .then(data => {
        if (data && Array.isArray(data)) {
          const flattened = data.map(r => ({
            ...r,
            patient_name: r.patients?.patient_name || r.patient_name || '',
            age: r.patients?.age || r.age || '',
            gender: r.patients?.gender || r.gender || '',
            contact_number: r.patients?.contact_number || r.contact_number || '',
            address: r.patients?.address || r.address || '',
            test_name: r.tests_performed 
              ? r.tests_performed.map(tp => tp.test_details?.name || 'Unknown').join(', ') 
              : (r.tests?.name || '')
          }));
          setReports(flattened);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? r.date === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Report History</h2>
      
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="form-group" style={{ flex: 1, margin: 0, minWidth: '250px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by Patient Name or Serial No..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <Calendar size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
             <input 
               type="date" 
               className="form-control" 
               value={dateFilter} 
               onChange={e => setDateFilter(e.target.value)} 
               style={{ paddingLeft: '2.5rem' }}
             />
          </div>
        </div>

        <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setDateFilter(''); }}>
          Clear Filters
        </button>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Serial Number</th>
              <th>Patient Name</th>
              <th>Test Performed</th>
              <th>Amount ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No reports found.</td></tr>
            ) : filteredReports.map(report => (
              <tr key={report.id}>
                <td>{new Date(report.date).toLocaleDateString()}</td>
                <td style={{ fontWeight: '500' }}>{report.serial_number}</td>
                <td>{report.patient_name}</td>
                <td>{report.test_name}</td>
                <td>{report.amount > 0 ? `$${report.amount.toFixed(2)}` : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }} onClick={() => navigate(`/preview/${report.id}`, { state: report })}>
                      <FileText size={16} /> View
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }} onClick={() => navigate(`/entry`, { state: { editReport: report } })}>
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
