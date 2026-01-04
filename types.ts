
export interface AnalysisSection {
  score: number;
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
}

export interface WebsiteAnalysis {
  siteName: string;
  url: string;
  overallScore: number;
  seo: AnalysisSection;
  aeo: AnalysisSection;
  googleRanking: AnalysisSection;
  summary: string;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  siteName: string;
  timestamp: string;
}
