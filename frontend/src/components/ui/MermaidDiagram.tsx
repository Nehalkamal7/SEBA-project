import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram = ({ chart }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    // Initialize mermaid configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        try {
          // Generate a unique ID for this render to avoid conflicts
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // Render the SVG
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error);
          setSvg('<div class="text-red-500 p-4">Error rendering diagram</div>');
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div 
      ref={containerRef}
      className="mermaid-container w-full flex justify-center py-4 bg-white dark:bg-gray-800 rounded-lg overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};