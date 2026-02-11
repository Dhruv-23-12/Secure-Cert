import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import HackathonCertificate from '../pages/HackathonCertificate';
import SportsCertificate from '../pages/SportsCertificate';
import Marksheet from '../pages/Marksheet';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  'http://localhost:5000/api';

export default function CertificateGenerator({ certificateType, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Form state based on certificate type
  const [formData, setFormData] = useState(() => {
    if (certificateType === 'hackathon') {
      return {
        studentName: '',
        eventName: '',
        eventDate: '',
        organizer: '',
      };
    } else if (certificateType === 'sports') {
      return {
        studentName: '',
        sportName: '',
        achievement: '',
        eventLevel: '',
        eventDate: '',
      };
    } else if (certificateType === 'marksheet') {
      return {
        studentName: '',
        enrollmentNo: '',
        course: '',
        semester: '',
        academicYear: '',
        institution: '',
        subjects: [{ code: '', name: '', evaluation: '', credits: '', grade: '' }],
      };
    }
    return {};
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Generate certificate ID
      const newCertId = `${certificateType.toUpperCase().substring(0, 4)}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Format date properly
      let issueDate = formData.eventDate || new Date().toISOString();
      if (formData.eventDate && !formData.eventDate.includes('T')) {
        issueDate = new Date(formData.eventDate).toISOString();
      }

      // Prepare certificate data
      const certificateData = {
        certificateType,
        certificateId: newCertId,
        studentName: formData.studentName,
        issueDate: issueDate,
        additionalData: {
          ...formData,
        },
      };

      // Add type-specific required fields
      if (certificateType === 'marksheet') {
        certificateData.enrollmentNo = formData.enrollmentNo;
        certificateData.course = formData.course;
      }

      // Call backend API
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cert/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(certificateData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to create certificate');
      }

      setCertificateId(data.data.certificate.certificateId || newCertId);
      setQrValue(data.data.certificate.hashValue || data.data.certificate.certificateId || newCertId);
      setSuccess('Certificate created successfully!');
      
      if (onSuccess) {
        onSuccess({
          ...certificateData,
          id: data.data.certificate.certificateId || newCertId,
          hashValue: data.data.certificate.hashValue,
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating the certificate');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (certificateType === 'hackathon') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name *
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date *
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizer *
            </label>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </form>
      );
    } else if (certificateType === 'sports') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name *
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sport Name *
            </label>
            <input
              type="text"
              name="sportName"
              value={formData.sportName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Achievement *
            </label>
            <input
              type="text"
              name="achievement"
              value={formData.achievement}
              onChange={handleChange}
              placeholder="e.g., First Place, Runner Up"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Level *
            </label>
            <input
              type="text"
              name="eventLevel"
              value={formData.eventLevel}
              onChange={handleChange}
              placeholder="e.g., Inter-University Championship"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date *
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </form>
      );
    } else if (certificateType === 'marksheet') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment No. *
              </label>
              <input
                type="text"
                name="enrollmentNo"
                value={formData.enrollmentNo}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <input
                type="text"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year *
            </label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="e.g., NOVEMBER 2025"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution *
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      );
    }
    return null;
  };

  const renderPreview = () => {
    if (!certificateId) return null;

    if (certificateType === 'hackathon') {
      return (
        <HackathonCertificate
          studentName={formData.studentName}
          eventName={formData.eventName}
          eventDate={formData.eventDate}
          organizer={formData.organizer}
          certificateId={certificateId}
          qrValue={qrValue}
        />
      );
    } else if (certificateType === 'sports') {
      return (
        <SportsCertificate
          studentName={formData.studentName}
          sportName={formData.sportName}
          achievement={formData.achievement}
          eventLevel={formData.eventLevel}
          eventDate={formData.eventDate}
          certificateId={certificateId}
          qrValue={qrValue}
        />
      );
    } else if (certificateType === 'marksheet') {
      return (
        <Marksheet
          studentData={{
            studentName: formData.studentName,
            enrollmentNo: formData.enrollmentNo,
            course: formData.course,
            semester: formData.semester,
            academicYear: formData.academicYear,
            institution: formData.institution,
            reportNo: certificateId,
            date: new Date().toLocaleDateString(),
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Generate {certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} Certificate
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-green-800 underline hover:text-green-900 text-sm"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && renderPreview()}

      {!showPreview && (
        <>
          {renderForm()}
          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Generate Certificate'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
