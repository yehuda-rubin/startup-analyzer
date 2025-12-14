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
    if (position === -1) return '#16a085';
    
    // Get text before this position
    const before = fullText.substring(0, position);
    
    // Count which section we're in by counting headers
    const strengthsIndex = before.lastIndexOf('Key Strengths');
    const risksIndex = before.lastIndexOf('Critical Risks');
    
    // If we're after "Critical Risks" and it's the most recent section
    if (risksIndex > strengthsIndex && risksIndex !== -1) {
      return '#e74c3c'; // Red
    }
    // If we're after "Key Strengths" and it's the most recent section
    else if (strengthsIndex > risksIndex && strengthsIndex !== -1) {
      return '#27ae60'; // Green
    }
    
    return '#16a085'; // Default teal
  };

  const fullText = getCleanText();

  return (
    <div>
      <ReactMarkdown
        components={{
          h3: ({node, ...props}) => (
            <h3 style={{ 
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#2c3e50',
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
              borderBottom: '2px solid #ecf0f1',
              paddingBottom: '0.35rem'
            }} {...props} />
          ),
          
          strong: ({node, children, ...props}) => {
            const text = children?.toString() || '';
            const color = getBoldColor(text, fullText);
            
            return (
              <strong style={{ 
                fontWeight: '700',
                color: color
              }} {...props}>
                {children}
              </strong>
            );
          },
          
          p: ({node, ...props}) => (
            <p style={{ 
              marginBottom: '0.75rem',
              lineHeight: '1.6',
              color: '#555'
            }} {...props} />
          ),
          
          ul: ({node, ...props}) => (
            <ul style={{ 
              marginLeft: '1.25rem',
              marginBottom: '0.75rem',
              listStyleType: 'disc'
            }} {...props} />
          ),
          
          li: ({node, ...props}) => (
            <li style={{ 
              marginBottom: '0.35rem',
              lineHeight: '1.5'
            }} {...props} />
          )
        }}
      >
        {fullText}
      </ReactMarkdown>
    </div>
  );
};

export default ScoreAnalysis;