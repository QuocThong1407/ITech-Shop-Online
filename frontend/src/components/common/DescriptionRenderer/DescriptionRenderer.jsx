import React from 'react';
import './DescriptionRenderer.css';

export default function DescriptionRenderer({ description }) {
  if (!description) {
    return <div className="description-renderer-empty">No description available</div>;
  }

  try {
    const parsed = typeof description === 'string' ? JSON.parse(description) : description;

    if (parsed.type === 'sections' && Array.isArray(parsed.sections)) {
      return (
        <div className="description-renderer sections-view">
          {parsed.sections.map((section, index) => (
            <div key={index} className="renderer-section">
              <h2 className="section-title">{section.title}</h2>
              <div
                className="section-body"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>
      );
    } else if (parsed.type === 'simple' && typeof parsed.content === 'string') {
      return (
        <div
          className="description-renderer simple-view"
          dangerouslySetInnerHTML={{ __html: parsed.content }}
        />
      );
    }
  } catch (error) {
    // If parsing fails, treat as plain HTML
    console.warn('Failed to parse description:', error);
  }

  // Fallback: treat as plain HTML if not valid JSON
  return (
    <div
      className="description-renderer fallback-view"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}
