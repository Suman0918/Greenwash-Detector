import React, { useState, useEffect } from 'react';
import FloatingButton from '../components/FloatingButton';
import OverlaySidebar from '../components/OverlaySidebar';
import './ContentScript.css';

const ContentScript = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [productData, setProductData] = useState(null);
  const [initialScrapeAttempted, setInitialScrapeAttempted] = useState(false);

  // Function to scrape product data from the current page
  const scrapeProductData = () => {
    let title = '';
    let description = '';
    let imageUrl = '';
    let price = '';
    let brand = '';
    
    // This is a more comprehensive scraping logic for each e-commerce site
    
    // H&M
    if (window.location.hostname.includes('hm.com')) {
      // H&M specific selectors
      title = document.querySelector('h1.product-heading, h1[data-testid="product-title"]')?.textContent || '';
      
      // Get all possible description elements
      const descriptionElements = [
        document.querySelector('.pdp-description-text'),
        document.querySelector('.product-detail-description'),
        document.querySelector('[data-testid="product-detail-description"]'),
        document.querySelector('.product-composition'),
        document.querySelector('.product-description-text')
      ].filter(Boolean);
      
      // Combine all description texts
      description = descriptionElements.map(el => el.textContent).join(' ');
      
      // Get main product image
      const imgEl = document.querySelector('.product-detail-main-image-container img, .product-media-container img');
      imageUrl = imgEl?.src || '';
      
      // Get price and brand
      price = document.querySelector('.price-value, [data-testid="product-price"]')?.textContent || '';
      brand = 'H&M'; // Default brand for H&M site
    }
    // Myntra
    else if (window.location.hostname.includes('myntra.com')) {
      // Myntra specific selectors
      title = document.querySelector('h1.pdp-title, h1.pdp-name')?.textContent || '';
      
      // Get detailed description
      const descSelectors = [
        '.pdp-product-description-content',
        '.index-row',
        '.pdp-sizeFitDesc',
        '.pdp-product-description'
      ];
      
      for (const selector of descSelectors) {
        const els = document.querySelectorAll(selector);
        if (els.length) {
          description += Array.from(els).map(el => el.textContent).join(' ');
        }
      }
      
      // Additional product details
      const specRows = document.querySelectorAll('.index-row');
      specRows.forEach(row => {
        description += ' ' + row.textContent;
      });
      
      // Get image
      imageUrl = document.querySelector('.image-grid-image, .image-grid-imageContainer img')?.src || '';
      
      // Get price and brand
      price = document.querySelector('.pdp-price')?.textContent || '';
      brand = document.querySelector('.pdp-title .brand-name, .pdp-name .brand-name')?.textContent || 'Myntra';
    }
    // Zara
    else if (window.location.hostname.includes('zara.com')) {
      // Zara specific selectors
      title = document.querySelector('.product-detail-info h1, .product-name')?.textContent || '';
      
      // Combine all description elements
      const descriptionEls = [
        document.querySelector('.product-detail-info p'),
        document.querySelector('.product-detail-description'),
        document.querySelector('.composition-list')
      ].filter(Boolean);
      
      description = descriptionEls.map(el => el.textContent).join(' ');
      
      // Additional details - composition/materials
      const compEls = document.querySelectorAll('.composition-list li');
      if (compEls.length) {
        description += ' Composition: ' + Array.from(compEls).map(el => el.textContent).join(' ');
      }
      
      // Get main product image
      imageUrl = document.querySelector('.product-detail-main-image img, .product-image img')?.src || '';
      
      // Get price and brand
      price = document.querySelector('.price__amount, .product-price')?.textContent || '';
      brand = 'Zara'; // Default brand for Zara
    }
    // Fallback - generic selectors that might work on various e-commerce sites
    else {
      // Try common product page selectors
      const titleSelectors = [
        'h1.product-title',
        'h1.product-name',
        'h1.product-heading',
        '.product-title h1',
        '.product-name',
        '.product h1'
      ];
      
      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          title = el.textContent;
          break;
        }
      }
      
      // If still no title, use page title
      if (!title) {
        title = document.title;
      }
      
      // Try to find description
      const descriptionSelectors = [
        '.product-description',
        '.description',
        '.product-details',
        '.product-info',
        '.details',
        '[data-product-description]',
        '[data-testid="product-description"]'
      ];
      
      for (const selector of descriptionSelectors) {
        const els = document.querySelectorAll(selector);
        if (els.length) {
          description = Array.from(els).map(el => el.textContent).join(' ');
          break;
        }
      }
      
      // Try to find meta description if no description found
      if (!description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          description = metaDesc.getAttribute('content') || '';
        }
      }
      
      // Find image - first look for product images, then any large image
      const imgSelectors = [
        'img[itemprop="image"]',
        '.product-image img',
        '.main-image img',
        '.gallery-image img',
        '.product img'
      ];
      
      for (const selector of imgSelectors) {
        const img = document.querySelector(selector);
        if (img && img.src) {
          imageUrl = img.src;
          break;
        }
      }
      
      // Try to find price
      const priceSelectors = [
        '.price',
        '.product-price',
        '.price-value',
        '[data-testid="product-price"]',
        '[itemprop="price"]'
      ];
      
      for (const selector of priceSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          price = el.textContent;
          break;
        }
      }
      
      // Try to find brand
      const brandSelectors = [
        '.brand',
        '.product-brand',
        '[itemprop="brand"]',
        '.brand-name'
      ];
      
      for (const selector of brandSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          brand = el.textContent;
          break;
        }
      }
    }
    
    // Clean up text
    title = title.trim().replace(/\s+/g, ' ');
    description = description.trim().replace(/\s+/g, ' ');
    price = price.trim();
    brand = brand.trim();
    
    return { title, description, imageUrl, price, brand };
  };

  // Initial scrape when component mounts - prepare data for when button is clicked
  useEffect(() => {
    if (!initialScrapeAttempted) {
      // Attempt initial scrape
      try {
        const data = scrapeProductData();
        if (data.title || data.description) {
          setProductData(data);
        }
      } catch (error) {
        console.error('Initial scrape error:', error);
      }
      
      setInitialScrapeAttempted(true);
    }
    
    // Handle page URL changes (product navigation within same site)
    const handleUrlChange = () => {
      setIsOpen(false);
      
      // Wait a bit for page to load new content
      setTimeout(() => {
        try {
          const data = scrapeProductData();
          if (data.title || data.description) {
            setProductData(data);
          }
        } catch (error) {
          console.error('URL change scrape error:', error);
        }
      }, 1000);
    };
    
    // Setup URL change detection
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        handleUrlChange();
      }
    });
    
    observer.observe(document, { subtree: true, childList: true });
    
    return () => observer.disconnect();
  }, [initialScrapeAttempted]);

  // Toggle sidebar
  const toggleSidebar = () => {
    if (!isOpen) {
      // Fresh scrape when opening to ensure latest data
      try {
        const data = scrapeProductData();
        setProductData(data);
      } catch (error) {
        console.error('Toggle scrape error:', error);
      }
    }
    setIsOpen(!isOpen);
  };
  
  // Close sidebar
  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="eco-inspector-overlay">
      <FloatingButton onClick={toggleSidebar} isOpen={isOpen} />
      <OverlaySidebar isOpen={isOpen} onClose={closeSidebar} productData={productData} />
    </div>
  );
};

export default ContentScript;