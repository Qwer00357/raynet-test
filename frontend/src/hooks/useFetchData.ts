import { useState, useEffect } from 'react';

export interface LeaderBoardRow {
  name: string;
  deals: number;
  winRate: number; // percent, e.g. 75.0
  totalSum: number;
}

export interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
  items: LeaderBoardRow[];
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
      setData(result.items || []);
    } catch (err) {
      setData([]);
    }
  };

  return { data };
}
