
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import HackathonCertificate from '../pages/HackathonCertificate';
import SportsCertificate from '../pages/SportsCertificate';
import Marksheet from '../pages/Marksheet';

export default function CertificatePreviewModal({ certificateData, onClose }) {
    const certificateRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!certificateData) return null;

    // Determine which component to render based on type
    const renderCertificate = () => {
        const { certificateType, additionalData, certificateId, hashValue, studentName, issueDate } = certificateData;

        // Merge top-level data with additionalData for the component props
        const props = {
            ...additionalData,
            studentName: studentName || additionalData?.studentName,
            certificateId: certificateId || 'PREVIEW',
            qrValue: hashValue || certificateId || 'PREVIEW',
            date: issueDate
        };

        switch (certificateType) {
            case 'hackathon':
                return <HackathonCertificate {...props} />;
            case 'sports':
                return <SportsCertificate {...props} />;
            case 'marksheet':
                return (
                    <Marksheet
                        studentData={{
                            ...props,
                            reportNo: props.certificateId,
                            date: new Date(props.date || Date.now()).toLocaleDateString()
                        }}
                    />
                );
            default:
                return <div className="p-10 text-center">Unknown Certificate Type</div>;
        }
    };

    const handleDownloadPDF = async () => {
        // If it's a preview/draft (no real ID), use client-side generation
        if (!certificateData.certificateId || certificateData.certificateId === 'PREVIEW') {
            if (!certificateRef.current) return;

            try {
                setDownloading(true);
                // Wait a moment for any images to load if needed
                await new Promise(resolve => setTimeout(resolve, 500));

                const canvas = await html2canvas(certificateRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1123,
                    windowHeight: 794
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${certificateData.certificateType}_${certificateData.studentName || 'preview'}.pdf`);

            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Failed to generate preview PDF.');
            } finally {
                if (mounted) setDownloading(false);
            }
        } else {
            // Use Server-Side Generation for real certificates
            try {
                setDownloading(true);
                const response = await fetch(`/api/cert/download/${certificateData.certificateId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/pdf',
                    },
                });

                if (!response.ok) {
                    throw new Error('Download failed');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${certificateData.certificateId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

            } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('Failed to download official PDF. Please try again.');
            } finally {
                if (mounted) setDownloading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">
                        Certificate Preview
                        {certificateData.id === 'PREVIEW' && <span className="ml-2 text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">(Draft)</span>}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-8 flex justify-center items-start">
                    {/* Wrapper to constrain width for preview but allow capture */}
                    <div className="shadow-lg transform bg-white" style={{ width: '297mm', minHeight: '210mm', position: 'relative' }}>
                        <div ref={certificateRef} className="w-full h-full absolute inset-0">
                            {renderCertificate()}
                        </div>
                    </div>
                </div>

                {/* Footer - Actions */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
