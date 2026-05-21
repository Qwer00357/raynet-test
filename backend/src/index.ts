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

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

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


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
  console.log(`📋 API dostupné na http://localhost:${PORT}/api/hello`);
});

export default app;
