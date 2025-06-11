import { useEffect } from "react";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:type', 'website', true);
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }
    
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage);
    }

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'The Resin Studio');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl]);

  return null;
}