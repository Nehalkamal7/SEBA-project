import { RealNumberDiagram } from './RealNumberDiagram';

// Maps a string ID to a React Component
export const DIAGRAM_REGISTRY: Record<string, React.ComponentType<any>> = {
  'real-numbers-hierarchy': RealNumberDiagram,
};