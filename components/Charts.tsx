import React from 'react';

// Simple SVG Bar Chart
export const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; title: string; currency?: boolean }> = ({ data, title, currency }) => {
  const maxValue = Math.max(...data.map(d => d.value)) || 1;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      <div className="flex flex-col gap-4 flex-1 justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>{d.label}</span>
                <span>{currency ? '₱' : ''}{d.value.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${d.color || 'bg-red-500'}`} 
                style={{ width: `${(d.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple SVG Donut Chart
export const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0) || 1;
    let cumulativePercent = 0;
  
    const slices = data.map(slice => {
      const startPercent = cumulativePercent;
      const slicePercent = slice.value / total;
      cumulativePercent += slicePercent;
      const endPercent = cumulativePercent;
  
      const startX = Math.cos(2 * Math.PI * startPercent);
      const startY = Math.sin(2 * Math.PI * startPercent);
      const endX = Math.cos(2 * Math.PI * endPercent);
      const endY = Math.sin(2 * Math.PI * endPercent);
      
      // If slice is 100%, draw a circle
      if (slicePercent === 1) {
          return { path: `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`, color: slice.color };
      }

      const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
      
      const pathData = [
        `M ${startX} ${startY}`, // Move
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
        `L 0 0`, // Line to center
      ].join(' ');
  
      return { path: pathData, color: slice.color };
    });
  
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full items-center">
         <h3 className="text-lg font-semibold text-gray-800 mb-2 w-full text-left">{title}</h3>
         <div className="relative w-48 h-48 my-4">
            <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                {slices.map((slice, i) => (
                    <path key={i} d={slice.path} fill={slice.color} stroke="white" strokeWidth="0.02" />
                ))}
                <circle cx="0" cy="0" r="0.65" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-gray-800">{data.reduce((acc,c)=>acc+c.value,0)}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
            </div>
         </div>
         <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-auto">
             {data.map((d, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs font-medium">
                     <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: d.color}}></span>
                     <span className="text-gray-600">{d.label}</span>
                 </div>
             ))}
         </div>
      </div>
    );
  };