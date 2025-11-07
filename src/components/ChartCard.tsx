import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartCard = ({ title, type, data, isLoading }) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="relative rounded-xl border border-border bg-secondary/30 p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="relative rounded-xl border border-border bg-secondary/30 p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = (props) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          {payload.map((entry, index) => {
            // For X-ray flux, show original scientific notation
            let displayValue = entry.value;
            if (entry.payload.originalLong && entry.dataKey === 'longFlux') {
              displayValue = entry.payload.originalLong.toExponential(2);
            } else if (entry.payload.originalShort && entry.dataKey === 'shortFlux') {
              displayValue = entry.payload.originalShort.toExponential(2);
            } else if (typeof entry.value === 'number') {
              displayValue = entry.value.toFixed(2);
            }
            
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {displayValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Check what type of data we have
  const hasFlareData = data[0] && (data[0].count !== undefined || data[0].maxIntensity !== undefined);
  const hasXrayData = data[0] && (data[0].longFlux !== undefined || data[0].shortFlux !== undefined);

  return (
    <div className="relative rounded-xl border border-border bg-secondary/30 p-6 hover:border-primary/50 transition-all duration-300">
      <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' && hasFlareData ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="line"
            />
            {data[0].count !== undefined && (
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5 }}
                name="Flare Count"
              />
            )}
            {data[0].maxIntensity !== undefined && (
              <Line 
                type="monotone" 
                dataKey="maxIntensity" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
                activeDot={{ r: 5 }}
                name="Max Intensity"
              />
            )}
          </LineChart>
        ) : type === 'area' && hasXrayData ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLong" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              scale="log"
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="rect"
            />
            <Area 
              type="monotone" 
              dataKey="longFlux" 
              stroke="#06b6d4" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorLong)" 
              name="Long Channel (0.1-0.8nm)"
            />
            <Area 
              type="monotone" 
              dataKey="shortFlux" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorShort)" 
              name="Short Channel (0.05-0.4nm)"
            />
          </AreaChart>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Chart type mismatch or invalid data format</p>
          </div>
        )}
      </ResponsiveContainer>
      
      {/* Data info */}
      {data && data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Displaying {data.length} data points • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartCard;