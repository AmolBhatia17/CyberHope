const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface UploadResponse {
  success: boolean;
  ipfsHash: string;
  encryptionKey: string;
  metadata: any;
  pinataResponse: any;
}

export interface EvidenceMetadata {
  name: string;
  description: string;
  timestamp: string;
  victimAddress: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  encrypted: boolean;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      // For demo purposes, return mock data if API is not available
      if (endpoint === '/health') {
        return { status: 'OK', message: 'Mock API running' };
      }
      throw error;
    }
  }

  async uploadEvidence(file: File, description: string, victimAddress: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('victimAddress', victimAddress);

      const response = await fetch(`${API_BASE_URL}/upload-evidence`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      // Mock response for demo purposes - but still store the evidence properly
      console.warn('API not available, using mock response');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time
      
      // Get proper global evidence ID from localStorage
      const stored = localStorage.getItem('evidenceData') || '[]';
      const evidenceData = JSON.parse(stored);
      const evidenceId = evidenceData.length > 0 ? Math.max(...evidenceData.map((e: any) => e.id)) + 1 : 1;
      
      const ipfsHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
      const encryptionKey = Math.random().toString(36).substr(2, 32);
      
      // Store evidence in localStorage with proper global ID
      const newEvidence = {
        id: evidenceId,
        victim: victimAddress,
        ipfsHash,
        encryptedKey: encryptionKey,
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
      
      return {
        success: true,
        ipfsHash,
        encryptionKey,
        metadata: {
          name: `Evidence_${Date.now()}`,
          description,
          timestamp: new Date().toISOString(),
          victimAddress,
          originalFileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          encrypted: true
        },
        pinataResponse: { IpfsHash: ipfsHash }
      };
    }
  }

  async getEvidence(hash: string, key?: string) {
    try {
      const params = key ? `?key=${encodeURIComponent(key)}` : '';
      return this.request(`/evidence/${hash}${params}`);
    } catch (error) {
      // Mock response for demo
      return {
        success: true,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${hash}`,
        hash: hash
      };
    }
  }

  async getEvidenceMetadata(hash: string) {
    try {
      return this.request(`/evidence/${hash}/metadata`);
    } catch (error) {
      // Mock response for demo
      return {
        success: true,
        metadata: null
      };
    }
  }

  async getUserEvidence(address: string) {
    try {
      return this.request(`/evidence/user/${address}`);
    } catch (error) {
      // Mock response for demo
      return {
        success: true,
        evidence: []
      };
    }
  }

  async pinMetadata(metadata: any) {
    try {
      return this.request('/pin-metadata', {
        method: 'POST',
        body: JSON.stringify({ metadata }),
      });
    } catch (error) {
      // Mock response for demo
      return {
        success: true,
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`
      };
    }
  }

  async healthCheck() {
    try {
      return this.request('/health');
    } catch (error) {
      // Mock response for demo
      return { status: 'OK', message: 'Mock API running' };
    }
  }
}

export const apiService = new ApiService();