import { useState, useEffect } from 'react';
import { X, Users, Clock, Check, Trash2, UserPlus } from 'lucide-react';
import { useContract } from '../hooks/useContract';

interface Evidence {
  id: number;
  victim: string;
  ipfsHash: string;
  encryptedKey: string;
  timestamp: number;
  description: string;
  isActive: boolean;
  hasAccess: boolean;
  hasRequested: boolean;
  accessRequests?: any[];
  grantedAccess?: any[];
}

interface ManageAccessModalProps {
  evidence: Evidence;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ManageAccessModal: React.FC<ManageAccessModalProps> = ({
  evidence,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { getPermissionRequests, grantAccess, revokeAccess, isLoading } = useContract();
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [grantedAccess, setGrantedAccess] = useState<any[]>([]);
  const [newUserAddress, setNewUserAddress] = useState('');

  useEffect(() => {
    if (isOpen && evidence) {
      loadAccessData();
    }
  }, [isOpen, evidence]);

  const loadAccessData = async () => {
    try {
      const requests = await getPermissionRequests(evidence.id);
      setAccessRequests(requests || []);
      
      // Load granted access from localStorage
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidenceItem = evidenceData.find((e: any) => e.id === evidence.id);
      setGrantedAccess(evidenceItem?.grantedAccess || []);
    } catch (error) {
      console.error('Failed to load access data:', error);
    }
  };

  const handleGrantAccess = async (userAddress: string) => {
    try {
      await grantAccess(evidence.id, userAddress);
      await loadAccessData();
      onUpdate();
    } catch (error) {
      console.error('Failed to grant access:', error);
    }
  };

  const handleRevokeAccess = async (userAddress: string) => {
    try {
      await revokeAccess(evidence.id, userAddress);
      await loadAccessData();
      onUpdate();
    } catch (error) {
      console.error('Failed to revoke access:', error);
    }
  };

  const handleGrantNewUser = async () => {
    if (!newUserAddress.trim()) return;
    
    try {
      await grantAccess(evidence.id, newUserAddress.trim());
      setNewUserAddress('');
      await loadAccessData();
      onUpdate();
    } catch (error) {
      console.error('Failed to grant access to new user:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-manage-access">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Manage Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            data-testid="button-close-modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Evidence #{evidence.id}</h3>
          <p className="text-gray-400 text-sm">{evidence.description}</p>
        </div>

        {/* Grant access to new user */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Grant Access to New User
          </h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter wallet address (0x...)"
              value={newUserAddress}
              onChange={(e) => setNewUserAddress(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              data-testid="input-new-user-address"
            />
            <button
              onClick={handleGrantNewUser}
              disabled={!newUserAddress.trim() || isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
              data-testid="button-grant-new-user"
            >
              Grant Access
            </button>
          </div>
        </div>

        {/* Pending access requests */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Pending Requests</h4>
          {accessRequests.filter(req => req.status === 'pending').length === 0 ? (
            <p className="text-gray-500 text-sm">No pending requests</p>
          ) : (
            <div className="space-y-2">
              {accessRequests
                .filter(req => req.status === 'pending')
                .map((request, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded"
                  >
                    <div>
                      <p className="text-white font-medium" data-testid={`text-pending-address-${index}`}>
                        {formatAddress(request.address)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Requested {formatDate(request.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleGrantAccess(request.address)}
                      disabled={isLoading}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                      data-testid={`button-approve-${index}`}
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Granted access */}
        <div>
          <h4 className="text-white font-medium mb-3">Users with Access</h4>
          {grantedAccess.length === 0 ? (
            <p className="text-gray-500 text-sm">No users have been granted access</p>
          ) : (
            <div className="space-y-2">
              {grantedAccess.map((access, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded"
                >
                  <div>
                    <p className="text-white font-medium" data-testid={`text-granted-address-${index}`}>
                      {formatAddress(access.address)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Granted {formatDate(access.grantedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeAccess(access.address)}
                    disabled={isLoading}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                    data-testid={`button-revoke-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Revoke</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            data-testid="button-close-modal-footer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};