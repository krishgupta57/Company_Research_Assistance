import React from 'react';
import { Globe, ExternalLink, Phone, MapPin, Package, Target, Users, Link as LinkIcon, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ResultsView({ data, sendToDiscord, discordStatus }) {
  if (!data) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(24, 24, 27);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RELU CONSULTANCY · COMPANY INTELLIGENCE REPORT", 14, 12);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(data.name.toUpperCase(), 14, 24);

    let y = 45;

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(11);
    doc.text("COMPANY INFORMATION", 14, y);
    
    y += 6;
    doc.autoTable({
        startY: y,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2.5, textColor: [60, 60, 60] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35, textColor: [20, 20, 20] } },
        body: [
            ['Official Website', data.website],
            ['Phone Number', data.phone || 'Not publicly listed'],
            ['Headquarters', data.address || 'Not publicly listed']
        ],
        margin: { left: 14 }
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTS & SERVICES", 14, y);
    
    y += 8;
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    (data.products || []).forEach(p => {
        doc.text(`•  ${p}`, 16, y);
        y += 6;
    });

    y += 8;

    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.text("AI-GENERATED PAIN POINTS", 14, y);
    
    y += 8;
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    (data.painPoints || []).forEach(p => {
        const splitText = doc.splitTextToSize(p, 175);
        doc.text("•", 16, y);
        doc.text(splitText, 22, y);
        y += (splitText.length * 5) + 3;
    });

    y += 8;
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.text("KEY COMPETITORS", 14, y);
    
    y += 6;
    const compBody = (data.competitors || []).map(c => [c.name, c.website]);
    doc.autoTable({
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [251, 191, 36], textColor: [0,0,0], fontStyle: 'bold' },
        styles: { fontSize: 9.5, cellPadding: 3 },
        head: [['Competitor Name', 'Website URL']],
        body: compBody,
        margin: { left: 14, right: 14 }
    });
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated automatically by AI on ${new Date().toLocaleDateString()}`, 14, 290);

    const pdfBlob = doc.output('blob');
    const filename = `${data.name.toLowerCase().replace(/\s+/g, '-')}-research-report.pdf`;
    doc.save(filename);

    sendToDiscord(pdfBlob, filename);
  };

  return (
    <div className="results-view fade-in">
      <div className="report-card">
        <div className="report-glow"></div>
        
        <div className="report-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
                <h2 className="report-title">{data.name}</h2>
                <a href={data.website} target="_blank" rel="noreferrer" className="report-link">
                  <Globe size={16} />
                  {data.website} 
                  <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                </a>
             </div>
             <span style={{ padding: '0.375rem 1rem', borderRadius: '9999px', background: 'var(--success-faded)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.1)' }}>
               <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
               Research Complete
             </span>
          </div>
        </div>

        <div className="grid-2">
          <div className="info-box">
            <div className="info-icon"><Phone size={20} /></div>
            <div>
              <span className="label" style={{ marginBottom: '0.25rem' }}>Phone Number</span>
              <span style={{ fontSize: '0.875rem', color: '#e4e4e7' }}>{data.phone || "Not publicly listed"}</span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-icon"><MapPin size={20} /></div>
            <div>
              <span className="label" style={{ marginBottom: '0.25rem' }}>Headquarters</span>
              <span style={{ fontSize: '0.875rem', color: '#e4e4e7', lineHeight: 1.3 }}>{data.address || "Not publicly listed"}</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-title text-muted"><Package size={16} className="text-primary" /> Products & Services</div>
          <div className="pill-container">
            {(data.products || []).map((p, i) => (
              <span key={i} className="pill">{p}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-title text-primary"><Target size={16} /> AI-Generated Pain Points</div>
          <ul className="pain-points-list">
            {(data.painPoints || []).map((p, i) => (
              <li key={i} className="pain-point-item">
                <div className="pain-point-num">{i+1}</div>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-title text-muted"><Users size={16} className="text-primary" /> Key Competitors</div>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            {(data.competitors || []).map((c, i) => (
              <a key={i} href={c.website} target="_blank" rel="noreferrer" className="competitor-card">
                <div>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{c.name}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{c.website}</span>
                </div>
                <ExternalLink size={16} className="text-muted" />
              </a>
            ))}
          </div>
        </div>
        
        {data.sources && data.sources.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
             <div className="section-title text-muted"><LinkIcon size={14} /> Sources Analysed</div>
             <div className="pill-container">
                {data.sources.map((s, i) => {
                    let hostname = s;
                    try { hostname = new URL(s).hostname.replace('www.', ''); } catch (e) {}
                    return (
                        <a key={i} href={s} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                            {hostname}
                        </a>
                    )
                })}
             </div>
          </div>
        )}

        <div className="report-footer">
          <button onClick={downloadPDF} className="btn-primary btn-lg" style={{ width: 'auto' }}>
            <Download size={20} /> Download PDF Report
          </button>
          
          {discordStatus === 'success' && (
            <span className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', background: 'var(--success-faded)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.875rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} /> Sent to Discord Successfully
            </span>
          )}
          {discordStatus === 'error' && (
            <span className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', background: 'var(--danger-faded)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.875rem', fontWeight: 700 }}>
              <AlertTriangle size={18} /> Failed to send to Discord
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
