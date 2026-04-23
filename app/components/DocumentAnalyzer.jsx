'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function DocumentAnalyzer() {
  const [user, setUser] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleGoogleSuccess = (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    setUser({ name: payload.name, email: payload.email, tier: 'free' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setAnalysis(null);
      setError(null);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background:'white', padding:'2.5rem', borderRadius:'12px', textAlign:'center', width:'90%', maxWidth:'400px' }}>
          <h1 style={{ fontSize:'32px', fontWeight:'600', marginBottom:'8px', color:'#333' }}>DocScan</h1>
          <p style={{ fontSize:'14px', color:'#666', marginBottom:'2rem' }}>Real estate document analysis for professionals</p>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Login failed')} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5' }}>
      <div style={{ background:'white', borderBottom:'1px solid #e0e0e0', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'600', color:'#333' }}>DocScan</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'14px', color:'#666' }}>{user.email}</span>
          <button onClick={() => setUser(null)} style={{ padding:'8px 16px', background:'transparent', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem' }}>
        {!analysis ? (
          <>
            <h2 style={{ fontSize:'20px', fontWeight:'600', marginBottom:'1rem', color:'#333' }}>Upload a Document</h2>
            <div style={{ border:'2px dashed #667eea', borderRadius:'8px', padding:'2rem', textAlign:'center', background:'#f9f9ff', marginBottom:'1rem' }}>
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ width:'100%', marginBottom:'1rem' }} />
              {uploadedFile && <p style={{ color:'#667eea', fontWeight:'500' }}>📄 {uploadedFile.name}</p>}
              <p style={{ fontSize:'13px', color:'#999', margin:'8px 0 0' }}>HOA documents · Seller disclosures · Inspection reports</p>
            </div>

            {error && <p style={{ color:'red', fontSize:'14px', marginBottom:'1rem' }}>{error}</p>}

            <button
              onClick={analyzeDocument}
              disabled={!uploadedFile || analyzing}
              style={{ width:'100%', padding:'12px', background: uploadedFile ? '#667eea' : '#ccc', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', fontWeight:'600', cursor: uploadedFile ? 'pointer' : 'not-allowed' }}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Document'}
            </button>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px', marginTop:'2rem' }}>
              {[['Material Facts','AI flags issues affecting property value'],['Risk Assessment','Compliance & litigation risks'],['Export Reports','Send summaries to clients']].map(([title, text]) => (
                <div key={title} style={{ background:'white', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e0e0e0', textAlign:'center' }}>
                  <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'8px', color:'#333' }}>{title}</h3>
                  <p style={{ fontSize:'13px', color:'#666', margin:0 }}>{text}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ background:'white', padding:'2rem', borderRadius:'8px', border:'1px solid #e0e0e0' }}>
            <button onClick={() => { setAnalysis(null); setUploadedFile(null); }} style={{ padding:'8px 16px', background:'transparent', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'14px', marginBottom:'1.5rem' }}>← Back</button>
            <h2 style={{ fontSize:'20px', fontWeight:'600', marginBottom:'1.5rem', color:'#333' }}>Analysis Results</h2>

            {analysis.risks?.length > 0 && (
              <div style={{ background:'#fff3cd', border:'1px solid #ffc107', borderRadius:'6px', padding:'1.5rem', marginBottom:'1.5rem' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'600', color:'#856404', marginBottom:'12px' }}>⚠️ Material Issues Found</h3>
                <ul style={{ paddingLeft:'20px', margin:0 }}>
                  {analysis.risks.map((risk, i) => (
                    <li key={i} style={{ fontSize:'14px', color:'#555', marginBottom:'8px' }}>
                      <strong>{risk.category} ({risk.severity}):</strong> {risk.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.summary && (
              <div style={{ background:'#e7f3ff', border:'1px solid #b3d9ff', borderRadius:'6px', padding:'1.5rem', marginBottom:'1.5rem' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'600', color:'#004085', marginBottom:'12px' }}>Summary</h3>
                <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.6', margin:0 }}>{analysis.summary}</p>
              </div>
            )}

            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <button style={{ flex:1, minWidth:'120px', padding:'12px', background:'white', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>📧 Email Report</button>
              <button style={{ flex:1, minWidth:'120px', padding:'12px', background:'white', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>📥 Download PDF</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:'1px solid #e0e0e0', padding:'1rem', textAlign:'center', fontSize:'13px', color:'#999' }}>
        Plan: <strong>{user.tier}</strong> · {user.tier === 'free' ? '1 doc/month' : 'Unlimited'}
      </div>
    </div>
  );
}
