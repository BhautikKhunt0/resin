import {
  CategoryModel,
  SubcategoryModel,
  ProductModel,
  AdminModel
} from "@shared/mongodb-schema";

export async function seedInitialData() {
  try {
    // Check if data already exists
    const existingCategories = await CategoryModel.countDocuments();
    if (existingCategories > 0) {
      console.log('Data already seeded, skipping...');
      return;
    }

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

    const sports = await CategoryModel.create({
      name: "Sports",
      description: "Sports and fitness equipment"
    });

    // Create subcategories
    const smartphones = await SubcategoryModel.create({
      name: "Smartphones",
      description: "Mobile phones",
      categoryId: electronics._id.toString()
    });

    const laptops = await SubcategoryModel.create({
      name: "Laptops",
      description: "Portable computers",
      categoryId: electronics._id.toString()
    });

    const headphones = await SubcategoryModel.create({
      name: "Headphones",
      description: "Audio devices",
      categoryId: electronics._id.toString()
    });

    const menShirts = await SubcategoryModel.create({
      name: "Men's Shirts",
      description: "Shirts for men",
      categoryId: clothing._id.toString()
    });

    const womenDresses = await SubcategoryModel.create({
      name: "Women's Dresses",
      description: "Dresses for women",
      categoryId: clothing._id.toString()
    });

    // Create products
    await ProductModel.create([
      {
        name: "Premium Wireless Headphones",
        description: "High-quality sound with noise cancellation technology",
        price: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: headphones._id.toString(),
        stock: 45
      },
      {
        name: "Smart Watch Pro",
        description: "Advanced fitness tracking and smart notifications",
        price: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        stock: 32
      },
      {
        name: "Ultra-thin Laptop",
        description: "Powerful performance in a portable design",
        price: "1299.99",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: laptops._id.toString(),
        stock: 18
      },
      {
        name: "Premium Smartphone",
        description: "Latest flagship model with advanced camera system",
        price: "899.99",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: smartphones._id.toString(),
        stock: 25
      },
      {
        name: "Wireless Gaming Mouse",
        description: "High-precision gaming mouse with customizable buttons",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        stock: 67
      },
      {
        name: "Casual Cotton T-Shirt",
        description: "Comfortable everyday wear in various colors",
        price: "24.99",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        stock: 150
      },
      {
        name: "Elegant Summer Dress",
        description: "Perfect for special occasions and everyday elegance",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: womenDresses._id.toString(),
        stock: 42
      },
      {
        name: "Professional Dress Shirt",
        description: "Crisp and clean for business and formal occasions",
        price: "59.99",
        imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        stock: 88
      }
    ]);

    // Create default admin
    const existingAdmin = await AdminModel.findOne({ email: "admin@modernshop.com" });
    if (!existingAdmin) {
      await AdminModel.create({
        email: "admin@modernshop.com",
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // "password" hashed
      });
    }

    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
}