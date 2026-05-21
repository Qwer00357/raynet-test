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

const normalizeText = (value: string) => value.trim().toLowerCase();

const getPeriodRange = (period?: string, from?: string, to?: string) => {
  if (!period && !from && !to) {
    return null;
  }

  if (period === 'custom') {
    return {
      from: from ? new Date(from) : null,
      to: to ? new Date(to) : null
    };
  }

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'this_month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    case 'last_month':
      start.setMonth(start.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    case 'this_quarter': {
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(quarter * 3 + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'this_year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    default:
      return null;
  }
};

const getDateFromValue = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPreviousRange = (
  period: string | undefined,
  range: { from: Date | null; to: Date | null } | null
) => {
  if (!range || (!range.from && !range.to)) {
    return null;
  }

  if (period === 'this_month' || period === 'last_month') {
    const previousStart = new Date(range.from ?? range.to ?? new Date());
    previousStart.setMonth(previousStart.getMonth() - 1, 1);
    previousStart.setHours(0, 0, 0, 0);
    const previousEnd = new Date(previousStart);
    previousEnd.setMonth(previousStart.getMonth() + 1, 0);
    previousEnd.setHours(23, 59, 59, 999);
    return { from: previousStart, to: previousEnd };
  }

  if (period === 'this_quarter') {
    const previousStart = new Date(range.from ?? range.to ?? new Date());
    previousStart.setMonth(previousStart.getMonth() - 3, 1);
    previousStart.setHours(0, 0, 0, 0);
    const previousEnd = new Date(previousStart);
    previousEnd.setMonth(previousStart.getMonth() + 3, 0);
    previousEnd.setHours(23, 59, 59, 999);
    return { from: previousStart, to: previousEnd };
  }

  if (period === 'this_year') {
    const previousStart = new Date(range.from ?? range.to ?? new Date());
    previousStart.setFullYear(previousStart.getFullYear() - 1, 0, 1);
    previousStart.setHours(0, 0, 0, 0);
    const previousEnd = new Date(previousStart);
    previousEnd.setFullYear(previousStart.getFullYear(), 11, 31);
    previousEnd.setHours(23, 59, 59, 999);
    return { from: previousStart, to: previousEnd };
  }

  const fromDate = range.from ?? range.to;
  const toDate = range.to ?? range.from;

  if (!fromDate || !toDate) {
    return null;
  }

  const durationMs = toDate.getTime() - fromDate.getTime();
  const previousTo = new Date(fromDate.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  return { from: previousFrom, to: previousTo };
};

const isWithinRange = (
  date: Date | null,
  range: { from: Date | null; to: Date | null } | null
) => {
  if (!range || !date) {
    return true;
  }

  if (range.from && date < range.from) {
    return false;
  }

  if (range.to && date > range.to) {
    return false;
  }

  return true;
};

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

    const period = typeof req.query.period === 'string' ? req.query.period : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
    const owner = typeof req.query.owner === 'string' ? req.query.owner : undefined;
    const region = typeof req.query.region === 'string' ? req.query.region : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'totalSum';
    const order = typeof req.query.order === 'string' ? req.query.order : 'desc';
    const limitValue = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;

    const range = getPeriodRange(period, from, to);
    const statusValues = status
      ? status
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      : [];

    const previousRange = getPreviousRange(period, range);

    const matchesFilters = (item: BusinessCaseResponse['data'][number]) => {
      if (ownerId && String(item.owner?.id) !== ownerId) {
        return false;
      }

      if (owner && item.owner?.fullName) {
        if (!normalizeText(item.owner.fullName).includes(normalizeText(owner))) {
          return false;
        }
      } else if (owner) {
        return false;
      }

      if (region) {
        const territory = item.company?.primaryAddress?.territory?.code01;
        if (!territory || normalizeText(territory) !== normalizeText(region)) {
          return false;
        }
      }

      if (statusValues.length > 0 && !statusValues.includes(item.status)) {
        return false;
      }

      return true;
    };

    const filteredData = jsonData.data.filter((item) => {
      const validFromDate = getDateFromValue(item.validFrom);

      if (!isWithinRange(validFromDate, range)) {
        return false;
      }

      return matchesFilters(item);
    });

    const previousData = previousRange
      ? jsonData.data.filter((item) => {
        const validFromDate = getDateFromValue(item.validFrom);

        if (!isWithinRange(validFromDate, previousRange)) {
          return false;
        }

        return matchesFilters(item);
      })
      : [];

    const statsByOwner = new Map<
      string,
      { name: string; deals: number; wins: number; totalSum: number }
    >();

    filteredData.forEach((item) => {
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

    const previousStatsByOwner = new Map<
      string,
      { name: string; deals: number; wins: number; totalSum: number }
    >();

    previousData.forEach((item) => {
      const ownerName = item.owner?.fullName || 'Neznámý obchodník';
      const entry = previousStatsByOwner.get(ownerName) || {
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

      previousStatsByOwner.set(ownerName, entry);
    });

    const items = Array.from(statsByOwner.values())
      .map((entry) => {
        const previousEntry = previousStatsByOwner.get(entry.name);
        const previousTotal = previousEntry?.totalSum ?? 0;
        const trend =
          previousTotal > 0
            ? Math.round(((entry.totalSum - previousTotal) / previousTotal) * 1000) / 10
            : null;

        return {
          name: entry.name,
          deals: entry.deals,
          winRate:
            entry.deals > 0 ? Math.round((entry.wins / entry.deals) * 1000) / 10 : 0,
          totalSum: Math.round(entry.totalSum),
          trend
        };
      })
      .sort((a, b) => {
        const direction = order === 'asc' ? 1 : -1;
        const aValue = a[sortBy as keyof typeof a] ?? 0;
        const bValue = b[sortBy as keyof typeof b] ?? 0;
        return (Number(aValue) - Number(bValue)) * direction;
      });

    const limitedItems =
      typeof limitValue === 'number' && !Number.isNaN(limitValue)
        ? items.slice(0, Math.max(0, limitValue))
        : items;

    res.json({
      message: 'Leaderboard ready',
      timestamp: new Date().toISOString(),
      status: 'ok',
      filters: {
        period: period || null,
        from: from || null,
        to: to || null,
        ownerId: ownerId || null,
        owner: owner || null,
        region: region || null,
        status: statusValues.length > 0 ? statusValues : null,
        sortBy,
        order,
        limit: limitValue || null
      },
      items: limitedItems
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

app.get('/api/leaderboard/filters', (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData: BusinessCaseResponse = JSON.parse(rawData);

    const ownersMap = new Map<string, { id: number; name: string }>();
    const regionsSet = new Set<string>();
    const statusesSet = new Set<string>();

    jsonData.data.forEach((item) => {
      if (item.owner?.id && item.owner.fullName) {
        ownersMap.set(String(item.owner.id), {
          id: item.owner.id,
          name: item.owner.fullName
        });
      }

      const region = item.company?.primaryAddress?.territory?.code01;
      if (region) {
        regionsSet.add(region);
      }

      if (item.status) {
        statusesSet.add(item.status);
      }
    });

    const owners = Array.from(ownersMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const regions = Array.from(regionsSet.values()).sort((a, b) =>
      a.localeCompare(b)
    );
    const statuses = Array.from(statusesSet.values()).sort();

    res.json({
      status: 'ok',
      message: 'Leaderboard filters ready',
      timestamp: new Date().toISOString(),
      periods: ['this_month', 'last_month', 'this_quarter', 'this_year', 'custom'],
      sortBy: ['totalSum', 'deals', 'winRate'],
      order: ['desc', 'asc'],
      owners,
      regions,
      statuses
    });
  } catch (error) {
    console.error('Error building filters:', error);
    res.status(500).json({
      message: 'Error building filters',
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
