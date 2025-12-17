import React from 'react';
import ReactMarkdown from 'react-markdown';

const ScoreAnalysis = ({ reasoning }) => {

  const getCleanText = () => {
    if (!reasoning) return '';
    const parts = reasoning.split('---');
    return parts[0].trim();
  };

  // Determine color based on the full context around the bold text
  const getBoldColor = (text, fullText) => {
    // Find position of this text in the full document
    const position = fullText.indexOf(text);
    if (position === -1) return '#00E5FF'; // Default Cyan

    // Get text before this position
    const before = fullText.substring(0, position);

    // Count which section we're in by counting headers
    const strengthsIndex = before.lastIndexOf('Key Strengths');
    const risksIndex = before.lastIndexOf('Critical Risks');

    // If we're after "Critical Risks" and it's the most recent section
    if (risksIndex > strengthsIndex && risksIndex !== -1) {
      return '#ef4444'; // Red-500
    }
    // If we're after "Key Strengths" and it's the most recent section
    else if (strengthsIndex > risksIndex && strengthsIndex !== -1) {
      return '#00FF41'; // Neon Green
    }

    return '#00E5FF'; // Default Cyan
  };

  const fullText = getCleanText();

  return (
    <div className="prose prose-invert max-w-none text-zinc-300 score-analysis">
      <ReactMarkdown
        components={{
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold text-white mt-6 mb-2 border-b border-white/10 pb-2 flex items-center gap-2" {...props} />
          ),

          strong: ({ node, children, ...props }) => {
            const text = children?.toString() || '';
            const color = getBoldColor(text, fullText);

            return (
              <strong style={{ color: color }} className="font-bold" {...props}>
                {children}
              </strong>
            );
          },

          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed text-zinc-400" {...props} />
          ),

          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-[#00E5FF]" {...props} />
          ),

          li: ({ node, ...props }) => (
            <li className="pl-1" {...props} />
          )
        }}
      >
        {fullText}
      </ReactMarkdown>
    </div>
  );
};

export default ScoreAnalysis;