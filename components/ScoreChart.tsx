
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { WebsiteAnalysis } from '../types';

interface ScoreChartProps {
  analysis: WebsiteAnalysis;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ analysis }) => {
  const data = [
    { subject: 'SEO', A: analysis.seo.score, fullMark: 100 },
    { subject: 'AEO', A: analysis.aeo.score, fullMark: 100 },
    { subject: 'Ranking', A: analysis.googleRanking.score, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-sm font-semibold text-slate-500 mb-2">Metrics Comparison</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
