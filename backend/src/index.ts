import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { BusinessCaseResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data endpoint
app.get('/api/hello', (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData: BusinessCaseResponse = JSON.parse(rawData);

    const dataRows = jsonData.data.slice(0, 10).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      type: item._entityName
    }));

    res.json({
      message: 'Hello World from Raynet API!',
      timestamp: new Date().toISOString(),
      status: 'ok',
      dataRows
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({
      message: 'Error reading data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData: BusinessCaseResponse = JSON.parse(rawData);

    const statsByOwner = new Map<
      string,
      { name: string; deals: number; wins: number; totalSum: number }
    >();

    jsonData.data.forEach((item) => {
      const ownerName = item.owner?.fullName || 'Neznámý obchodník';
      const entry = statsByOwner.get(ownerName) || {
        name: ownerName,
        deals: 0,
        wins: 0,
        totalSum: 0
      };

      entry.deals += 1;
      if (item.status === 'E_WIN') {
        entry.wins += 1;
      }
      entry.totalSum += item.totalAmountInDefaultCurrency || 0;

      statsByOwner.set(ownerName, entry);
    });

    const items = Array.from(statsByOwner.values())
      .map((entry) => ({
        name: entry.name,
        deals: entry.deals,
        winRate:
          entry.deals > 0 ? Math.round((entry.wins / entry.deals) * 1000) / 10 : 0,
        totalSum: Math.round(entry.totalSum)
      }))
      .sort((a, b) => b.totalSum - a.totalSum);

    res.json({
      message: 'Leaderboard ready',
      timestamp: new Date().toISOString(),
      status: 'ok',
      items
    });
  } catch (error) {
    console.error('Error building leaderboard:', error);
    res.status(500).json({
      message: 'Error building leaderboard',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
  console.log(`📋 API dostupné na http://localhost:${PORT}/api/hello`);
  console.log(`🏆 Leaderboard dostupný na http://localhost:${PORT}/api/leaderboard`);
});

export default app;
