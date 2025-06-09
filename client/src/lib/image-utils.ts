export function getCategoryImage(category: { name: string; imageUrl?: string | null; imageBlob?: string | null }): string | null {
  // Priority: blob > imageUrl
  if (category.imageBlob) {
    return `data:image/jpeg;base64,${category.imageBlob}`;
  }
  
  if (category.imageUrl && category.imageUrl.trim() !== '') {
    return category.imageUrl;
  }
  
  return null;
}

export function getSubcategoryImage(subcategory: { name: string; imageUrl?: string | null; imageBlob?: string | null }): string | null {
  // Priority: blob > imageUrl
  if (subcategory.imageBlob) {
    return `data:image/jpeg;base64,${subcategory.imageBlob}`;
  }
  
  if (subcategory.imageUrl && subcategory.imageUrl.trim() !== '') {
    return subcategory.imageUrl;
  }
  
  return null;
}

export function getProductImage(product: { name: string; imageUrl?: string | null; imageBlob?: string | null }): string | null {
  // Priority: blob > imageUrl
  if (product.imageBlob) {
    return `data:image/jpeg;base64,${product.imageBlob}`;
  }
  
  if (product.imageUrl && product.imageUrl.trim() !== '') {
    return product.imageUrl;
  }
  
  return null;
}