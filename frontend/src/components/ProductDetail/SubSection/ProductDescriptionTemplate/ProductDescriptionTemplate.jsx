import { useParams } from 'react-router-dom';
import { Collapse, Spin, Empty, Typography, Divider } from 'antd';
import { useEffect, useState } from 'react';
import productService from '../../../../services/productService';
import './ProductDescriptionTemplate.css';

const { Title } = Typography;

const ProductDescriptionTemplate = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(productId);
        setProduct(response?.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <Empty description="Product not found" />;
  }

  // Parse description - support both old and new formats
  let simpleContent = null;
  let sectionItems = [];

  try {
    const parsed =
      typeof product.description === 'string'
        ? JSON.parse(product.description)
        : product.description;

    // New format: { simpleText: "...", sections: [...] }
    if (parsed.simpleText !== undefined) {
      simpleContent = parsed.simpleText;
      if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        sectionItems = parsed.sections.map((section, index) => ({
          key: index,
          label: section.title,
          children: (
            <div
              className="section-content-html"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          ),
        }));
      }
    }
    // Old format: { type: 'sections', sections: [...] }
    else if (parsed.type === 'sections' && Array.isArray(parsed.sections)) {
      sectionItems = parsed.sections.map((section, index) => ({
        key: index,
        label: section.title,
        children: (
          <div
            className="section-content-html"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        ),
      }));
    }
    // Old format: { type: 'simple', content: "..." }
    else if (parsed.type === 'simple' && typeof parsed.content === 'string') {
      simpleContent = parsed.content;
    }
  } catch {
    // Fallback: treat as plain HTML string (legacy or plain text)
    simpleContent = product.description;
  }

  const hasContent = simpleContent || sectionItems.length > 0;

  return (
    <div className="product-description-template">
      {/* Simple text content (always shown first if present) */}
      {simpleContent && (
        <div
          className="description-simple-content"
          dangerouslySetInnerHTML={{ __html: simpleContent }}
        />
      )}

      {/* Section divider if both exist */}
      {simpleContent && sectionItems.length > 0 && <Divider />}

      {/* Sections (shown below simple text) */}
      {sectionItems.length > 0 && (
        <div className="description-sections">
          <Collapse
            items={sectionItems}
            defaultActiveKey={[0]}
            accordion={false}
            className="description-collapse"
          />
        </div>
      )}

      {/* No content */}
      {!hasContent && <Empty description="No description available" />}
    </div>
  );
};

export default ProductDescriptionTemplate;