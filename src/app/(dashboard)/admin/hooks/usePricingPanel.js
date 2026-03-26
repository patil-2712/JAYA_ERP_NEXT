import { useState, useCallback } from 'react';

export function usePricingPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pricingPanels, setPricingPanels] = useState([]);
  const [selectedPricingData, setSelectedPricingData] = useState(null);

  // Fetch all pricing panels for dropdown
  const fetchPricingPanels = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch('/api/pricing-panel', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch pricing panels');
      }

      if (data.success && Array.isArray(data.data)) {
        setPricingPanels(data.data);
      } else {
        setPricingPanels([]);
      }
    } catch (err) {
      console.error('Error fetching pricing panels:', err);
      setError(err.message);
      setPricingPanels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific pricing panel with order details
  const fetchPricingPanelDetails = useCallback(async (pricingSerialNo) => {
    if (!pricingSerialNo) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch(`/api/pricing-panel?pricingSerialNo=${encodeURIComponent(pricingSerialNo)}&action=getOrderDetails`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch pricing panel details');
      }

      if (data.success && data.data) {
        setSelectedPricingData(data.data);
        return data.data;
      } else {
        throw new Error('No data received');
      }
    } catch (err) {
      console.error('Error fetching pricing panel details:', err);
      setError(err.message);
      setSelectedPricingData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear selected data
  const clearSelectedData = useCallback(() => {
    setSelectedPricingData(null);
  }, []);

  return {
    pricingPanels,
    selectedPricingData,
    loading,
    error,
    fetchPricingPanels,
    fetchPricingPanelDetails,
    clearSelectedData
  };
}