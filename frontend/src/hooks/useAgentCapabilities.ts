import { useState, useEffect, useCallback } from 'react';
import { type AgentCapability } from '../types/agent';

interface UseAgentCapabilitiesReturn {
  capabilities: AgentCapability[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAgentCapabilities(
  apiBaseUrl?: string
): UseAgentCapabilitiesReturn {
  // Vercel生产环境使用相对路径，本地开发使用环境变量或默认值
  const resolvedBaseUrl = apiBaseUrl ?? 
    (import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'));

  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCapabilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${resolvedBaseUrl}/api/agent/capabilities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCapabilities(data.agents || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error fetching capabilities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedBaseUrl]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  return {
    capabilities,
    isLoading,
    error,
    refresh: fetchCapabilities,
  };
}
