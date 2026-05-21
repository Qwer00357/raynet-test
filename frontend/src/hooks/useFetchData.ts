import { useState, useEffect, useCallback } from 'react';

export interface LeaderBoardRow {
  name: string;
  deals: number;
  winRate: number; // percent, e.g. 75.0
  totalSum: number;
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterOptions {
  periods: FilterOption[];
  owners: FilterOption[];
  regions: FilterOption[];
  statuses: FilterOption[];
}

export interface SelectedFilters {
  quickFilter: string | null;
  period: string | null;
  ownerId: string | null;
  region: string | null;
  status: string | null;
}

interface FiltersResponse {
  status: string;
  message: string;
  timestamp: string;
  periods: string[];
  owners: { id: number; name: string }[];
  regions: string[];
  statuses: string[];
}

export interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
  items: LeaderBoardRow[];
}

const defaultFilters: SelectedFilters = {
  quickFilter: null,
  period: null,
  ownerId: null,
  region: null,
  status: null
};

export function useFetchData() {
  const [data, setData] = useState<LeaderBoardRow[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    periods: [],
    owners: [],
    regions: [],
    statuses: []
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  const loadFilters = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard/filters');
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      const result: FiltersResponse = await response.json();
      setFilterOptions({
        periods: result.periods.map((period) => ({ id: period, label: period })),
        owners: result.owners.map((owner) => ({ id: String(owner.id), label: owner.name })),
        regions: result.regions.map((region) => ({ id: region, label: region })),
        statuses: result.statuses.map((status) => ({ id: status, label: status }))
      });
    } catch (err) {
      setFilterOptions({ periods: [], owners: [], regions: [], statuses: [] });
    }
  }, []);

  const buildQuery = useCallback((filters: SelectedFilters) => {
    const params = new URLSearchParams();

    if (filters.period) {
      params.set('period', filters.period);
    }

    if (filters.ownerId) {
      params.set('ownerId', filters.ownerId);
    }

    if (filters.region) {
      params.set('region', filters.region);
    }

    const status =
      filters.quickFilter === 'wins'
        ? 'E_WIN'
        : filters.quickFilter === 'active'
        ? 'B_ACTIVE'
        : filters.quickFilter === 'lost'
        ? 'F_LOST'
        : filters.status;

    if (status) {
      params.set('status', status);
    }

    if (filters.quickFilter === 'top5') {
      params.set('limit', '5');
    }

    return params.toString();
  }, []);

  const fetchData = useCallback(
    async (filters: SelectedFilters) => {
      setLoading(true);
      try {
        const query = buildQuery(filters);
        const response = await fetch(`/api/leaderboard${query ? `?${query}` : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const result: ApiResponse = await response.json();
        setData(result.items || []);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  const updateFilter = useCallback((filter: Partial<SelectedFilters>) => {
    setSelectedFilters((current) => ({
      ...current,
      ...filter
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedFilters(defaultFilters);
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    fetchData(selectedFilters);
  }, [fetchData, selectedFilters]);

  return {
    data,
    loading,
    filterOptions,
    selectedFilters,
    updateFilter,
    resetFilters
  };
}
