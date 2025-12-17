import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function MarketChart({ marketData }) {
  const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  const data = [
    {
      name: 'TAM',
      value: marketData.tam || 0,
      fill: '#3498db',
    },
    {
      name: 'SAM',
      value: marketData.sam || 0,
      fill: '#2ecc71',
    },
    {
      name: 'SOM',
      value: marketData.som || 0,
      fill: '#f39c12',
    },
  ];

  return (
    <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8 mb-8">
      <h3 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">
        Market Size Analysis <span className="text-zinc-500 font-normal text-sm ml-2">(TAM/SAM/SOM)</span>
      </h3>

      <div className="h-[350px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#333' }}
              axisLine={{ stroke: '#333' }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#333' }}
              axisLine={{ stroke: '#333' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                backgroundColor: '#000',
                borderColor: '#333',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [formatCurrency(value), 'Value']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="value" name="Market Size">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#00FF41' : '#00E5FF'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <div className="text-[#3b82f6] font-bold mb-2 text-lg">TAM</div>
          <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Total Addressable Market</div>
          <div className="text-zinc-300 text-sm leading-relaxed">{marketData.tam_description || 'Not available'}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <div className="text-[#00FF41] font-bold mb-2 text-lg">SAM</div>
          <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Serviceable Market</div>
          <div className="text-zinc-300 text-sm leading-relaxed">{marketData.sam_description || 'Not available'}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <div className="text-[#00E5FF] font-bold mb-2 text-lg">SOM</div>
          <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Obtainable Market</div>
          <div className="text-zinc-300 text-sm leading-relaxed">{marketData.som_description || 'Not available'}</div>
        </div>
      </div>
    </div>
  );
}

export default MarketChart;