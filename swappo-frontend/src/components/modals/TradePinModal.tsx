// components/modals/TradePinModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Shield, Clock, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';
import pinService, { PinStatus } from '@/services/pinService';
import { useToast } from '@/hooks/use-toast';

interface TradePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: {
    id: string;
    requested_item: { title: string; images?: Array<{ image_url: string }> };
    offered_item: { title: string; images?: Array<{ image_url: string }> };
    requester: { username: string };
    owner: { username: string };
  };
  onTradeCompleted?: () => void;
}

const TradePinModal: React.FC<TradePinModalProps> = ({
  isOpen,
  onClose,
  trade,
  onTradeCompleted
}) => {
  const [pinStatus, setPinStatus] = useState<PinStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [countdown, setCountdown] = useState<string>('');
  const { toast } = useToast();

  // Load PIN status on mount
  useEffect(() => {
    if (isOpen && trade?.id) {
      // Temporarily disabled to prevent API issues
      console.log('Would load PIN status for trade:', trade.id);
      // loadPinStatus();
    }
  }, [isOpen, trade?.id]);

  // Update countdown every minute
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pinStatus?.pinStatus && !pinStatus.pinStatus.isExpired) {
      interval = setInterval(() => {
        const remaining = pinService.getTimeRemaining(pinStatus.pinStatus!.expiresAt);
        setCountdown(remaining);
        
        // Check if expired
        if (remaining === 'Expired') {
          loadPinStatus(); // Refresh status
        }
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [pinStatus]);

  const loadPinStatus = async () => {
    if (!trade?.id) return;
    
    console.log('Would load PIN status for trade:', trade.id);
    // Temporarily disabled API call
    // const status = await pinService.getPinStatus(trade.id);
    // if (status) {
    //   setPinStatus(status);
    //   if (status.pinStatus) {
    //     setCountdown(pinService.getTimeRemaining(status.pinStatus.expiresAt));
    //   }
    // }
  };

  const handleGeneratePin = async () => {
    setLoading(true);
    try {
      console.log('Would generate PIN for trade:', trade.id);
      // Temporarily disabled API call
      // const result = await pinService.generatePin(trade.id);
      
      toast({
        title: "Success",
        description: "PIN generation simulated!",
      });
      
      // Simulate PIN status
      setPinStatus({
        success: true,
        userRole: 'owner',
        tradeStatus: 'PENDING',
        pinExists: true,
        pinStatus: {
          pinCode: '123456',
          isVerified: false,
          isExpired: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PIN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!pinInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter the PIN code",
        variant: "destructive",
      });
      return;
    }

    // Remove spaces from input
    const cleanPin = pinInput.replace(/\s/g, '');
    if (cleanPin.length !== 6) {
      toast({
        title: "Error",
        description: "PIN must be 6 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Would verify PIN for trade:', trade.id, 'PIN:', cleanPin);
      
      // Simulate successful verification
      if (cleanPin === '123456') {
        toast({
          title: "Success",
          description: "Trade completed successfully! 🎉",
        });
        onTradeCompleted?.();
        onClose();
      } else {
        toast({
          title: "Error",
          description: 'Invalid PIN (try: 123456)',
          variant: "destructive",
        });
        setPinInput(''); // Clear on error
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify PIN",
        variant: "destructive",
      });
      setPinInput('');
    } finally {
      setLoading(false);
    }
  };

  const copyPinToClipboard = () => {
    if (pinStatus?.pinStatus?.pinCode) {
      navigator.clipboard.writeText(pinStatus.pinStatus.pinCode);
      toast({
        title: "Success",
        description: "PIN copied to clipboard",
      });
    }
  };

  const formatPinInput = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 6 digits
    const limited = digits.substring(0, 6);
    // Add space after 3 digits
    return limited.replace(/(\d{3})(\d{1,3})/, '$1 $2');
  };

  const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPinInput(e.target.value);
    setPinInput(formatted);
  };

  if (!isOpen) return null;

  const isOwner = pinStatus?.userRole === 'owner';
  const isRequester = pinStatus?.userRole === 'requester';
  const pinExists = pinStatus?.pinExists;
  const pin = pinStatus?.pinStatus;
  const isExpired = pin?.isExpired;
  const isVerified = pin?.isVerified;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Secure Trade Completion
                </h3>
                <p className="text-sm text-gray-500">PIN Verification Required</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Trade Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Trade Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">{trade.requester.username}</span> gets{' '}
                <span className="font-medium">{trade.requested_item.title}</span>
              </div>
              <div>
                <span className="font-medium">{trade.owner.username}</span> gets{' '}
                <span className="font-medium">{trade.offered_item.title}</span>
              </div>
            </div>
          </div>

          {/* PIN Status Display */}
          {!pinStatus && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading PIN status...</p>
            </div>
          )}

          {pinStatus && isVerified && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Trade Completed!
              </h3>
              <p className="text-gray-600">
                The PIN has been verified and the trade is now complete.
              </p>
            </div>
          )}

          {/* Owner View - Generate/Show PIN */}
          {pinStatus && isOwner && !isVerified && (
            <div className="space-y-4">
              {!pinExists && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Ready to Complete Trade?
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Generate a secure PIN that {trade.requester.username} will use to confirm
                    they received the item.
                  </p>
                  <button
                    onClick={handleGeneratePin}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate PIN'}
                  </button>
                </div>
              )}

              {pinExists && pin && !isExpired && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Your Trade PIN</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowPin(!showPin)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={copyPinToClipboard}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-center py-4">
                      <div className="text-2xl font-mono font-bold text-blue-900 bg-white rounded-lg p-4 border border-blue-200">
                        {showPin ? pinService.formatPinCode(pin.pinCode!) : '••• •••'}
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-sm text-blue-700">
                      <Clock className="w-4 h-4 mr-1" />
                      {countdown}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">
                          Share this PIN with {trade.requester.username}
                        </p>
                        <p className="text-amber-700">
                          Once they enter this PIN, the trade will be marked as complete.
                          The PIN expires in 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pinExists && pin && isExpired && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">PIN Expired</h4>
                  <p className="text-gray-600 mb-6">
                    The PIN has expired. Generate a new one to complete the trade.
                  </p>
                  <button
                    onClick={handleGeneratePin}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate New PIN'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Requester View - Enter PIN */}
          {pinStatus && isRequester && !isVerified && (
            <div className="space-y-4">
              {!pinExists && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Waiting for {trade.owner.username}
                  </h4>
                  <p className="text-gray-600">
                    Ask {trade.owner.username} to generate the completion PIN first.
                  </p>
                </div>
              )}

              {pinExists && pin && !isExpired && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Enter Completion PIN
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Ask {trade.owner.username} for the 6-digit PIN to complete the trade.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={pinInput}
                        onChange={handlePinInputChange}
                        placeholder="000 000"
                        className="w-full text-center text-2xl font-mono tracking-wider p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={7} // 6 digits + 1 space
                      />
                    </div>

                    <button
                      onClick={handleVerifyPin}
                      disabled={loading || pinInput.replace(/\s/g, '').length !== 6}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Verifying...' : 'Complete Trade'}
                    </button>

                    <div className="text-center">
                      <div className="flex items-center justify-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        PIN expires in {countdown}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pinExists && pin && isExpired && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">PIN Expired</h4>
                  <p className="text-gray-600">
                    Ask {trade.owner.username} to generate a new PIN to complete the trade.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradePinModal;
