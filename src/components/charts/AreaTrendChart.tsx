import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AreaConfig {
  dataKey: string;
  stroke: string;
  name?: string;
  fill?: string;
  fillOpacity?: number;
}

interface AreaTrendChartProps {
  data: any[];
  height?: number;
  xKey?: string;
  areas: AreaConfig[];
  gradientId: string;
  gradientColor: string;
}

export default function AreaTrendChart({
  data,
  height = 250,
  xKey = 'name',
  areas,
  gradientId,
  gradientColor,
}: AreaTrendChartProps) {
  return (
    <ResponsiveContainer width="99%" height={height} debounce={50}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.1} />
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
          itemStyle={{
            fontWeight: 800,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          labelStyle={{
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '8px',
            fontSize: '12px',
          }}
        />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.stroke}
            strokeWidth={4}
            fill={area.fill ?? 'none'}
            fillOpacity={area.fillOpacity ?? 1}
            name={area.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
