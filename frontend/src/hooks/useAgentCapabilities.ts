import { useState, useEffect, useCallback } from 'react';
import { type AgentCapability } from '../types/agent';

interface UseAgentCapabilitiesReturn {
  capabilities: AgentCapability[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAgentCapabilities(
  apiBaseUrl: string = 'http://localhost:3000'
): UseAgentCapabilitiesReturn {
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCapabilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/agent/capabilities`);
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
  }, [apiBaseUrl]);

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
