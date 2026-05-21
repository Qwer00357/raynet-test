import { useFetchData } from '../../hooks/useFetchData';
import { DataTable } from '../DataTable/DataTable';
import { Sidebar } from '../Sidebar/Sidebar';
import { Topbar } from '../Topbar/Topbar';
import { TopLeaderboard } from '../TopLeaderboard/TopLeaderboard';
import './App.css';

function App() {
  const {
    data,
    loading,
    filterOptions,
    selectedFilters,
    updateFilter,
    resetFilters
  } = useFetchData();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-column">
        <Topbar
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          loading={loading}
        />
        <div className="main-container">
          <TopLeaderboard data={data} />
          <DataTable data={data.slice(6, 10)} startIndex={6} />
        </div>
      </div>
    </div>
  );
}

export default App;
