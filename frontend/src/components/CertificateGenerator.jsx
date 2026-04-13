import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CertificatePreviewModal from './CertificatePreviewModal';
import { apiUrl } from '../config/api';

export default function CertificateGenerator({ certificateType, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const [formData, setFormData] = useState(() => {
    if (certificateType === 'hackathon') {
      return { studentName: '', eventName: '', eventDate: '', organizer: '' };
    } else if (certificateType === 'sports') {
      return { studentName: '', sportName: '', achievement: '', eventLevel: '', eventDate: '' };
    } else if (certificateType === 'marksheet') {
      return {
        studentName: '', enrollmentNo: '', course: '', semester: '1',
        academicYear: '', institution: '', examSeatNo: '',
        prevCgpa: '', prevEarnedCredits: '',
        subjects: [
          { code: '', name: '', evaluationComponents: [{ componentType: 'Theory', credits: '4', grade: 'BB' }] },
        ],
      };
    } else if (certificateType === 'general') {
      return {
        studentName:      '',
        certTitle:        'Achievement',
        description:      '',
        issuingAuthority: 'P P Savani University',
        authorityTitle:   'Authorized Signatory',
        issueDate:        '',
        validUntil:       '',
      };
    }
    return {};
  });

  /* ── Marksheet helpers ─────────────────────────────────────────── */

  const GRADE_POINTS = {
    O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0,
    AA: 10, AB: 9, BB: 8, BC: 7, CC: 6, CD: 5, DD: 4, FF: 0, II: 0,
    S: 8, US: 0,
  };
  const GRADE_OPTIONS = ['AA','AB','BB','BC','CC','CD','DD','FF','II','O','A+','A','B+','B','C','P','F','S','US'];
  const COMP_TYPES    = ['Theory','Practical','Project','Viva','TW','Internal','External'];
  const SEMESTERS     = ['1','2','3','4','5','6','7','8'];

  const getGradePoint = (g) => {
    const gp = GRADE_POINTS[(g || '').trim().toUpperCase()];
    return gp !== undefined ? gp : null;
  };

  const computeLiveSPI = (subjects = []) => {
    let totalCredits = 0, earnedCredits = 0, totalCreditPts = 0;
    for (const sub of subjects) {
      for (const comp of (sub.evaluationComponents || [])) {
        const cr = parseFloat(comp.credits) || 0;
        const gp = getGradePoint(comp.grade);
        if (cr <= 0) continue;
        totalCredits += cr;
        if (gp !== null && gp > 0) { totalCreditPts += cr * gp; earnedCredits += cr; }
      }
    }
    const spi = totalCredits > 0 ? +(totalCreditPts / totalCredits).toFixed(2) : 0;
    return { spi, totalCredits, earnedCredits };
  };

  const liveMetrics = certificateType === 'marksheet' ? computeLiveSPI(formData.subjects) : { spi: 0, totalCredits: 0, earnedCredits: 0 };

  const liveBacklogs = certificateType === 'marksheet'
    ? (formData.subjects || []).flatMap(sub =>
        (sub.evaluationComponents || [])
          .filter(c => getGradePoint(c.grade) === 0)
          .map(c => ({ courseCode: sub.code, subjectName: sub.name, componentType: c.componentType, grade: c.grade }))
      )
    : [];

  const liveResultStatus = liveBacklogs.length === 0 ? 'PASS' : liveBacklogs.length <= 2 ? 'ATKT' : 'FAIL';

  /* ── Common handler ─────────────────────────────────────────────── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ── Subject / component mutations ──────────────────────────────── */

  const addSubject = () =>
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { code: '', name: '', evaluationComponents: [{ componentType: 'Theory', credits: '3', grade: 'BB' }] }],
    }));

  const removeSubject = (idx) =>
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) }));

  const updateSubject = (idx, field, value) =>
    setFormData(prev => {
      const s = [...prev.subjects];
      s[idx] = { ...s[idx], [field]: value };
      return { ...prev, subjects: s };
    });

  const addComponent = (sIdx) =>
    setFormData(prev => {
      const s = [...prev.subjects];
      s[sIdx] = { ...s[sIdx], evaluationComponents: [...s[sIdx].evaluationComponents, { componentType: 'Practical', credits: '2', grade: 'BB' }] };
      return { ...prev, subjects: s };
    });

  const removeComponent = (sIdx, cIdx) =>
    setFormData(prev => {
      const s = [...prev.subjects];
      s[sIdx] = { ...s[sIdx], evaluationComponents: s[sIdx].evaluationComponents.filter((_, i) => i !== cIdx) };
      return { ...prev, subjects: s };
    });

  const updateComponent = (sIdx, cIdx, field, value) =>
    setFormData(prev => {
      const s = [...prev.subjects];
      const comps = [...s[sIdx].evaluationComponents];
      comps[cIdx] = { ...comps[cIdx], [field]: value };
      s[sIdx] = { ...s[sIdx], evaluationComponents: comps };
      return { ...prev, subjects: s };
    });

  /* ── Submit ─────────────────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const newCertId = `${certificateType.toUpperCase().substring(0, 4)}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      let issueDate = formData.eventDate || new Date().toISOString();
      if (formData.eventDate && !formData.eventDate.includes('T')) issueDate = new Date(formData.eventDate).toISOString();

      let additionalPayload = { ...formData };
      if (certificateType === 'marksheet') {
        const { spi, totalCredits, earnedCredits } = computeLiveSPI(formData.subjects);
        additionalPayload.performance = {
          currentSemester: { registeredCredits: totalCredits, earnedCredits, spi },
          cumulative: {
            earnedCredits: parseFloat(formData.prevEarnedCredits || 0) + earnedCredits,
            cgpa: parseFloat(formData.prevCgpa || spi) || spi,
            backlogs: liveBacklogs.length,
          },
        };
      }

      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/cert/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          certificateType,
          certificateId: newCertId,
          studentName: formData.studentName,
          enrollmentNo: formData.enrollmentNo || undefined,
          course: formData.course || undefined,
          issueDate,
          additionalData: additionalPayload,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.message || 'Failed to create certificate');

      setSuccess('Certificate created successfully!');
      if (onSuccess) onSuccess({ certificateType, certificateId: newCertId, id: data.data.certificate.certificateId || newCertId, hashValue: data.data.certificate.hashValue });
    } catch (err) {
      setError(err.message || 'An error occurred while creating the certificate');
    } finally {
      setLoading(false);
    }
  };

  /* ── Preview ─────────────────────────────────────────────────────── */

  const handlePreview = () => {
    if (!formData.studentName) { setError('Please enter at least a student name to preview.'); return; }
    const { spi, totalCredits, earnedCredits } = computeLiveSPI(formData.subjects || []);
    setPreviewData({
      certificateType,
      certificateId: 'PREVIEW',
      hashValue: 'PREVIEW_HASH',
      studentName: formData.studentName,
      issueDate: formData.eventDate || new Date().toISOString(),
      additionalData: {
        ...formData,
        backlogs: liveBacklogs,
        resultStatus: liveResultStatus,
        performance: {
          currentSemester: { registeredCredits: totalCredits, earnedCredits, spi },
          cumulative: {
            earnedCredits: parseFloat(formData.prevEarnedCredits || 0) + earnedCredits,
            cgpa: parseFloat(formData.prevCgpa || spi) || spi,
            backlogs: liveBacklogs.length,
          },
        },
      },
    });
  };

  /* ── Forms ───────────────────────────────────────────────────────── */

  const renderHackathonForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[['studentName','Student Name'],['eventName','Event Name'],['organizer','Organizer']].map(([n,l]) => (
        <div key={n}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{l} *</label>
          <input type="text" name={n} value={formData[n]} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
        <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
    </form>
  );

  const renderSportsForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[['studentName','Student Name'],['sportName','Sport Name'],['achievement','Achievement'],['eventLevel','Event Level']].map(([n,l]) => (
        <div key={n}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{l} *</label>
          <input type="text" name={n} value={formData[n]} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={n === 'achievement' ? 'e.g., First Place' : n === 'eventLevel' ? 'e.g., Inter-University' : ''} />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
        <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
    </form>
  );

  const renderGeneralForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Recipient & Title ── */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-3 uppercase tracking-wide">Certificate Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Recipient Name *</label>
            <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required
              placeholder="Full name of recipient"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Certificate For *</label>
            <input type="text" name="certTitle" value={formData.certTitle} onChange={handleChange} required
              placeholder="e.g. Achievement, Completion, Participation"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <p className="text-xs text-gray-400 mt-1">Appears as &quot;Certificate of [this]&quot;</p>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description / Body Text *</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3}
          placeholder="e.g. has successfully completed the 40-hour workshop on Machine Learning conducted by the Department of Computer Science."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
        <p className="text-xs text-gray-400 mt-1">This text appears under the recipient name on the certificate.</p>
      </div>

      {/* ── Issuing Authority ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Issuing Authority</label>
          <input type="text" name="issuingAuthority" value={formData.issuingAuthority} onChange={handleChange}
            placeholder="e.g. P P Savani University"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Signatory Title</label>
          <input type="text" name="authorityTitle" value={formData.authorityTitle} onChange={handleChange}
            placeholder="e.g. Registrar, Dean, Director"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
      </div>

      {/* ── Dates ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date of Issue *</label>
          <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until (optional)</label>
          <input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
      </div>
    </form>
  );

  const renderMarksheetForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Student Info ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide">Student Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['studentName','Student Name','text',''],
            ['enrollmentNo','Enrollment No.','text','e.g. 23SE09CS019'],
            ['course','Programme / Course','text','e.g. B.Tech Computer Science'],
            ['institution','Institution','text','e.g. School of Engineering'],
          ].map(([n,l,t,ph]) => (
            <div key={n}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {l}{['studentName','enrollmentNo'].includes(n) ? ' *' : ''}
              </label>
              <input type={t} name={n} value={formData[n]} onChange={handleChange}
                placeholder={ph} required={['studentName','enrollmentNo'].includes(n)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
            <select name="semester" value={formData.semester} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Session (Month-Year) *</label>
            <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} required
              placeholder="e.g. NOVEMBER 2025"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Seat No.</label>
            <input type="text" name="examSeatNo" value={formData.examSeatNo} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* ── Subjects & Evaluation Components ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Subjects &amp; Grades</h3>
          <button type="button" onClick={addSubject}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
            + Add Subject
          </button>
        </div>

        <div className="space-y-4">
          {formData.subjects.map((sub, sIdx) => (
            <div key={sIdx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 w-5">{sIdx + 1}.</span>
                <input type="text" placeholder="Course Code (e.g. 3130702)"
                  value={sub.code} onChange={e => updateSubject(sIdx, 'code', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input type="text" placeholder="Subject / Course Name"
                  value={sub.name} onChange={e => updateSubject(sIdx, 'name', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                {formData.subjects.length > 1 && (
                  <button type="button" onClick={() => removeSubject(sIdx)}
                    className="ml-1 text-red-400 hover:text-red-600 text-lg font-bold leading-none">×</button>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-gray-500 px-1">
                  <span className="col-span-4">Evaluation Type</span>
                  <span className="col-span-2 text-center">Credits</span>
                  <span className="col-span-3 text-center">Grade</span>
                  <span className="col-span-2 text-center">Pts</span>
                  <span className="col-span-1"></span>
                </div>

                {sub.evaluationComponents.map((comp, cIdx) => {
                  const gp = getGradePoint(comp.grade);
                  const isFail = gp === 0;
                  return (
                    <div key={cIdx} className={`grid grid-cols-12 gap-1 items-center px-1 py-1 rounded ${isFail ? 'bg-red-50' : 'bg-green-50'}`}>
                      <div className="col-span-4">
                        <select value={comp.componentType} onChange={e => updateComponent(sIdx, cIdx, 'componentType', e.target.value)}
                          className="w-full border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">
                          {COMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" max="10" step="0.5"
                          value={comp.credits} onChange={e => updateComponent(sIdx, cIdx, 'credits', e.target.value)}
                          className="w-full border border-gray-300 rounded px-1 py-1 text-xs text-center focus:outline-none" />
                      </div>
                      <div className="col-span-3">
                        <select value={comp.grade} onChange={e => updateComponent(sIdx, cIdx, 'grade', e.target.value)}
                          className={`w-full border rounded px-1 py-1 text-xs font-semibold ${isFail ? 'border-red-400 text-red-700 bg-red-50' : 'border-gray-300 text-green-700'}`}>
                          {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className={`col-span-2 text-center text-xs font-bold ${isFail ? 'text-red-600' : 'text-green-700'}`}>
                        {gp !== null ? gp : '—'}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {sub.evaluationComponents.length > 1 && (
                          <button type="button" onClick={() => removeComponent(sIdx, cIdx)}
                            className="text-red-400 hover:text-red-600 text-sm font-bold">×</button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button type="button" onClick={() => addComponent(sIdx)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                  + Add Component (Theory / Practical / Project...)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live SPI / Result Preview ── */}
      <div className={`rounded-lg border-2 p-4 ${liveResultStatus === 'PASS' ? 'bg-green-50 border-green-300' : liveResultStatus === 'ATKT' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Live Calculations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            ['Reg. Credits',    liveMetrics.totalCredits],
            ['Earned Credits',  liveMetrics.earnedCredits],
            ['SPI / SGPA',      liveMetrics.spi?.toFixed(2)],
            ['Result',          liveResultStatus],
          ].map(([l, v]) => (
            <div key={l} className="text-center">
              <div className="text-xs text-gray-500">{l}</div>
              <div className={`text-lg font-bold ${l === 'Result'
                ? (liveResultStatus === 'PASS' ? 'text-green-700' : liveResultStatus === 'ATKT' ? 'text-amber-600' : 'text-red-600')
                : 'text-gray-800'}`}>{v}</div>
            </div>
          ))}
        </div>
        {liveBacklogs.length > 0 && (
          <div className="text-xs text-red-700">
            <span className="font-semibold">⚠ Backlogs ({liveBacklogs.length}): </span>
            {liveBacklogs.map((b, i) => (
              <span key={i}>{b.subjectName || b.courseCode} ({b.componentType}) </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Cumulative Performance ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Cumulative (Prior Semesters)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CGPA / CPI so far</label>
            <input type="number" step="0.01" min="0" max="10" name="prevCgpa" value={formData.prevCgpa} onChange={handleChange}
              placeholder="e.g. 7.85"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Earned Credits so far</label>
            <input type="number" min="0" name="prevEarnedCredits" value={formData.prevEarnedCredits} onChange={handleChange}
              placeholder="e.g. 100"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      </div>
    </form>
  );

  const renderForm = () => {
    if (certificateType === 'hackathon') return renderHackathonForm();
    if (certificateType === 'sports')    return renderSportsForm();
    if (certificateType === 'marksheet') return renderMarksheetForm();
    if (certificateType === 'general')   return renderGeneralForm();
    return <div className="p-8 text-center text-gray-500">Unknown certificate type.</div>;
  };

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Generate {certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} Certificate
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}

      {previewData && (
        <CertificatePreviewModal certificateData={previewData} onClose={() => setPreviewData(null)} />
      )}

      {!previewData && (
        <>
          <div className="max-h-[60vh] overflow-y-auto pr-1 mb-4">
            {renderForm()}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-semibold">
              {loading ? 'Creating...' : 'Generate Certificate'}
            </button>
            <button type="button" onClick={handlePreview}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              Preview
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
