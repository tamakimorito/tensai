import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonLoader;