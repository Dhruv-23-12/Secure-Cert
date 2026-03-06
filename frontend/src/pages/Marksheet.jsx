import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'react-qr-code';

/*
 * Marksheet React Component
 * Renders the UI-side marksheet for Preview and student-facing view.
 * Accepts props: studentData, subjects, backlogs, performance, resultStatus
 */
export default function Marksheet({
  studentData: propStudentData,
  subjects:    propSubjects,
  performance: propPerformance,
  backlogs:    propBacklogs,
  resultStatus: propResultStatus,
  certificateId: propCertId,
  hashValue:   propHashValue,
}) {
  /* ── Print styles ──────────────────────────────────────────────── */
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .marksheet-container, .marksheet-container * { visibility: visible; }
        .marksheet-container { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; }
        .no-print { display: none !important; }
        nav, footer { display: none !important; }
        @page { size: A4 portrait; margin: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  /* ── Data ──────────────────────────────────────────────────────── */
  const studentData = propStudentData || {
    studentName:  'YADAV DHRUVKUMAR PARESHBHAI',
    enrollmentNo: '23SE09CS019',
    course:       'B.TECH. (COMPUTER SCIENCE & ENGINEERING)',
    semester:     '7',
    academicYear: 'NOVEMBER 2025',
    institution:  'SCHOOL OF ENGINEERING',
    reportNo:     '2526RESE00349',
    date:         '05/02/2026',
    examSeatNo:   '',
  };

  const subjects = propSubjects || [
    {
      code: 'SECE4930',
      name: 'PROJECT/TRAINING',
      evaluationComponents: [
        { componentType: 'Theory',    credits: 9, grade: 'A',  gradePoint: 8 },
        { componentType: 'Practical', credits: 9, grade: 'A+', gradePoint: 9 },
      ],
    },
  ];

  const performance = propPerformance || {
    currentSemester: { registeredCredits: 18, earnedCredits: 18, spi: 8.0, sgpa: 8.0 },
    cumulative:      { earnedCredits: 118, cgpa: 6.36, backlogs: 0 },
  };

  const backlogs    = propBacklogs    || [];
  const resultStatus = propResultStatus || 'PASS';
  const certId      = propCertId      || studentData.reportNo || '';
  const hashValue   = propHashValue   || '';

  /* ── Helpers ───────────────────────────────────────────────────── */
  const FAIL_GRADES = new Set(['FF', 'F', 'II', 'US']);
  const isFailGrade = (g) => FAIL_GRADES.has((g || '').toUpperCase());

  const resultColor = () => {
    if (resultStatus === 'PASS')     return '#166534';
    if (resultStatus === 'ATKT')     return '#d97706';
    if (resultStatus === 'FAIL')     return '#dc2626';
    if (resultStatus === 'WITHHELD') return '#7c3aed';
    return '#6b7280';
  };

  /* ── PDF Download ──────────────────────────────────────────────── */
  const marksheetRef = useRef(null);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadPDF = async () => {
    if (!marksheetRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(marksheetRef.current, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
      });
      const imgData   = canvas.toDataURL('image/png');
      const pdfDoc    = await PDFDocument.create();
      const pdfW = 595.28, pdfH = 841.89;
      const ratio     = Math.min(pdfW / canvas.width, pdfH / canvas.height);
      const scaledW   = canvas.width  * ratio;
      const scaledH   = canvas.height * ratio;
      const page      = pdfDoc.addPage([pdfW, pdfH]);
      const pngImage  = await pdfDoc.embedPng(imgData);
      page.drawImage(pngImage, {
        x: (pdfW - scaledW) / 2,
        y: pdfH - scaledH,
        width:  scaledW,
        height: scaledH,
      });
      const pdfBytes  = await pdfDoc.save();
      const blob      = new Blob([pdfBytes], { type: 'application/pdf' });
      const url       = URL.createObjectURL(blob);
      const a         = document.createElement('a');
      a.href = url;
      a.download = `marksheet_${studentData.enrollmentNo || 'student'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  /* ── Styles ──────────────────────────────────────────────────────── */
  const s = {
    page:         { width: '210mm', minHeight: '297mm', backgroundColor: '#fff', fontFamily: "'Times New Roman', serif", color: '#000', margin: '0 auto' },
    border:       { border: '4px solid #8B4513', minHeight: 'calc(297mm - 44px)', padding: '16px 18px', display: 'flex', flexDirection: 'column' },
    header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #8B4513', paddingBottom: '8px', marginBottom: '10px' },
    uniTitle:     { fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' },
    uniSub:       { fontSize: '11px', margin: '1px 0' },
    reportTitle:  { color: '#dc2626', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', margin: '8px 0 10px', textDecoration: 'underline', textTransform: 'uppercase' },
    infoTable:    { width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '8px' },
    td:           { border: '1px solid #000', padding: '3px 5px' },
    tdLabel:      { border: '1px solid #000', padding: '3px 5px', fontWeight: 'bold', backgroundColor: '#f3f4f6', width: '18%' },
    thBlue:       { border: '1px solid #000', padding: '3px 5px', backgroundColor: '#dbeafe', fontWeight: 'bold', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase' },
    subjectRow:   { backgroundColor: '#f9fafb', fontWeight: 'bold' },
    componentRow: { backgroundColor: '#fff' },
    perfBox:      { flex: 1, border: '1px solid #000' },
    perfHeader:   { backgroundColor: '#dbeafe', textAlign: 'center', padding: '3px', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' },
    perfRow:      { display: 'flex', borderBottom: '1px solid #d1d5db' },
    perfLabel:    { flex: 2, padding: '2px 4px', borderRight: '1px solid #d1d5db', fontWeight: 'bold', fontSize: '10px' },
    perfValue:    { flex: 1, padding: '2px 4px', textAlign: 'center', fontSize: '10px' },
    resultBadge:  { display: 'flex', alignItems: 'center', gap: '10px', border: '2px solid #374151', padding: '4px 10px', margin: '6px 0', borderRadius: '2px' },
    gradeTable:   { width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginBottom: '4px' },
    footerRow:    { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '8px', borderTop: '1px solid #9ca3af' },
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Download button */}
      <div className="no-print flex gap-3 mb-4 px-2">
        <button onClick={handleDownloadPDF} disabled={downloading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold text-sm">
          {downloading ? 'Generating PDF...' : '⬇ Download PDF'}
        </button>
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold">
          🖨 Print
        </button>
      </div>

      {/* Marksheet Content */}
      <div ref={marksheetRef} className="marksheet-container" style={{ padding: '22px 28px', ...s.page }}>
        <div style={s.border}>

          {/* Header */}
          <div style={s.header}>
            <div style={{ width: '14%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="52" height="52" viewBox="0 0 32 32">
                <path fill="#8B4513" d="M16 2L4 7V14C4 20.732 9.28 27.292 16 30C22.72 27.292 28 20.732 28 14V7L16 2ZM16 27.816C10.424 25.472 6 19.936 6 14V8.2L16 4.2L26 8.2V14C26 19.936 21.576 25.472 16 27.816Z"/>
                <path fill="#fff" d="M14.2929 19.7071L21.2929 12.7071C21.6834 12.3166 21.6834 11.6834 21.2929 11.2929C20.9024 10.9024 20.2692 10.9024 19.8787 11.2929L13.5858 17.5858L10.7071 14.7071C10.3166 14.3166 9.68342 14.3166 9.29289 14.7071C8.90237 15.0976 8.90237 15.7308 9.29289 16.1213L12.8787 19.7071C13.2692 20.0976 13.9024 20.0976 14.2929 19.7071Z"/>
              </svg>
            </div>
            <div style={{ width: '72%', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#8B4513' }}>PPSU</div>
              <div style={s.uniTitle}>P P SAVANI UNIVERSITY</div>
              <div style={s.uniSub}>NH 8, GETCO, Near Biltech, Village: Dhamdod Kosamba</div>
              <div style={s.uniSub}>Dist.: Surat – 394125</div>
              <div style={{ ...s.uniSub, color: '#0000FF' }}>www.ppsu.ac.in</div>
            </div>
            <div style={{ width: '14%', textAlign: 'right' }}>
              <span style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 'bold', padding: '3px 7px', fontSize: '9px', borderRadius: '4px' }}>NAAC A+ GRADE</span>
            </div>
          </div>

          {/* Title */}
          <div style={s.reportTitle}>OFFICIAL MARKSHEET</div>

          {/* Date/Report Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
            <span>Date: {studentData.date || new Date().toLocaleDateString('en-GB')}</span>
            <span>Report No.: {studentData.reportNo || certId}</span>
          </div>

          {/* Student Info Table */}
          <table style={s.infoTable}>
            <tbody>
              <tr>
                <td style={s.tdLabel}>NAME OF STUDENT</td>
                <td style={{ ...s.td, fontWeight: 'bold' }} colSpan={3}>{studentData.studentName}</td>
              </tr>
              <tr>
                <td style={s.tdLabel}>ENROLLMENT NO.</td>
                <td style={{ ...s.td, width: '32%' }}>{studentData.enrollmentNo}</td>
                <td style={s.tdLabel}>EXAM SEAT NO.</td>
                <td style={s.td}>{studentData.examSeatNo || '—'}</td>
              </tr>
              <tr>
                <td style={s.tdLabel}>SEMESTER</td>
                <td style={s.td}>{studentData.semester}</td>
                <td style={s.tdLabel}>MONTH-YEAR</td>
                <td style={s.td}>{studentData.academicYear}</td>
              </tr>
              <tr>
                <td style={s.tdLabel}>INSTITUTION</td>
                <td style={s.td} colSpan={3}>{studentData.institution}</td>
              </tr>
              <tr>
                <td style={s.tdLabel}>PROGRAMME</td>
                <td style={s.td} colSpan={3}>{studentData.course}</td>
              </tr>
            </tbody>
          </table>

          {/* Course Performance Table */}
          <table style={{ ...s.infoTable, marginBottom: '10px' }}>
            <thead>
              <tr>
                <th style={{ ...s.thBlue, width: '13%' }}>Course Code</th>
                <th style={{ ...s.thBlue, width: '38%' }}>Course Name / Component</th>
                <th style={{ ...s.thBlue, width: '13%' }}>Evaluation</th>
                <th style={{ ...s.thBlue, width: '9%' }}>Credits</th>
                <th style={{ ...s.thBlue, width: '9%' }}>Grade</th>
                <th style={{ ...s.thBlue, width: '9%' }}>Pts</th>
                <th style={{ ...s.thBlue, width: '9%' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, si) => {
                const comps = sub.evaluationComponents || [];
                if (comps.length > 0) {
                  return (
                    <React.Fragment key={si}>
                      <tr style={s.subjectRow}>
                        <td style={{ ...s.td, fontSize: '10px' }}>{sub.code}</td>
                        <td style={{ ...s.td, fontSize: '10px' }} colSpan={6}>{sub.name}</td>
                      </tr>
                      {comps.map((comp, ci) => {
                        const fail = comp.gradePoint === 0 || isFailGrade(comp.grade);
                        return (
                          <tr key={ci} style={s.componentRow}>
                            <td style={{ ...s.td, fontSize: '10px' }}></td>
                            <td style={{ ...s.td, fontSize: '10px', paddingLeft: '20px', fontStyle: 'italic', color: '#374151' }}>↳ {comp.componentType}</td>
                            <td style={{ ...s.td, fontSize: '10px', textAlign: 'center' }}>{comp.componentType}</td>
                            <td style={{ ...s.td, fontSize: '10px', textAlign: 'center' }}>{comp.credits}</td>
                            <td style={{ ...s.td, fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: fail ? '#dc2626' : '#166534' }}>{comp.grade}</td>
                            <td style={{ ...s.td, fontSize: '10px', textAlign: 'center' }}>{comp.gradePoint ?? '—'}</td>
                            <td style={{ ...s.td, fontSize: '9px', textAlign: 'center', color: fail ? '#dc2626' : '#166534' }}>{fail ? 'FAIL' : 'PASS'}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                }
                // Legacy flat subject
                const failFlat = isFailGrade(sub.grade);
                return (
                  <tr key={si}>
                    <td style={{ ...s.td, fontSize: '10px' }}>{sub.code}</td>
                    <td style={{ ...s.td, fontSize: '10px' }}>{sub.name}</td>
                    <td style={{ ...s.td, fontSize: '10px', textAlign: 'center' }}>{sub.evaluation}</td>
                    <td style={{ ...s.td, fontSize: '10px', textAlign: 'center' }}>{sub.credits}</td>
                    <td style={{ ...s.td, fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: failFlat ? '#dc2626' : '#166534' }}>{sub.grade}</td>
                    <td style={{ ...s.td, fontSize: '10px', textAlign: 'center' }}>{sub.gradePoint ?? '—'}</td>
                    <td style={{ ...s.td, fontSize: '9px', textAlign: 'center', color: failFlat ? '#dc2626' : '#166534' }}>{failFlat ? 'FAIL' : 'PASS'}</td>
                  </tr>
                );
              })}
              {/* Padding rows */}
              {subjects.length < 4 && Array.from({ length: 4 - subjects.length }).map((_, i) => (
                <tr key={`pad-${i}`}><td style={{ ...s.td, height: '18px' }} colSpan={7}>&nbsp;</td></tr>
              ))}
            </tbody>
          </table>

          {/* Performance Summary */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
            <div style={s.perfBox}>
              <div style={s.perfHeader}>Current Semester Performance</div>
              {[
                ['REGISTERED CREDITS', performance.currentSemester?.registeredCredits ?? '—'],
                ['EARNED CREDITS',     performance.currentSemester?.earnedCredits     ?? '—'],
                ['SPI / SGPA',         (performance.currentSemester?.spi ?? performance.currentSemester?.sgpa ?? '—')],
              ].map(([l, v], i) => (
                <div key={i} style={{ ...s.perfRow, ...(i === 2 ? { borderBottom: 'none' } : {}) }}>
                  <div style={s.perfLabel}>{l}</div>
                  <div style={{ ...s.perfValue, fontWeight: i === 2 ? 'bold' : 'normal' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={s.perfBox}>
              <div style={s.perfHeader}>Cumulative Performance</div>
              {[
                ['EARNED CREDITS', performance.cumulative?.earnedCredits ?? '—'],
                ['CGPA / CPI',     performance.cumulative?.cgpa          ?? '—'],
                ['NO. OF BACKLOGS',performance.cumulative?.backlogs      ?? 0],
              ].map(([l, v], i) => (
                <div key={i} style={{ ...s.perfRow, ...(i === 2 ? { borderBottom: 'none' } : {}) }}>
                  <div style={s.perfLabel}>{l}</div>
                  <div style={{ ...s.perfValue, fontWeight: i === 1 ? 'bold' : 'normal' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Backlogs */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#dc2626', textTransform: 'uppercase', marginBottom: '3px' }}>
              {backlogs.length > 0 ? `⚠ Backlogs (${backlogs.length})` : 'Backlogs'}
            </div>
            {backlogs.length > 0 ? (
              <table style={{ ...s.gradeTable, border: '1px solid #000' }}>
                <thead>
                  <tr>
                    {['Course Code', 'Subject Name', 'Component', 'Grade', 'Status'].map(h => (
                      <th key={h} style={{ ...s.td, backgroundColor: '#fee2e2', fontSize: '9px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backlogs.map((bl, i) => (
                    <tr key={i}>
                      <td style={{ ...s.td, fontSize: '9px' }}>{bl.courseCode}</td>
                      <td style={{ ...s.td, fontSize: '9px' }}>{bl.subjectName}</td>
                      <td style={{ ...s.td, fontSize: '9px' }}>{bl.componentType}</td>
                      <td style={{ ...s.td, fontSize: '9px', color: '#dc2626', fontWeight: 'bold' }}>{bl.grade}</td>
                      <td style={{ ...s.td, fontSize: '9px' }}>{(bl.status || 'ACTIVE').toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: '10px', color: '#166534', fontStyle: 'italic' }}>✓ No Backlogs</div>
            )}
          </div>

          {/* Result Status */}
          <div style={s.resultBadge}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>FINAL RESULT:</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: resultColor() }}>
              {resultStatus || 'PASS'}
              {resultStatus === 'ATKT' && ' (Allowed To Keep Term)'}
            </span>
          </div>

          {/* Grade Patterns */}
          <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', marginBottom: '2px' }}>—: GRADE PATTERNS :—</div>
          <table style={s.gradeTable}>
            <thead>
              <tr>
                {['% Marks Range','90–100','80–89.99','70–79.99','60–69.99','50–59.99','45–49.99','40–44.99','0–39.99'].map(h => (
                  <th key={h} style={{ border: '1px solid #000', padding: '2px 3px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '2px 3px', fontWeight: 'bold', textAlign: 'center' }}>GRADE</td>
                {['O','A+','A','B+','B','C','P','F'].map(g => (
                  <td key={g} style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center' }}>{g}</td>
                ))}
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '2px 3px', fontWeight: 'bold', textAlign: 'center' }}>GRADE POINTS</td>
                {['10','9','8','7','6','5','4','0'].map(g => (
                  <td key={g} style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center' }}>{g}</td>
                ))}
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '2px 3px', fontWeight: 'bold', textAlign: 'center' }}>GTU GRADE</td>
                {['AA','AB','BB','BC','CC','CD','DD','FF/II'].map(g => (
                  <td key={g} style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center' }}>{g}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: '8px', textAlign: 'center', fontStyle: 'italic', marginBottom: '8px' }}>
            *S = Satisfactory, US = Unsatisfactory &nbsp;|&nbsp; SPI = Σ(Credits × Grade Points) / Σ(Credits)
          </div>

          {/* Footer */}
          <div style={s.footerRow}>
            <div style={{ textAlign: 'center' }}>
              {certId && certId !== 'PREVIEW' && hashValue ? (
                <QRCode value={hashValue || certId} size={64} />
              ) : (
                <div style={{ width: 64, height: 64, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#aaa' }}>QR</div>
              )}
              <div style={{ fontSize: '8px', marginTop: '2px' }}>Scan to Verify</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px' }}></div>
              <div style={{ borderTop: '1px solid #374151', width: '160px', marginBottom: '3px' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>CONTROLLER OF EXAMINATIONS</div>
              <div style={{ fontSize: '10px' }}>P P SAVANI UNIVERSITY</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px' }}></div>
              <div style={{ borderTop: '1px solid #374151', width: '140px', marginBottom: '3px' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>REGISTRAR</div>
              <div style={{ fontSize: '10px' }}>P P SAVANI UNIVERSITY</div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ fontSize: '8px', marginTop: '4px', borderTop: '1px solid #d1d5db', paddingTop: '3px' }}>
            This is a computer-generated marksheet; signature is not required. In case of discrepancy, office records will be considered final.
            Verify authenticity by scanning the QR code above.
          </div>

        </div>
      </div>
    </div>
  );
}
