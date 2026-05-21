import { useState } from 'react';
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

const periodLabels: Record<string, string> = {
  this_month: 'Tento měsíc',
  last_month: 'Minulý měsíc',
  this_quarter: 'Tento kvartál',
  this_year: 'Tento rok',
  custom: 'Vlastní období'
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
          ? quickOptions.find((option) => option.id === selectedFilters.quickFilter)?.label ?? 'Rychlý filtr'
          : 'Rychlý filtr';
      case 'period':
        return selectedFilters.period
          ? periodLabels[selectedFilters.period] ??
          filterOptions.periods.find((option) => option.id === selectedFilters.period)?.label ??
          'Období'
          : 'Období';
      case 'ownerId':
        return selectedFilters.ownerId
          ? filterOptions.owners.find((owner) => owner.id === selectedFilters.ownerId)?.label ?? 'Obchodník'
          : 'Obchodník';
      case 'region':
        return selectedFilters.region
          ? filterOptions.regions.find((region) => region.id === selectedFilters.region)?.label ?? 'Region'
          : 'Region';
      case 'status':
        return selectedFilters.status
          ? statusLabels[selectedFilters.status] || selectedFilters.status
          : 'Stav';
      default:
        return '';
    }
  };

  const filterKeyLabels: Record<keyof SelectedFilters, string> = {
    quickFilter: 'Rychlý filtr',
    period: 'Období',
    ownerId: 'Obchodník',
    region: 'Region',
    status: 'Stav'
  };

  const activeFilterKeys: (keyof SelectedFilters)[] = [
    'quickFilter',
    'period',
    'ownerId',
    'region',
    'status'
  ];

  const clearFilter = (key: keyof SelectedFilters) => {
    if (key === 'quickFilter') {
      updateFilter({ quickFilter: null });
      return;
    }

    updateFilter({ [key]: null } as Partial<SelectedFilters>);
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
      <div className="topbar-header">
        <h2 className="topbar-title">Žebříček obchodníků</h2>
        <div className="topbar-right">
          <button className="primary action-btn" disabled={loading}>
            {loading ? 'Načítám...' : '+ Nový záznam'}
          </button>
        </div>
      </div>

      <div className="active-filters">
        {activeFilterKeys
          .filter((key) => isActive(key))
          .map((key) => (
            <button
              key={key}
              className="filter-chip"
              onClick={() => clearFilter(key)}
              aria-label={`Odebrat filtr ${filterKeyLabels[key]}`}
            >
              {filterKeyLabels[key]}: {getLabel(key)} ✕
            </button>
          ))}
      </div>

      <div className="topbar-filters-row">
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
                  {periodLabels[option.id] ?? option.label}
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
        <button
          className="icon-btn reset-btn filter-reset-btn"
          onClick={() => resetFilters()}
          aria-label="Reset filters"
        >
          Vyčistit filtry
        </button>
      </div>
    </div>
  );
}
