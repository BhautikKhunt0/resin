// Script to add multiple sample images to a product for testing
const productId = 2107033888;

// Sample image URLs for testing
const sampleImages = [
  {
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
    priority: 0
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&h=500&fit=crop",
    priority: 1
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&h=500&fit=crop",
    priority: 2
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
    priority: 3
  }
];

async function addSampleImages() {
  const adminLogin = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
  });

  for (const image of sampleImages) {
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          imageUrl: image.imageUrl,
          imageBlob: null,
          priority: image.priority
        })
      });
      console.log(`Added image ${image.priority + 1}:`, response.status);
    } catch (error) {
      console.error(`Error adding image ${image.priority + 1}:`, error);
    }
  }
}

addSampleImages();