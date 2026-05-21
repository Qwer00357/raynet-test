import { LeaderBoardRow } from '../../hooks/useFetchData';
import './DataTable.css';

interface DataTableProps {
  data: LeaderBoardRow[];
  startIndex?: number;
}

export function DataTable({ data, startIndex = 0 }: DataTableProps) {
  return (
    <div className="data-table-container">
      {data.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Obchodnik</th>
              <th>Deals</th>
              <th>Win Rate (%)</th>
              <th>Total Sum</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.name}>
                <td>{idx + 1 + startIndex}</td>
                <td>{row.name}</td>
                <td>{row.deals}</td>
                <td>{row.winRate}</td>
                <td>{new Intl.NumberFormat('cs-CZ').format(row.totalSum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Pro zvolené filtry nejsou žádná data.</p>
      )}
    </div>
  );
}
