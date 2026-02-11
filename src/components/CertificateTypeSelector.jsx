import React from 'react';

const certificateTypes = [
  {
    id: 'marksheet',
    name: 'Marksheet',
    description: 'Academic semester performance report',
    icon: '📄',
    color: 'blue',
  },
  {
    id: 'hackathon',
    name: 'Hackathon Certificate',
    description: 'Participation certificate for hackathon events',
    icon: '💻',
    color: 'purple',
  },
  {
    id: 'sports',
    name: 'Sports Certificate',
    description: 'Achievement certificate for sports events',
    icon: '🏆',
    color: 'green',
  },
  {
    id: 'general',
    name: 'General Certificate',
    description: 'Standard certificate template',
    icon: '📜',
    color: 'indigo',
  },
];

export default function CertificateTypeSelector({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Select Certificate Type</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificateTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className={`p-6 rounded-lg border-2 border-gray-200 hover:border-${type.color}-500 hover:shadow-lg transition-all text-left group`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`text-4xl group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
