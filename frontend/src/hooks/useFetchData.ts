import { useState, useEffect } from 'react';

export interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
  dataRows: LeaderBoardRow[];
}

export interface LeaderBoardRow {
  name: string;
  deals: number;
  winRate: number;
  totalSum: number;
}

export function useFetchData() {
  const [data, setData] = useState<LeaderBoardRow[]>([]);

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
