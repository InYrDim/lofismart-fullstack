import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

import { type StockItem } from "@/services/inventory.service";

interface IntakeChartProps {
  data: StockItem[];
  days?: number;
  filterProducts?: string[];
  allProducts?: string[];
}

export function IntakeChart({ data, days = 30, filterProducts, allProducts }: IntakeChartProps) {
  const chartData = useMemo(() => {
    // 1. Generate dates centered around today
    const dateInfo: { label: string, isFuture: boolean }[] = [];
    const halfDays = Math.floor(days / 2);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1 - halfDays; i >= -halfDays; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dateInfo.push({
        label: format(d, "dd MMM", { locale: id }),
        isFuture: d > today
      });
    }

    // 2. Determine which products we are tracking
    const trackedProducts = new Set<string>();
    if (filterProducts && filterProducts.length > 0) {
      filterProducts.forEach(p => trackedProducts.add(p));
    } else if (allProducts && allProducts.length > 0) {
      // If "Semuanya" (empty filter) is selected, show ALL available products
      allProducts.forEach(p => trackedProducts.add(p));
    } else {
      // Fallback: only show what has data
      data.forEach(p => {
        if (p.product?.name) {
          trackedProducts.add(p.product.name);
        }
      });
    }

    // 3. Initialize groups with data for centered date range
    const groups: { [label: string]: { date: string; [key: string]: string | number | null } } = {};

    dateInfo.forEach(info => {
      groups[info.label] = { date: info.label };
      trackedProducts.forEach(productName => {
        // Use null for future dates so Recharts doesn't draw them
        groups[info.label][productName] = info.isFuture ? null : 0;
      });
    });

    if (data && data.length > 0) {
      data.forEach((p) => {
        const dateLabel = format(parseISO(p.created_at), "dd MMM", { locale: id });
        const productName = p.product?.name;
        
        if (!productName || !trackedProducts.has(productName)) {
          return;
        }

        if (groups[dateLabel] && groups[dateLabel][productName] !== null) {
          groups[dateLabel][productName] = ((groups[dateLabel][productName] as number) || 0) + p.qty;
        }
      });
    }

    return dateInfo.map(info => groups[info.label]);
  }, [data, days, filterProducts, allProducts]);

  const uniqueProducts = useMemo(() => {
    const products = new Set<string>();
    if (filterProducts && filterProducts.length > 0) {
      filterProducts.forEach(p => products.add(p));
    } else if (allProducts && allProducts.length > 0) {
      allProducts.forEach(p => products.add(p));
    } else {
      data.forEach(p => {
        if (p.product?.name) {
          products.add(p.product.name);
        }
      });
    }
    
    return Array.from(products);
  }, [data, filterProducts, allProducts]);

  const colors = [
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
  ];



  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
        >
          <defs>
            {uniqueProducts.map((product, index) => (
              <linearGradient key={product} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            domain={[0, 'auto']}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
          />
          <ReferenceLine 
            x={format(new Date(), "dd MMM", { locale: id })} 
            stroke="#10b981" 
            strokeDasharray="3 3"
            label={{ 
              value: 'Hari Ini', 
              position: 'top', 
              fill: '#059669', 
              fontSize: 10,
              fontWeight: 'bold'
            }} 
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
          />
          {uniqueProducts.map((product, index) => (
            <Area
              key={product}
              type="monotone"
              dataKey={product}
              stroke={colors[index % colors.length]}
              strokeWidth={3}
              fillOpacity={0.1}
              fill={colors[index % colors.length]}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
