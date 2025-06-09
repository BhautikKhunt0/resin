import {
  CategoryModel,
  SubcategoryModel,
  ProductModel,
  AdminModel
} from "@shared/mongodb-schema";

export async function seedInitialData() {
  try {
    // Clear existing data and reseed with comprehensive catalog
    console.log('Clearing existing data...');
    await CategoryModel.deleteMany({});
    await SubcategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
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

    const sports = await CategoryModel.create({
      name: "Sports & Fitness",
      description: "Sports and fitness equipment"
    });

    const beauty = await CategoryModel.create({
      name: "Beauty & Health",
      description: "Beauty and health products"
    });

    const books = await CategoryModel.create({
      name: "Books & Media",
      description: "Books, movies, and digital media"
    });

    const automotive = await CategoryModel.create({
      name: "Automotive",
      description: "Car accessories and parts"
    });

    const jewelry = await CategoryModel.create({
      name: "Jewelry & Watches",
      description: "Fine jewelry and timepieces"
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

    const tablets = await SubcategoryModel.create({
      name: "Tablets",
      description: "Tablet computers and e-readers",
      categoryId: electronics._id.toString()
    });

    const cameras = await SubcategoryModel.create({
      name: "Cameras",
      description: "Digital cameras and photography equipment",
      categoryId: electronics._id.toString()
    });

    const gaming = await SubcategoryModel.create({
      name: "Gaming",
      description: "Gaming consoles and accessories",
      categoryId: electronics._id.toString()
    });

    // Create subcategories for Clothing
    const menShirts = await SubcategoryModel.create({
      name: "Men's Shirts",
      description: "Dress shirts, casual shirts, and polo shirts",
      categoryId: clothing._id.toString()
    });

    const womenDresses = await SubcategoryModel.create({
      name: "Women's Dresses",
      description: "Casual, formal, and party dresses",
      categoryId: clothing._id.toString()
    });

    const menPants = await SubcategoryModel.create({
      name: "Men's Pants",
      description: "Jeans, chinos, and dress pants",
      categoryId: clothing._id.toString()
    });

    const womenTops = await SubcategoryModel.create({
      name: "Women's Tops",
      description: "Blouses, t-shirts, and sweaters",
      categoryId: clothing._id.toString()
    });

    const shoes = await SubcategoryModel.create({
      name: "Shoes",
      description: "Footwear for men and women",
      categoryId: clothing._id.toString()
    });

    const accessories = await SubcategoryModel.create({
      name: "Accessories",
      description: "Bags, belts, and fashion accessories",
      categoryId: clothing._id.toString()
    });

    // Create subcategories for Home & Garden
    const furniture = await SubcategoryModel.create({
      name: "Furniture",
      description: "Living room, bedroom, and office furniture",
      categoryId: homeGarden._id.toString()
    });

    const kitchenDining = await SubcategoryModel.create({
      name: "Kitchen & Dining",
      description: "Cookware, appliances, and dining sets",
      categoryId: homeGarden._id.toString()
    });

    const decor = await SubcategoryModel.create({
      name: "Home Decor",
      description: "Wall art, candles, and decorative items",
      categoryId: homeGarden._id.toString()
    });

    const garden = await SubcategoryModel.create({
      name: "Garden",
      description: "Plants, gardening tools, and outdoor furniture",
      categoryId: homeGarden._id.toString()
    });

    // Create subcategories for Sports & Fitness
    const fitnessEquipment = await SubcategoryModel.create({
      name: "Fitness Equipment",
      description: "Home gym equipment and exercise machines",
      categoryId: sports._id.toString()
    });

    const outdoorSports = await SubcategoryModel.create({
      name: "Outdoor Sports",
      description: "Camping, hiking, and outdoor adventure gear",
      categoryId: sports._id.toString()
    });

    const teamSports = await SubcategoryModel.create({
      name: "Team Sports",
      description: "Football, basketball, and team sport equipment",
      categoryId: sports._id.toString()
    });

    const sportswear = await SubcategoryModel.create({
      name: "Sportswear",
      description: "Athletic clothing and footwear",
      categoryId: sports._id.toString()
    });

    // Create subcategories for Beauty & Health
    const skincare = await SubcategoryModel.create({
      name: "Skincare",
      description: "Face care, moisturizers, and treatments",
      categoryId: beauty._id.toString()
    });

    const makeup = await SubcategoryModel.create({
      name: "Makeup",
      description: "Cosmetics and beauty tools",
      categoryId: beauty._id.toString()
    });

    const haircare = await SubcategoryModel.create({
      name: "Hair Care",
      description: "Shampoos, conditioners, and styling products",
      categoryId: beauty._id.toString()
    });

    const supplements = await SubcategoryModel.create({
      name: "Health Supplements",
      description: "Vitamins, minerals, and nutritional supplements",
      categoryId: beauty._id.toString()
    });

    // Create subcategories for Books & Media
    const fiction = await SubcategoryModel.create({
      name: "Fiction Books",
      description: "Novels, romance, and fantasy books",
      categoryId: books._id.toString()
    });

    const nonFiction = await SubcategoryModel.create({
      name: "Non-Fiction Books",
      description: "Biographies, self-help, and educational books",
      categoryId: books._id.toString()
    });

    const movies = await SubcategoryModel.create({
      name: "Movies & TV",
      description: "DVDs, Blu-rays, and streaming content",
      categoryId: books._id.toString()
    });

    const music = await SubcategoryModel.create({
      name: "Music",
      description: "CDs, vinyl records, and digital music",
      categoryId: books._id.toString()
    });

    // Create subcategories for Automotive
    const carAccessories = await SubcategoryModel.create({
      name: "Car Accessories",
      description: "Interior and exterior car accessories",
      categoryId: automotive._id.toString()
    });

    const carParts = await SubcategoryModel.create({
      name: "Car Parts",
      description: "Engine parts, brakes, and maintenance items",
      categoryId: automotive._id.toString()
    });

    const carElectronics = await SubcategoryModel.create({
      name: "Car Electronics",
      description: "GPS, dash cams, and audio systems",
      categoryId: automotive._id.toString()
    });

    // Create subcategories for Jewelry & Watches
    const necklaces = await SubcategoryModel.create({
      name: "Necklaces",
      description: "Gold, silver, and fashion necklaces",
      categoryId: jewelry._id.toString()
    });

    const watches = await SubcategoryModel.create({
      name: "Watches",
      description: "Luxury, sports, and fashion watches",
      categoryId: jewelry._id.toString()
    });

    const rings = await SubcategoryModel.create({
      name: "Rings",
      description: "Engagement, wedding, and fashion rings",
      categoryId: jewelry._id.toString()
    });

    const earrings = await SubcategoryModel.create({
      name: "Earrings",
      description: "Studs, hoops, and statement earrings",
      categoryId: jewelry._id.toString()
    });

    // Create comprehensive product catalog
    await ProductModel.create([
      // Electronics - Smartphones
      {
        name: "iPhone 15 Pro Max",
        description: "Latest flagship iPhone with titanium design and advanced camera system",
        price: "1199.99",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: smartphones._id.toString(),
        stock: 25,
        isFeatured: 1
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android phone with S Pen and incredible zoom capabilities",
        price: "1099.99",
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: smartphones._id.toString(),
        stock: 30,
        isFeatured: 1
      },
      {
        name: "Google Pixel 8 Pro",
        description: "AI-powered photography and pure Android experience",
        price: "899.99",
        imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: smartphones._id.toString(),
        stock: 40
      },

      // Electronics - Laptops
      {
        name: "MacBook Pro 16-inch M3",
        description: "Professional laptop with M3 chip for creative professionals",
        price: "2499.99",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: laptops._id.toString(),
        stock: 15,
        isFeatured: 1
      },
      {
        name: "Dell XPS 13 Plus",
        description: "Ultra-portable laptop with stunning InfinityEdge display",
        price: "1399.99",
        imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: laptops._id.toString(),
        stock: 22
      },
      {
        name: "ASUS ROG Zephyrus G14",
        description: "Gaming laptop with AMD Ryzen processor and RTX graphics",
        price: "1799.99",
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: laptops._id.toString(),
        stock: 18
      },

      // Electronics - Headphones
      {
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling wireless headphones",
        price: "399.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: headphones._id.toString(),
        stock: 45,
        isFeatured: 1
      },
      {
        name: "Apple AirPods Pro 2",
        description: "Premium wireless earbuds with adaptive transparency",
        price: "249.99",
        imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: headphones._id.toString(),
        stock: 60
      },
      {
        name: "Bose QuietComfort 45",
        description: "Comfortable over-ear headphones with excellent noise cancellation",
        price: "329.99",
        imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: headphones._id.toString(),
        stock: 35
      },

      // Electronics - Tablets
      {
        name: "iPad Pro 12.9-inch",
        description: "Most advanced iPad with M2 chip and Liquid Retina XDR display",
        price: "1099.99",
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: tablets._id.toString(),
        stock: 28
      },
      {
        name: "Samsung Galaxy Tab S9",
        description: "Premium Android tablet with S Pen included",
        price: "799.99",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: tablets._id.toString(),
        stock: 32
      },

      // Electronics - Cameras
      {
        name: "Canon EOS R6 Mark II",
        description: "Full-frame mirrorless camera for professional photography",
        price: "2499.99",
        imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: cameras._id.toString(),
        stock: 12
      },
      {
        name: "Sony Alpha A7 IV",
        description: "Versatile full-frame camera with 33MP resolution",
        price: "2198.99",
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: cameras._id.toString(),
        stock: 15
      },

      // Electronics - Gaming
      {
        name: "PlayStation 5",
        description: "Next-gen gaming console with lightning-fast SSD",
        price: "499.99",
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: gaming._id.toString(),
        stock: 8,
        isFeatured: 1
      },
      {
        name: "Xbox Series X",
        description: "Most powerful Xbox ever with 4K gaming capabilities",
        price: "499.99",
        imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: gaming._id.toString(),
        stock: 10
      },
      {
        name: "Nintendo Switch OLED",
        description: "Hybrid gaming console with vibrant OLED screen",
        price: "349.99",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics._id.toString(),
        subcategoryId: gaming._id.toString(),
        stock: 25
      },

      // Clothing - Men's Shirts
      {
        name: "Oxford Button-Down Shirt",
        description: "Classic cotton oxford shirt for business and casual wear",
        price: "59.99",
        imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        stock: 88
      },
      {
        name: "Casual Cotton T-Shirt",
        description: "Premium cotton tee in multiple colors and sizes",
        price: "24.99",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        stock: 150
      },
      {
        name: "Polo Shirt",
        description: "Classic polo shirt perfect for golf and casual occasions",
        price: "45.99",
        imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menShirts._id.toString(),
        stock: 75
      },

      // Clothing - Women's Dresses
      {
        name: "Elegant Evening Dress",
        description: "Sophisticated black dress perfect for formal events",
        price: "149.99",
        imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: womenDresses._id.toString(),
        stock: 42
      },
      {
        name: "Floral Summer Dress",
        description: "Light and breezy dress with beautiful floral pattern",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: womenDresses._id.toString(),
        stock: 65
      },
      {
        name: "Casual Midi Dress",
        description: "Versatile midi dress suitable for work and weekend",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1566479179817-01d5b50c6bce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: womenDresses._id.toString(),
        stock: 50
      },

      // Clothing - Men's Pants
      {
        name: "Classic Blue Jeans",
        description: "Premium denim jeans with perfect fit and comfort",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menPants._id.toString(),
        stock: 120
      },
      {
        name: "Chino Pants",
        description: "Versatile cotton chinos for casual and business casual wear",
        price: "69.99",
        imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: menPants._id.toString(),
        stock: 95
      },

      // Clothing - Women's Tops
      {
        name: "Silk Blouse",
        description: "Elegant silk blouse perfect for professional settings",
        price: "99.99",
        imageUrl: "https://images.unsplash.com/photo-1564257573-e4e80b8ad3d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: womenTops._id.toString(),
        stock: 60
      },
      {
        name: "Cotton Sweater",
        description: "Cozy cotton sweater for layering and comfort",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: womenTops._id.toString(),
        stock: 85
      },

      // Clothing - Shoes
      {
        name: "Running Sneakers",
        description: "High-performance running shoes with advanced cushioning",
        price: "129.99",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: shoes._id.toString(),
        stock: 90
      },
      {
        name: "Leather Dress Shoes",
        description: "Classic leather oxfords for formal occasions",
        price: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothing._id.toString(),
        subcategoryId: shoes._id.toString(),
        stock: 45
      },

      // Home & Garden - Furniture
      {
        name: "Modern Sofa Set",
        description: "Contemporary 3-piece sofa set with premium fabric",
        price: "1299.99",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: homeGarden._id.toString(),
        subcategoryId: furniture._id.toString(),
        stock: 8
      },
      {
        name: "Dining Table Set",
        description: "Solid wood dining table with 6 chairs",
        price: "899.99",
        imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: homeGarden._id.toString(),
        subcategoryId: furniture._id.toString(),
        stock: 12
      },

      // Home & Garden - Kitchen & Dining
      {
        name: "Stainless Steel Cookware Set",
        description: "Professional-grade 12-piece cookware collection",
        price: "349.99",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: homeGarden._id.toString(),
        subcategoryId: kitchenDining._id.toString(),
        stock: 35
      },
      {
        name: "Coffee Maker",
        description: "Programmable drip coffee maker with thermal carafe",
        price: "149.99",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: homeGarden._id.toString(),
        subcategoryId: kitchenDining._id.toString(),
        stock: 55
      },

      // Sports & Fitness - Fitness Equipment
      {
        name: "Adjustable Dumbbells",
        description: "Space-saving adjustable dumbbells up to 50lbs each",
        price: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: sports._id.toString(),
        subcategoryId: fitnessEquipment._id.toString(),
        stock: 25
      },
      {
        name: "Yoga Mat",
        description: "Non-slip premium yoga mat with carrying strap",
        price: "49.99",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: sports._id.toString(),
        subcategoryId: fitnessEquipment._id.toString(),
        stock: 80
      },

      // Beauty & Health - Skincare
      {
        name: "Anti-Aging Serum",
        description: "Advanced vitamin C serum for radiant skin",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: beauty._id.toString(),
        subcategoryId: skincare._id.toString(),
        stock: 120
      },
      {
        name: "Moisturizing Face Cream",
        description: "Hydrating daily moisturizer for all skin types",
        price: "45.99",
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: beauty._id.toString(),
        subcategoryId: skincare._id.toString(),
        stock: 95
      },

      // Books & Media - Fiction
      {
        name: "Best-Selling Novel",
        description: "Award-winning contemporary fiction novel",
        price: "16.99",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: books._id.toString(),
        subcategoryId: fiction._id.toString(),
        stock: 200
      },
      {
        name: "Fantasy Epic Series",
        description: "Complete 4-book fantasy adventure series",
        price: "59.99",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: books._id.toString(),
        subcategoryId: fiction._id.toString(),
        stock: 150
      },

      // Jewelry & Watches - Watches
      {
        name: "Luxury Swiss Watch",
        description: "Automatic mechanical watch with sapphire crystal",
        price: "2999.99",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: jewelry._id.toString(),
        subcategoryId: watches._id.toString(),
        stock: 5
      },
      {
        name: "Sports Watch",
        description: "Water-resistant sports watch with multiple functions",
        price: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: jewelry._id.toString(),
        subcategoryId: watches._id.toString(),
        stock: 40
      },

      // Jewelry & Watches - Necklaces
      {
        name: "Gold Chain Necklace",
        description: "18k gold plated chain necklace with elegant design",
        price: "159.99",
        imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: jewelry._id.toString(),
        subcategoryId: necklaces._id.toString(),
        stock: 65
      },
      {
        name: "Pearl Necklace",
        description: "Classic freshwater pearl necklace with silver clasp",
        price: "249.99",
        imageUrl: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: jewelry._id.toString(),
        subcategoryId: necklaces._id.toString(),
        stock: 30
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