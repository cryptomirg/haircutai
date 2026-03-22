export interface Recommendation {
  name: string;
  description: string;
  gender: string;
  imageUrl?: string;
}

export interface AnalysisResult {
  faceShape: string;
  confidence: string;
  description: string;
  recommendations: Recommendation[];
}

export interface GenerationResult {
  images: string[];
  text: string;
}

export type AppStep = 'upload' | 'analyzing' | 'results' | 'generating' | 'preview';
