import React from 'react';

export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  // Simple and safe parser for inline tokens
  const parseInline = (text) => {
    // Bold: **text**
    let parts = [text];
    
    // Bold formatting
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    // Code ticks: `code`
    const codeRegex = /`(.*?)`/g;

    // Link: [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;

    // Quick structural parsing
    // For simplicity, we convert tokens sequentially or render standard tags.
    // Let's do a basic parse:
    const renderText = (str) => {
      let elements = [];
      let lastIndex = 0;
      
      // Inline code
      const inlineCodeMatch = [...str.matchAll(codeRegex)];
      const boldMatches = [...str.matchAll(boldRegex)];
      const linkMatches = [...str.matchAll(linkRegex)];

      // Combine matches and sort by index
      let allMatches = [
        ...inlineCodeMatch.map(m => ({ type: 'code', text: m[1], index: m.index, length: m[0].length })),
        ...boldMatches.map(m => ({ type: 'bold', text: m[1], index: m.index, length: m[0].length })),
        ...linkMatches.map(m => ({ type: 'link', text: m[1], href: m[2], index: m.index, length: m[0].length }))
      ].sort((a, b) => a.index - b.index);

      let currentPos = 0;
      allMatches.forEach((m, idx) => {
        if (m.index < currentPos) return; // skip overlapping
        
        // Text before match
        if (m.index > currentPos) {
          elements.push(str.substring(currentPos, m.index));
        }

        // Match rendering
        if (m.type === 'code') {
          elements.push(
            <code key={idx} className="bg-gray-100 dark:bg-[#21262d] px-1 py-0.5 rounded text-red-600 dark:text-red-400 font-mono text-xs">
              {m.text}
            </code>
          );
        } else if (m.type === 'bold') {
          elements.push(<strong key={idx} className="font-bold">{m.text}</strong>);
        } else if (m.type === 'link') {
          elements.push(
            <a key={idx} href={m.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              {m.text}
            </a>
          );
        }
        
        currentPos = m.index + m.length;
      });

      if (currentPos < str.length) {
        elements.push(str.substring(currentPos));
      }

      return elements.length > 0 ? elements : str;
    };

    return renderText(text);
  };

  // Split content into block lines
  const lines = content.split('\n');
  const blocks = [];
  let listItems = [];
  let inCodeBlock = false;
  let codeLines = [];

  lines.forEach((line, index) => {
    // Code block check
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        blocks.push(
          <pre key={`code-${index}`} className="bg-gray-100 dark:bg-[#161b22] p-3 rounded-md overflow-x-auto font-mono text-xs text-gray-800 dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] my-3">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Headers
    if (line.startsWith('# ')) {
      blocks.push(<h1 key={index} className="text-xl font-bold border-b border-gray-200 dark:border-[#30363d] pb-1 mt-4 mb-2">{parseInline(line.substring(2))}</h1>);
    } else if (line.startsWith('## ')) {
      blocks.push(<h2 key={index} className="text-lg font-semibold mt-3 mb-2">{parseInline(line.substring(3))}</h2>);
    } else if (line.startsWith('### ')) {
      blocks.push(<h3 key={index} className="text-base font-semibold mt-2 mb-1">{parseInline(line.substring(4))}</h3>);
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(<li key={`li-${index}`} className="ml-5 list-disc mb-1">{parseInline(line.substring(2))}</li>);
    } else {
      // Flush lists if any
      if (listItems.length > 0) {
        blocks.push(<ul key={`ul-${index}`} className="my-2">{listItems}</ul>);
        listItems = [];
      }
      
      // Paragraph
      if (line.trim()) {
        blocks.push(<p key={index} className="my-2 leading-relaxed text-sm">{parseInline(line)}</p>);
      }
    }
  });

  // Flush remaining lists
  if (listItems.length > 0) {
    blocks.push(<ul key="ul-end" className="my-2">{listItems}</ul>);
  }

  return <div className="markdown-body text-[#1f2328] dark:text-[#c9d1d9]">{blocks}</div>;
}
