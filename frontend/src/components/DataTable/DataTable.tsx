import { DataRow } from '../../hooks/useFetchData';
import './DataTable.css';

interface DataTableProps {
  data: DataRow[];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <div className="data-table-container">
      <h1 className="data-table-title">Leaderboard</h1>

      {data.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available yet.</p>
      )}
    </div>
  );
}
