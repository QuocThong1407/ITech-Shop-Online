import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Input,
  Tabs,
  Space,
  Popconfirm,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import TinyMCEEditor from '../TextEditor/TextEditor';
import './DescriptionEditor.css';

export default function DescriptionEditor({ value, onChange, onUploadedImages }) {
  const [descriptionMode, setDescriptionMode] = useState('simple'); // 'simple' or 'sections'
  const [simpleText, setSimpleText] = useState('');
  const [sections, setSections] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionData, setEditingSectionData] = useState({ title: '', content: '' });

  // Initialize from value
  useEffect(() => {
    if (value) {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (parsed.type === 'sections' && Array.isArray(parsed.sections)) {
          setDescriptionMode('sections');
          setSections(parsed.sections);
        } else if (parsed.type === 'simple' && typeof parsed.content === 'string') {
          setDescriptionMode('simple');
          setSimpleText(parsed.content);
        }
      } catch {
        // If parsing fails, treat as simple string
        setDescriptionMode('simple');
        setSimpleText(typeof value === 'string' ? value : '');
      }
    }
  }, [value]);

  // Handle simple text change
  const handleSimpleTextChange = (content) => {
    setSimpleText(content);
    const descriptionData = {
      type: 'simple',
      content: content,
    };
    onChange(JSON.stringify(descriptionData));
  };

  // Handle mode switch
  const handleModeChange = (newMode) => {
    setDescriptionMode(newMode);
    if (newMode === 'simple') {
      const descriptionData = {
        type: 'simple',
        content: simpleText,
      };
      onChange(JSON.stringify(descriptionData));
    } else {
      const descriptionData = {
        type: 'sections',
        sections: sections,
      };
      onChange(JSON.stringify(descriptionData));
    }
  };

  // Add new section
  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      title: 'New Section',
      content: '',
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    const descriptionData = {
      type: 'sections',
      sections: newSections,
    };
    onChange(JSON.stringify(descriptionData));
  };

  // Start editing section
  const handleEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditingSectionData({ title: section.title, content: section.content });
  };

  // Save edited section
  const handleSaveSection = () => {
    const newSections = sections.map((section) =>
      section.id === editingSectionId
        ? {
            ...section,
            title: editingSectionData.title,
            content: editingSectionData.content,
          }
        : section
    );
    setSections(newSections);
    const descriptionData = {
      type: 'sections',
      sections: newSections,
    };
    onChange(JSON.stringify(descriptionData));
    setEditingSectionId(null);
    setEditingSectionData({ title: '', content: '' });
  };

  // Auto-save section when editing (called on every editor change)
  const handleSectionContentChange = (content) => {
    const updatedEditingData = {
      ...editingSectionData,
      content: content,
    };
    setEditingSectionData(updatedEditingData);

    // Auto-save: update the section immediately in the parent state
    const newSections = sections.map((section) =>
      section.id === editingSectionId
        ? {
            ...section,
            title: updatedEditingData.title,
            content: updatedEditingData.content,
          }
        : section
    );
    setSections(newSections);
    const descriptionData = {
      type: 'sections',
      sections: newSections,
    };
    onChange(JSON.stringify(descriptionData));
  };

  // Delete section
  const handleDeleteSection = (id) => {
    const newSections = sections.filter((section) => section.id !== id);
    setSections(newSections);
    const descriptionData = {
      type: 'sections',
      sections: newSections,
    };
    onChange(JSON.stringify(descriptionData));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditingSectionData({ title: '', content: '' });
  };

  const simpleTab = {
    key: 'simple',
    label: 'Simple Text',
    children: (
      <div className="description-tab-content">
        <p className="section-hint">
          Use a simple text editor for basic product descriptions.
        </p>
        <TinyMCEEditor
          value={simpleText}
          onChange={handleSimpleTextChange}
          onUploadedImages={onUploadedImages}
        />
      </div>
    ),
  };

  const sectionsTab = {
    key: 'sections',
    label: 'Sections',
    children: (
      <div className="description-tab-content">
        <p className="section-hint">
          Organize your description into multiple sections with headers and rich content.
        </p>

        {sections.length === 0 ? (
          <Empty
            description="No sections yet"
            style={{ marginTop: '40px', marginBottom: '40px' }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSection}
            >
              Create First Section
            </Button>
          </Empty>
        ) : (
          <div className="sections-list">
            {sections.map((section) => (
              <Card
                key={section.id}
                className="section-card"
                style={{ marginBottom: '16px' }}
                title={
                  editingSectionId === section.id ? (
                    <Input
                      value={editingSectionData.title}
                      onChange={(e) =>
                        setEditingSectionData({
                          ...editingSectionData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Section title"
                      style={{ maxWidth: '300px' }}
                    />
                  ) : (
                    <span>{section.title}</span>
                  )
                }
                extra={
                  editingSectionId === section.id ? (
                    <Space size="small">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          // Just close the editor, content is already auto-saved
                          setEditingSectionId(null);
                          setEditingSectionData({ title: '', content: '' });
                        }}
                      >
                        Done
                      </Button>
                      <Button
                        size="small"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Space>
                  ) : (
                    <Space size="small">
                      <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSection(section)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete Section"
                        description="Are you sure you want to delete this section?"
                        onConfirm={() => handleDeleteSection(section.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          danger
                          ghost
                          size="small"
                          icon={<DeleteOutlined />}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  )
                }
              >
                {editingSectionId === section.id ? (
                  <div className="editor-content">
                    <TinyMCEEditor
                      value={editingSectionData.content}
                      onChange={handleSectionContentChange}
                      onUploadedImages={onUploadedImages}
                    />
                  </div>
                ) : (
                  <div
                    className="section-content-preview"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </Card>
            ))}

            <Button
              block
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddSection}
              style={{ marginTop: '16px' }}
            >
              Add Another Section
            </Button>
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="description-editor">
      <Tabs
        activeKey={descriptionMode}
        onChange={handleModeChange}
        items={[simpleTab, sectionsTab]}
        className="description-tabs"
      />
    </div>
  );
}
