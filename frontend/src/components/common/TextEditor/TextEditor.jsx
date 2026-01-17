import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

export default function TinyMCEEditor({ value, onChange, onUploadedImages }) {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    onChange(content);
  };

  const placeCursorAtEnd = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      setTimeout(() => {
        // Safely check if selection and getBody are available
        if (editor.selection && editor.getBody()) {
          editor.selection.select(editor.getBody(), true);
          editor.selection.collapse(false);
        }
      }, 0); // Set a short delay
    }
  };

  // Handle image upload - async handler
  const handleImageUpload = async (blobInfo, progress, failure) => {
    try {
      const file = new File([blobInfo.blob()], blobInfo.filename(), {
        type: blobInfo.blob().type,
      });

      const formData = new FormData();
      formData.append('file', file);

      const apiDomain = import.meta.env.VITE_API_DOMAIN;
      
      const response = await fetch(`${apiDomain}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.data.url;

      // Notify parent component about uploaded image for tracking
      if (onUploadedImages) {
        onUploadedImages(imageUrl);
      }

      progress(100);
      
      // After image is inserted, trigger onChange to capture the updated content
      setTimeout(() => {
        if (editorRef.current) {
          const updatedContent = editorRef.current.getContent();
          onChange(updatedContent);
        }
      }, 100);
      
      // Return the URL - TinyMCE will automatically insert it
      return imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      failure('Upload failed: ' + error.message);
      throw error;
    }
  };

  // Handle file picker for image selection
  const handleFilePicker = (callback, value, meta) => {
    if (meta.filetype === 'image') {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const formData = new FormData();
            formData.append('file', file);

            const apiDomain = import.meta.env.VITE_API_DOMAIN;
            
            const response = await fetch(`${apiDomain}/upload`, {
              method: 'POST',
              credentials: 'include',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            const data = await response.json();
            const imageUrl = data.data.url;


            // Notify parent component
            if (onUploadedImages) {
              onUploadedImages(imageUrl);
            }

            // Call the callback to insert the image
            callback(imageUrl, { title: file.name });
            
            // After image is inserted, trigger onChange to capture the updated content
            setTimeout(() => {
              if (editorRef.current) {
                const updatedContent = editorRef.current.getContent();
                onChange(updatedContent);
              }
            }, 100);
          } catch (error) {
            console.error('File picker upload error:', error);
            callback('', { title: file.name });
          }
        }
      };

      input.click();
    }
  };

  return (
    <Editor
      apiKey="wo5yr5cvm21r10czqjpc8cx0jazms2ld0qx1eexiit6tvx2l"
      onInit={(evt, editor) => {
        editorRef.current = editor;
        // Place cursor at the end when editor is ready
        placeCursorAtEnd();
      }}
      value={value} // Use 'value' instead of 'initialValue'
      onEditorChange={handleEditorChange}
      init={{
        plugins: [
          'anchor',
          'autolink',
          'charmap',
          'codesample',
          'emoticons',
          'image',
          'link',
          'lists',
          'media',
          'paste',
          'searchreplace',
          'table',
          'visualblocks',
          'wordcount',
        ],
        toolbar:
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | checklist numlist bullist indent outdent | link image media table | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | emoticons charmap | removeformat',
        images_upload_handler: handleImageUpload,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: handleFilePicker,
        paste_data_images: true,
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: (request, respondWith) =>
          respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        exportpdf_converter_options: {
          format: 'Letter',
          margin_top: '1in',
          margin_right: '1in',
          margin_bottom: '1in',
          margin_left: '1in',
        },
        exportword_converter_options: { document: { size: 'Letter' } },
        importword_converter_options: {
          formatting: { styles: 'inline', resets: 'inline', defaults: 'inline' },
        },
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
            background-color: #ffffff;
            padding: 1rem;
            margin: 0;
            max-width: 100%;
          }
          p { margin: 0 0 1rem 0; }
          h1, h2, h3, h4, h5, h6 { margin: 1.5rem 0 1rem 0; }
        `,
        width: '100%',
        min_height: 650,
        resize: true,
        autoresize_bottom_margin: 50,
        skin: 'oxide',
        menubar: false,
        branding: false,
        elementpath: false,
        statusbar: true,
        border: false,
        style_formats_autohide: true,
        content_css: 'default',
        placeholder: 'Start writing...',
        setup: (editor) => {
          editor.on('init', () => {
            editor.getContainer().style.borderRadius = '0.375rem';
            editor.getContainer().style.border = '1px solid #e5e7eb';
          });
          
          // Handle image insertion and other changes
          editor.on('change', () => {
            const content = editor.getContent();
            onChange(content);
          });

          editor.on('ExecCommand', (e) => {
            if (e.command === 'mceInsertContent' || e.command === 'InsertImage') {
              setTimeout(() => {
                const content = editor.getContent();
                onChange(content);
              }, 50);
            }
          });

          // Keep existing Delete key handler
          editor.on('keydown', (e) => {
            if (e.key === 'Delete') {
              e.preventDefault();
              editor.execCommand('mceDelete');
            }
          });
        },
      }}
    />
  );
}
