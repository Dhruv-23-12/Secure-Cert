import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'react-qr-code';

/**
 * GeneralCertificate — A formal, ornate A4-landscape certificate
 * Props:
 *   studentName   — Recipient name
 *   certTitle     — Title after "Certificate of" (e.g. "Achievement")
 *   description   — Body text explaining the award
 *   issuingAuthority — Org name (default: P P Savani University)
 *   authorityTitle   — Signatory title (default: "Authorized Signatory")
 *   issueDate     — Date string
 *   validUntil    — Optional validity date
 *   certificateId — IRN / cert ID
 *   hashValue     — For QR code
 */
export default function GeneralCertificate({
  studentName      = 'Recipient Name',
  certTitle        = 'Achievement',
  description      = '',
  issuingAuthority = 'P P Savani University',
  authorityTitle   = 'Authorized Signatory',
  issueDate,
  validUntil,
  certificateId,
  hashValue,
}) {
  const certRef = useRef(null);
  const [downloading, setDownloading] = React.useState(false);

  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const pdfDoc = await PDFDocument.create();
      // Landscape A4: 841.89 × 595.28 pts
      const pdfW = 841.89, pdfH = 595.28;
      const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height);
      const page = pdfDoc.addPage([pdfW, pdfH]);
      const img = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
      page.drawImage(img, {
        x: (pdfW - canvas.width * ratio) / 2,
        y: (pdfH - canvas.height * ratio) / 2,
        width: canvas.width * ratio,
        height: canvas.height * ratio,
      });
      const bytes = await pdfDoc.save();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      a.download = `certificate_${studentName.replace(/\s+/g, '_')}.pdf`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  /* ── Styles (inline for PDF-safe rendering) ── */
  const gold = '#C9A857';
  const brown = '#8B4513';
  const s = {
    page:     { width: '297mm', height: '210mm', background: '#fff', fontFamily: "'Georgia', 'Times New Roman', serif", position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    outerB:   { position: 'absolute', inset: '10mm', border: `4px double ${brown}`, pointerEvents: 'none' },
    innerB:   { position: 'absolute', inset: '13mm', border: `1.5px solid ${gold}`, pointerEvents: 'none' },
    cornerTL: { position: 'absolute', top: '9mm',    left: '9mm',    width: '18mm', height: '18mm', borderTop: `3px solid ${gold}`, borderLeft: `3px solid ${gold}` },
    cornerTR: { position: 'absolute', top: '9mm',    right: '9mm',   width: '18mm', height: '18mm', borderTop: `3px solid ${gold}`, borderRight: `3px solid ${gold}` },
    cornerBL: { position: 'absolute', bottom: '9mm', left: '9mm',   width: '18mm', height: '18mm', borderBottom: `3px solid ${gold}`, borderLeft: `3px solid ${gold}` },
    cornerBR: { position: 'absolute', bottom: '9mm', right: '9mm',  width: '18mm', height: '18mm', borderBottom: `3px solid ${gold}`, borderRight: `3px solid ${gold}` },
    watermark:{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-30deg)', fontSize: '120px', fontWeight: 'bold', color: 'rgba(139,69,19,0.04)', pointerEvents: 'none', whiteSpace: 'nowrap' },
    content:  { position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16mm 22mm', textAlign: 'center' },
    divider:  { width: '80%', height: '2px', background: `linear-gradient(to right, transparent, ${gold}, transparent)`, margin: '3mm auto' },
    dividerThin: { width: '55%', height: '1px', background: `linear-gradient(to right, transparent, ${gold}, transparent)`, margin: '2mm auto' },
  };

  return (
    <div>
      {/* Action buttons (hidden on print) */}
      <div className="no-print flex gap-3 mb-4 px-2">
        <button onClick={handleDownload} disabled={downloading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm disabled:opacity-50">
          {downloading ? 'Generating PDF...' : '⬇ Download PDF'}
        </button>
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold">
          🖨 Print
        </button>
      </div>

      {/* Certificate */}
      <div ref={certRef} style={s.page}>
        {/* Borders */}
        <div style={s.outerB} />
        <div style={s.innerB} />
        <div style={s.cornerTL} /><div style={s.cornerTR} />
        <div style={s.cornerBL} /><div style={s.cornerBR} />

        {/* Watermark */}
        <div style={s.watermark}>PPSU</div>

        <div style={s.content}>
          {/* Header */}
          <div style={{ fontSize: '13pt', fontWeight: 'bold', color: brown, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1mm' }}>
            P P Savani University
          </div>
          <div style={{ fontSize: '7.5pt', color: '#666', marginBottom: '3mm' }}>
            NH 8, GETCO, Near Biltech, Dhamdod Kosamba, Surat – 394125 &nbsp;|&nbsp; www.ppsu.ac.in
          </div>

          <div style={s.divider} />

          {/* Certificate label + Title */}
          <div style={{ fontSize: '8.5pt', letterSpacing: '5px', color: brown, textTransform: 'uppercase', marginBottom: '0.5mm' }}>
            Certificate of
          </div>
          <div style={{ fontSize: '26pt', fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '2mm' }}>
            {certTitle}
          </div>

          <div style={s.dividerThin} />

          {/* Presented to */}
          <div style={{ fontSize: '9pt', color: '#555', fontStyle: 'italic', marginBottom: '1mm', letterSpacing: '1px' }}>
            This is to certify that
          </div>
          <div style={{ fontSize: '22pt', fontWeight: 'bold', color: brown, borderBottom: `1.5px solid ${gold}`, paddingBottom: '1mm', margin: '0.5mm 0 3mm', display: 'inline-block', minWidth: '60%' }}>
            {studentName}
          </div>

          {/* Description */}
          {description && (
            <div style={{ fontSize: '10pt', color: '#333', lineHeight: 1.65, maxWidth: '85%', margin: '0 auto 2mm' }}>
              {description}
            </div>
          )}

          {/* Issuing authority text */}
          {issuingAuthority && (
            <div style={{ fontSize: '8.5pt', color: '#555', marginTop: '1mm' }}>
              Issued by: <strong>{issuingAuthority}</strong>
            </div>
          )}

          {/* Footer row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: '6mm' }}>
            {/* QR Code */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1mm' }}>
              {hashValue && hashValue !== 'PREVIEW_HASH'
                ? <QRCode value={hashValue} size={52} />
                : <div style={{ width: 52, height: 52, border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#bbb' }}>QR</div>
              }
              <div style={{ fontSize: '6.5pt', color: '#aaa' }}>Scan to Verify</div>
            </div>

            {/* Date */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8pt', color: '#888', fontStyle: 'italic' }}>Date of Issue</div>
              <div style={{ fontSize: '9pt', fontWeight: 'bold', marginTop: '1mm' }}>{formattedDate}</div>
              {validUntil && (
                <div style={{ fontSize: '7.5pt', color: '#888', marginTop: '1mm' }}>
                  Valid Until: {validUntil}
                </div>
              )}
            </div>

            {/* Signature block */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: `1px solid #333`, width: '52mm', marginBottom: '2mm' }} />
              <div style={{ fontSize: '8pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {authorityTitle}
              </div>
              <div style={{ fontSize: '7pt', color: '#666' }}>{issuingAuthority}</div>
            </div>
          </div>

          {/* Certificate ID */}
          {certificateId && (
            <div style={{ fontSize: '6.5pt', color: '#bbb', fontFamily: 'monospace', marginTop: '3mm', letterSpacing: '0.5px' }}>
              Certificate ID: {certificateId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
