import React, { useState } from 'react';
import { FilterOptions, SelectedFilters } from '../../hooks/useFetchData';
import './Topbar.css';

interface TopbarProps {
  filterOptions: FilterOptions;
  selectedFilters: SelectedFilters;
  updateFilter: (filter: Partial<SelectedFilters>) => void;
  resetFilters: () => void;
  loading: boolean;
}

const quickOptions = [
  { id: 'all', label: 'Všechny výsledky' },
  { id: 'top5', label: 'Top 5' },
  { id: 'wins', label: 'Vyhrané' },
  { id: 'active', label: 'Aktivní' }
];

const statusLabels: Record<string, string> = {
  E_WIN: 'Vyhrané',
  B_ACTIVE: 'Aktivní',
  F_LOST: 'Prohrané'
};

export function Topbar({
  filterOptions,
  selectedFilters,
  updateFilter,
  resetFilters,
  loading
}: TopbarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const isActive = (key: keyof SelectedFilters) => {
    return Boolean(selectedFilters[key]);
  };

  const getLabel = (key: keyof SelectedFilters) => {
    switch (key) {
      case 'quickFilter':
        return selectedFilters.quickFilter
          ? quickOptions.find((option) => option.id === selectedFilters.quickFilter)?.label ?? 'Mé filtry'
          : 'Mé filtry';
      case 'period':
        return selectedFilters.period || 'Tento měsíc';
      case 'ownerId':
        return selectedFilters.ownerId
          ? filterOptions.owners.find((owner) => owner.id === selectedFilters.ownerId)?.label ?? 'Obchodník'
          : 'Obchodník';
      case 'region':
        return selectedFilters.region || 'Region';
      case 'status':
        return selectedFilters.status
          ? statusLabels[selectedFilters.status] || selectedFilters.status
          : 'Tým';
      default:
        return '';
    }
  };

  const toggleDropdown = (key: string) => {
    setOpenFilter((current) => (current === key ? null : key));
  };

  const selectOption = (key: keyof SelectedFilters, value: string | null) => {
    if (key === 'quickFilter' && value === 'all') {
      updateFilter({ quickFilter: null });
    } else if (key === 'quickFilter') {
      updateFilter({ quickFilter: value, status: null });
    } else {
      updateFilter({ [key]: value } as Partial<SelectedFilters>);
    }
    setOpenFilter(null);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">Žebříček obchodníků</h2>
        <div className="topbar-filters">
          <div className="filter-group">
            <button
              className={`filter-btn ${isActive('quickFilter') ? 'active' : ''}`}
              onClick={() => toggleDropdown('quickFilter')}
            >
              {getLabel('quickFilter')} ▾
            </button>
            {openFilter === 'quickFilter' && (
              <div className="filter-dropdown">
                {quickOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`dropdown-item ${selectedFilters.quickFilter === option.id ? 'selected' : ''}`}
                    onClick={() => selectOption('quickFilter', option.id === 'all' ? null : option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <button
              className={`filter-btn ${isActive('period') ? 'active' : ''}`}
              onClick={() => toggleDropdown('period')}
            >
              {getLabel('period')} ▾
            </button>
            {openFilter === 'period' && (
              <div className="filter-dropdown">
                {filterOptions.periods.map((option) => (
                  <button
                    key={option.id}
                    className={`dropdown-item ${selectedFilters.period === option.id ? 'selected' : ''}`}
                    onClick={() => selectOption('period', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <button
              className={`filter-btn ${isActive('ownerId') ? 'active' : ''}`}
              onClick={() => toggleDropdown('ownerId')}
            >
              {getLabel('ownerId')} ▾
            </button>
            {openFilter === 'ownerId' && (
              <div className="filter-dropdown">
                {filterOptions.owners.map((option) => (
                  <button
                    key={option.id}
                    className={`dropdown-item ${selectedFilters.ownerId === option.id ? 'selected' : ''}`}
                    onClick={() => selectOption('ownerId', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <button
              className={`filter-btn ${isActive('region') ? 'active' : ''}`}
              onClick={() => toggleDropdown('region')}
            >
              {getLabel('region')} ▾
            </button>
            {openFilter === 'region' && (
              <div className="filter-dropdown">
                {filterOptions.regions.map((option) => (
                  <button
                    key={option.id}
                    className={`dropdown-item ${selectedFilters.region === option.id ? 'selected' : ''}`}
                    onClick={() => selectOption('region', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <button
              className={`filter-btn ${isActive('status') ? 'active' : ''}`}
              onClick={() => toggleDropdown('status')}
            >
              {getLabel('status')} ▾
            </button>
            {openFilter === 'status' && (
              <div className="filter-dropdown">
                {filterOptions.statuses.map((option) => (
                  <button
                    key={option.id}
                    className={`dropdown-item ${selectedFilters.status === option.id ? 'selected' : ''}`}
                    onClick={() => selectOption('status', option.id)}
                  >
                    {statusLabels[option.id] ?? option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="filter-pill">
          {selectedFilters.quickFilter || selectedFilters.period || selectedFilters.ownerId || selectedFilters.region || selectedFilters.status
            ? 'Filtrováno'
            : 'Žádný filtr'}
        </div>
        <button
          className="icon-btn"
          onClick={() => resetFilters()}
          aria-label="Reset filters"
        >
          ♻️
        </button>
        <button className="primary action-btn" disabled={loading}>
          {loading ? 'Načítám...' : '+ Nový záznam'}
        </button>
      </div>
    </div>
  );
}
