import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

// For development, we'll use a mock contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';

export const useContract = () => {
  const { provider, signer, isConnected } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider && signer && isConnected) {
      try {
        // For demo purposes, we'll simulate contract connection
        setContract({ address: CONTRACT_ADDRESS } as any);
        setError(null);
      } catch (err: any) {
        console.error('Contract initialization failed:', err);
        setError('Failed to initialize contract');
      }
    } else {
      setContract(null);
    }
  }, [provider, signer, isConnected]);

  const submitEvidence = async (ipfsHash: string, encryptedKey: string, description: string) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find evidence that was already stored by the API service
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidence = evidenceData.find((e: any) => e.ipfsHash === ipfsHash);
      
      if (evidence) {
        // Evidence already stored by API service, just return success
        setIsLoading(false);
        return { success: true, txHash: `0x${Math.random().toString(16).substr(2, 64)}`, evidenceId: evidence.id };
      } else {
        // Fallback: store evidence if not already stored
        const evidenceId = evidenceData.length > 0 ? Math.max(...evidenceData.map((e: any) => e.id)) + 1 : 1;
        const userAddress = await signer.getAddress();
        
        const newEvidence = {
          id: evidenceId,
          victim: userAddress,
          ipfsHash,
          encryptedKey,
          timestamp: Math.floor(Date.now() / 1000),
          description,
          isActive: true,
          hasAccess: true,
          hasRequested: false,
          accessRequests: [],
          grantedAccess: []
        };
        
        evidenceData.push(newEvidence);
        localStorage.setItem('evidenceData', JSON.stringify(evidenceData));
        
        setIsLoading(false);
        return { success: true, txHash: `0x${Math.random().toString(16).substr(2, 64)}`, evidenceId };
      }
    } catch (err: any) {
      console.error('Submit evidence failed:', err);
      setError(err.message || 'Failed to submit evidence');
      setIsLoading(false);
      throw err;
    }
  };

  const getEvidence = async (evidenceId: number) => {
    if (!contract || !signer) throw new Error('Contract not initialized');

    try {
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidence = evidenceData.find((e: any) => e.id === evidenceId);
      
      if (!evidence) {
        throw new Error('Evidence not found');
      }
      
      const userAddress = await signer.getAddress();
      const currentUser = userAddress.toLowerCase();
      const isOwner = evidence.victim.toLowerCase() === currentUser;
      
      // Check if user has granted access
      const hasGrantedAccess = evidence.grantedAccess?.some((access: any) => 
        access.address.toLowerCase() === currentUser
      );
      
      // Check if user has pending request
      const hasRequested = evidence.accessRequests?.some((req: any) => 
        req.address.toLowerCase() === currentUser && req.status === 'pending'
      ) || false;
      
      return {
        ...evidence,
        hasAccess: isOwner || hasGrantedAccess,
        hasRequested: hasRequested
      };
    } catch (err: any) {
      console.error('Get evidence failed:', err);
      throw err;
    }
  };

  const getUserEvidences = async (userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      return evidenceData
        .filter((e: any) => e.victim.toLowerCase() === userAddress.toLowerCase())
        .map((e: any) => e.id);
    } catch (err: any) {
      console.error('Get user evidences failed:', err);
      throw err;
    }
  };

  const requestAccess = async (evidenceId: number) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userAddress = await signer.getAddress();
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidenceIndex = evidenceData.findIndex((e: any) => e.id === evidenceId);
      
      if (evidenceIndex !== -1) {
        if (!evidenceData[evidenceIndex].accessRequests) {
          evidenceData[evidenceIndex].accessRequests = [];
        }
        evidenceData[evidenceIndex].accessRequests.push({
          address: userAddress,
          timestamp: Date.now(),
          status: 'pending'
        });
        localStorage.setItem('evidenceData', JSON.stringify(evidenceData));
      }
      
      setIsLoading(false);
      return { success: true, txHash: `0x${Math.random().toString(16).substr(2, 64)}` };
    } catch (err: any) {
      console.error('Request access failed:', err);
      setError(err.message || 'Failed to request access');
      setIsLoading(false);
      throw err;
    }
  };

  const grantAccess = async (evidenceId: number, userAddress: string) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidenceIndex = evidenceData.findIndex((e: any) => e.id === evidenceId);
      
      if (evidenceIndex !== -1) {
        if (!evidenceData[evidenceIndex].grantedAccess) {
          evidenceData[evidenceIndex].grantedAccess = [];
        }
        evidenceData[evidenceIndex].grantedAccess.push({
          address: userAddress,
          grantedAt: Date.now()
        });
        
        // Update request status
        if (evidenceData[evidenceIndex].accessRequests) {
          const requestIndex = evidenceData[evidenceIndex].accessRequests.findIndex(
            (req: any) => req.address.toLowerCase() === userAddress.toLowerCase()
          );
          if (requestIndex !== -1) {
            evidenceData[evidenceIndex].accessRequests[requestIndex].status = 'granted';
          }
        }
        
        localStorage.setItem('evidenceData', JSON.stringify(evidenceData));
      }
      
      setIsLoading(false);
      return { success: true, txHash: `0x${Math.random().toString(16).substr(2, 64)}` };
    } catch (err: any) {
      console.error('Grant access failed:', err);
      setError(err.message || 'Failed to grant access');
      setIsLoading(false);
      throw err;
    }
  };

  const revokeAccess = async (evidenceId: number, userAddress: string) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidenceIndex = evidenceData.findIndex((e: any) => e.id === evidenceId);
      
      if (evidenceIndex !== -1 && evidenceData[evidenceIndex].grantedAccess) {
        evidenceData[evidenceIndex].grantedAccess = evidenceData[evidenceIndex].grantedAccess.filter(
          (access: any) => access.address.toLowerCase() !== userAddress.toLowerCase()
        );
        
        // Update request status to denied when access is revoked
        if (evidenceData[evidenceIndex].accessRequests) {
          const requestIndex = evidenceData[evidenceIndex].accessRequests.findIndex(
            (req: any) => req.address.toLowerCase() === userAddress.toLowerCase()
          );
          if (requestIndex !== -1) {
            evidenceData[evidenceIndex].accessRequests[requestIndex].status = 'denied';
          }
        }
        
        localStorage.setItem('evidenceData', JSON.stringify(evidenceData));
      }
      
      setIsLoading(false);
      return { success: true, txHash: `0x${Math.random().toString(16).substr(2, 64)}` };
    } catch (err: any) {
      console.error('Revoke access failed:', err);
      setError(err.message || 'Failed to revoke access');
      setIsLoading(false);
      throw err;
    }
  };

  const getPermissionRequests = async (evidenceId: number) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidence = evidenceData.find((e: any) => e.id === evidenceId);
      return evidence?.accessRequests || [];
    } catch (err: any) {
      console.error('Get permission requests failed:', err);
      throw err;
    }
  };

  return {
    contract,
    isLoading,
    error,
    submitEvidence,
    getEvidence,
    getUserEvidences,
    requestAccess,
    grantAccess,
    revokeAccess,
    getPermissionRequests,
  };
};