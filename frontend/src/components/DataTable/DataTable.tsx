import { LeaderBoardRow } from '../../hooks/useFetchData';
import './DataTable.css';

interface DataTableProps {
  data: LeaderBoardRow[];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <div className="data-table-container">
      <h1 className="data-table-title">Leaderboard</h1>

      {data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Obchodnik</th>
              <th>Deals</th>
              <th>Win Rate</th>
              <th>Total Sum

              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.deals}</td>
                <td>{row.winRate}</td>
                <td>{row.totalSum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
