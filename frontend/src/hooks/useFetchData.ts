import { useState, useEffect } from 'react';

export interface DataRow {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
  dataRows: DataRow[];
}

export function useFetchData() {
  const [data, setData] = useState<DataRow[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result: ApiResponse = await response.json();
      setData(result.dataRows);
    } catch (err) {
      setData([]);
    }
  };

  return { data };
}
