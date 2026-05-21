import { LeaderBoardRow } from '../../hooks/useFetchData';
import './TopLeaderboard.css';

interface TopLeaderboardProps {
  data: LeaderBoardRow[];
}

export function TopLeaderboard({ data }: TopLeaderboardProps) {
  const topItems = data.slice(0, 6);

  return (
    <section className="top-leaderboard">
      <div className="top-leaderboard-header">
        <span className="top-leaderboard-label">Pořadí obchodníků</span>
      </div>
      <div className="top-leaderboard-grid">
        {topItems.map((item, index) => (
          <div key={item.name} className="leaderboard-card">
            <div className="leaderboard-card-header">
              <div className="leaderboard-position">{index + 1}.</div>
              <div className="leaderboard-name">{item.name}</div>
            </div>
            <div className="leaderboard-stats">
              <div className="stat-block">
                <div className="stat-value">{item.deals}</div>
                <div className="stat-label">dealů</div>
              </div>
              <div className="stat-block">
                <div className="stat-value">{new Intl.NumberFormat('cs-CZ').format(item.totalSum)} Kč</div>
                <div className="stat-label">Celkem</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
