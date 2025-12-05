// components/modals/TradePinModal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface TradePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: any;
  onTradeCompleted?: () => void;
}

const TradePinModal: React.FC<TradePinModalProps> = ({
  isOpen,
  onClose,
  trade,
  onTradeCompleted
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Trade PIN - Test Mode
              </h3>
              <p className="text-sm text-gray-500">Testing PIN functionality</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Trade ID: {trade?.id || 'N/A'}</div>
              <div>Status: Connected and working!</div>
            </div>
          </div>

          <div className="text-center py-8">
            <p className="text-gray-600 mb-6">
              PIN Modal is working correctly. The issue might be elsewhere.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Close Test Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePinModal;
