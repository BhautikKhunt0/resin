import {
  CategoryModel,
  SubcategoryModel,
  ProductModel,
  ProductImageModel,
  AdminModel
} from "@shared/mongodb-schema";

export async function seedInitialData() {
  try {
    // Clear existing data and reseed with comprehensive catalog
    console.log('Clearing existing data...');
    await CategoryModel.deleteMany({});
    await SubcategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    await ProductImageModel.deleteMany({});
    await AdminModel.deleteMany({});

    console.log('Seeding initial data...');

    // Create categories
    const electronics = await CategoryModel.create({
      name: "Electronics",
      description: "Electronic devices and gadgets"
    });

    const clothing = await CategoryModel.create({
      name: "Clothing", 
      description: "Fashion and apparel"
    });

    const homeGarden = await CategoryModel.create({
      name: "Home & Garden",
      description: "Home and garden essentials"
    });

    // Create subcategories for Electronics
    const smartphones = await SubcategoryModel.create({
      name: "Smartphones",
      description: "Mobile phones and accessories",
      categoryId: electronics._id.toString()
    });

    const laptops = await SubcategoryModel.create({
      name: "Laptops",
      description: "Portable computers and notebooks",
      categoryId: electronics._id.toString()
    });

    const headphones = await SubcategoryModel.create({
      name: "Headphones",
      description: "Audio devices and speakers",
      categoryId: electronics._id.toString()
    });

    // Create subcategories for Clothing
    const menShirts = await SubcategoryModel.create({
      name: "Men's Shirts",
      description: "Dress shirts, casual shirts, and polo shirts",
      categoryId: clothing._id.toString()
    });

    // Create comprehensive product catalog with weight variants
    const products = await ProductModel.create([
      // Electronics - Smartphones
      {
        name: "iPhone 15 Pro Max",
        description: "Latest flagship iPhone with titanium design and advanced camera system. Features A17 Pro chip, 48MP camera system, and titanium build.",
        price: "1199.99",
        weight: "221g",
        categoryId: electronics._id.toString(),
        subcategoryId: smartphones._id.toString(),
        isFeatured: 1
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android phone with S Pen and incredible zoom capabilities. 200MP camera with 100x Space Zoom.",
        price: "1099.99",
        weight: "232g",
        categoryId: electronics._id.toString(),
        subcategoryId: smartphones._id.toString(),
        isFeatured: 1
      },
      {
        name: "MacBook Pro 16-inch",
        description: "Powerful laptop with M3 Max chip, 18-hour battery life, and stunning Liquid Retina XDR display.",
        price: "2499.99",
        weight: "2.1kg",
        categoryId: electronics._id.toString(),
        subcategoryId: laptops._id.toString(),
        isFeatured: 1
      },
      {
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling headphones with 30-hour battery life and premium sound quality.",
        price: "399.99",
        weight: "250g",
        categoryId: electronics._id.toString(),
        subcategoryId: headphones._id.toString(),
        isFeatured: 1
      },
      // Clothing with size/weight variants
      {
        name: "Premium Cotton T-Shirt",
        description: "100% organic cotton t-shirt with comfortable fit and durable construction. Available in multiple sizes.",
        price: "29.99",
        weight: "Medium",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        isFeatured: 0
      },
      {
        name: "Premium Cotton T-Shirt",
        description: "100% organic cotton t-shirt with comfortable fit and durable construction. Available in multiple sizes.",
        price: "32.99",
        weight: "Large",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        isFeatured: 0
      },
      {
        name: "Premium Cotton T-Shirt",
        description: "100% organic cotton t-shirt with comfortable fit and durable construction. Available in multiple sizes.",
        price: "34.99",
        weight: "X-Large",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        isFeatured: 0
      }
    ]);

    // Create multiple product images for each product with dummy base64 data
    const dummyImages = [
      // Small dummy images in base64 format (1x1 pixel PNG files)
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Red pixel
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAkN5S0gAAAABJRU5ErkJggg==', // Green pixel
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGhgYGAAAQQAAPO7aPAAAAgAAAAASUVORK5CYII=', // Blue pixel
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgAAACAAEBWQ7ePAAAAASUVORK5CYII=', // White pixel
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgAAACAAEBWQ7eAAAAASUVORK5CYII='  // Black pixel
    ];

    // Add multiple images for each product
    for (const product of products) {
      const productImages = [];
      for (let i = 0; i < 4; i++) {
        productImages.push({
          productId: product._id.toString(),
          imageBlob: Buffer.from(dummyImages[i % dummyImages.length], 'base64'),
          priority: i,
          createdAt: new Date()
        });
      }
      await ProductImageModel.create(productImages);
    }

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@modernshop.com";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "$2a$10$rVYMLOYr7zFIzaQ.Y5xBjOo0.8pq6gR7p9c9jhTWVZYFxVN.BQEhK";
    
    await AdminModel.create({
      email: adminEmail,
      password: adminPasswordHash // password: admin123
    });

    console.log('✓ Initial data seeded successfully');
    console.log(`✓ Created ${products.length} products with multiple images`);
    console.log('✓ Products include weight/size variants and shipping information');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}