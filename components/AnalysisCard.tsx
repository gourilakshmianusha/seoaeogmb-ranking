
import React from 'react';
import { AnalysisSection } from '../types';

interface AnalysisCardProps {
  title: string;
  description: string;
  data: AnalysisSection;
  icon: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, description, data, icon }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * data.score) / 100}
                className="text-indigo-600"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-700">{data.score}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Score</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Advantages
          </h4>
          <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
            {data.advantages.map((adv, idx) => (
              <li key={idx}>{adv}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-rose-600 mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Disadvantages
          </h4>
          <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
            {data.disadvantages.map((dis, idx) => (
              <li key={idx}>{dis}</li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-50">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recommendations</h4>
           <div className="flex flex-wrap gap-2">
             {data.recommendations.map((rec, idx) => (
               <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-md border border-slate-200">
                 {rec}
               </span>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
