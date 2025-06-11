import type { Product, Category, Subcategory } from "@shared/schema";

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export class SEOService {
  private baseUrl: string;
  private siteName: string = "The Resin Studio";

  constructor(baseUrl: string = "https://your-domain.com") {
    this.baseUrl = baseUrl;
  }

  generateHomeSEO(): SEOData {
    return {
      title: "The Resin Studio - Premium Resin Art & Crafts | Handmade Custom Designs",
      description: "Discover premium resin art and crafts at The Resin Studio. Shop unique handmade resin products, custom designs, and high-quality art pieces. Free shipping on orders over $50.",
      keywords: "resin art, handmade crafts, custom resin designs, resin products, art studio, handcrafted items",
      ogTitle: "The Resin Studio - Premium Resin Art & Crafts",
      ogDescription: "Shop unique handmade resin art and custom designs. Premium quality crafts with free shipping.",
      canonicalUrl: this.baseUrl
    };
  }

  generateProductSEO(product: Product, category?: Category, subcategory?: Subcategory): SEOData {
    const categoryName = category?.name || "";
    const subcategoryName = subcategory?.name || "";
    
    // Clean price for display
    const price = typeof product.price === 'string' ? product.price : String(product.price || "");
    
    const title = `${product.name}${categoryName ? ` - ${categoryName}` : ""} | The Resin Studio`;
    const description = `${product.description.substring(0, 150)}... Shop ${product.name} at The Resin Studio.${price ? ` Starting at $${price}.` : ""} Premium handmade resin art with fast shipping.`;
    
    return {
      title,
      description,
      keywords: `${product.name}, ${categoryName}, ${subcategoryName}, resin art, handmade, custom design`.toLowerCase(),
      ogTitle: product.name,
      ogDescription: description,
      ogImage: product.imageUrl || undefined,
      canonicalUrl: `${this.baseUrl}/product/${product.id}`
    };
  }

  generateCategorySEO(category: Category, products?: Product[]): SEOData {
    const productCount = products?.length || 0;
    
    return {
      title: `${category.name} - Resin Art & Crafts | The Resin Studio`,
      description: `Explore our ${category.name.toLowerCase()} collection at The Resin Studio. ${category.description || `Discover premium ${category.name.toLowerCase()} resin art and handmade crafts.`} ${productCount} products available with free shipping.`,
      keywords: `${category.name}, resin art, handmade crafts, ${category.name.toLowerCase()} collection`.toLowerCase(),
      ogTitle: `${category.name} Collection - The Resin Studio`,
      ogDescription: `Shop premium ${category.name.toLowerCase()} resin art and crafts`,
      canonicalUrl: `${this.baseUrl}/category/${category.id}`
    };
  }

  generateSubcategorySEO(subcategory: Subcategory, category?: Category, products?: Product[]): SEOData {
    const categoryName = category?.name || "";
    const productCount = products?.length || 0;
    
    return {
      title: `${subcategory.name}${categoryName ? ` - ${categoryName}` : ""} | The Resin Studio`,
      description: `Shop ${subcategory.name.toLowerCase()} at The Resin Studio. ${subcategory.description || `Premium ${subcategory.name.toLowerCase()} collection with handcrafted resin art.`} ${productCount} products available.`,
      keywords: `${subcategory.name}, ${categoryName}, resin art, handmade, custom crafts`.toLowerCase(),
      ogTitle: `${subcategory.name} Collection`,
      ogDescription: `Premium ${subcategory.name.toLowerCase()} resin art and crafts`,
      canonicalUrl: `${this.baseUrl}/subcategory/${subcategory.id}/products`
    };
  }

  generateProductsSEO(): SEOData {
    return {
      title: "All Products - Resin Art & Crafts | The Resin Studio",
      description: "Browse our complete collection of handmade resin art and crafts. Unique designs, premium quality, and custom options available. Free shipping on orders over $50.",
      keywords: "resin products, handmade crafts, art collection, custom resin art, handcrafted items",
      ogTitle: "All Products - The Resin Studio",
      ogDescription: "Complete collection of premium resin art and handmade crafts",
      canonicalUrl: `${this.baseUrl}/products`
    };
  }

  generateSitemap(products: Product[], categories: Category[], subcategories: Subcategory[]): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${this.baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Products Page -->
  <url>
    <loc>${this.baseUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // Add individual products
    products.forEach(product => {
      sitemap += `  <url>
    <loc>${this.baseUrl}/product/${product.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add categories
    categories.forEach(category => {
      sitemap += `  <url>
    <loc>${this.baseUrl}/category/${category.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Add subcategories
    subcategories.forEach(subcategory => {
      sitemap += `  <url>
    <loc>${this.baseUrl}/subcategory/${subcategory.id}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;
    return sitemap;
  }
}

export const seoService = new SEOService();