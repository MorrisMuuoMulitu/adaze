// Comprehensive category list for ADAZE Kenya Mitumba Marketplace

export const PRODUCT_CATEGORIES = [
  // Clothing - Men
  { value: "Men's Clothing", label: "Men's Clothing", group: "Clothing" },
  { value: "Men's Shirts", label: "Men's Shirts", group: "Clothing" },
  { value: "Men's Trousers", label: "Men's Trousers", group: "Clothing" },
  { value: "Men's Jeans", label: "Men's Jeans", group: "Clothing" },
  { value: "Men's Jackets", label: "Men's Jackets", group: "Clothing" },
  { value: "Men's Suits", label: "Men's Suits", group: "Clothing" },
  { value: "Men's Sportswear", label: "Men's Sportswear", group: "Clothing" },
  
  // Clothing - Women
  { value: "Women's Clothing", label: "Women's Clothing", group: "Clothing" },
  { value: "Women's Dresses", label: "Women's Dresses", group: "Clothing" },
  { value: "Women's Tops", label: "Women's Tops", group: "Clothing" },
  { value: "Women's Trousers", label: "Women's Trousers", group: "Clothing" },
  { value: "Women's Jeans", label: "Women's Jeans", group: "Clothing" },
  { value: "Women's Skirts", label: "Women's Skirts", group: "Clothing" },
  { value: "Women's Jackets", label: "Women's Jackets", group: "Clothing" },
  { value: "Women's Sportswear", label: "Women's Sportswear", group: "Clothing" },
  
  // Clothing - Kids
  { value: "Kids' Clothing", label: "Kids' Clothing", group: "Clothing" },
  { value: "Boys' Clothing", label: "Boys' Clothing", group: "Clothing" },
  { value: "Girls' Clothing", label: "Girls' Clothing", group: "Clothing" },
  { value: "Baby Clothing", label: "Baby Clothing", group: "Clothing" },
  
  // Footwear
  { value: "Footwear", label: "Footwear", group: "Footwear" },
  { value: "Men's Shoes", label: "Men's Shoes", group: "Footwear" },
  { value: "Women's Shoes", label: "Women's Shoes", group: "Footwear" },
  { value: "Kids' Shoes", label: "Kids' Shoes", group: "Footwear" },
  { value: "Sports Shoes", label: "Sports Shoes", group: "Footwear" },
  { value: "Sandals & Slippers", label: "Sandals & Slippers", group: "Footwear" },
  { value: "Boots", label: "Boots", group: "Footwear" },
  
  // Bags & Accessories
  { value: "Bags", label: "Bags", group: "Accessories" },
  { value: "Handbags", label: "Handbags", group: "Accessories" },
  { value: "Backpacks", label: "Backpacks", group: "Accessories" },
  { value: "Travel Bags", label: "Travel Bags", group: "Accessories" },
  { value: "Wallets & Purses", label: "Wallets & Purses", group: "Accessories" },
  
  // Accessories
  { value: "Accessories", label: "Accessories", group: "Accessories" },
  { value: "Belts", label: "Belts", group: "Accessories" },
  { value: "Hats & Caps", label: "Hats & Caps", group: "Accessories" },
  { value: "Scarves", label: "Scarves", group: "Accessories" },
  { value: "Jewelry", label: "Jewelry", group: "Accessories" },
  { value: "Watches", label: "Watches", group: "Accessories" },
  { value: "Sunglasses", label: "Sunglasses", group: "Accessories" },
  
  // Electronics
  { value: "Electronics", label: "Electronics", group: "Electronics" },
  { value: "Mobile Phones", label: "Mobile Phones", group: "Electronics" },
  { value: "Laptops & Computers", label: "Laptops & Computers", group: "Electronics" },
  { value: "Tablets", label: "Tablets", group: "Electronics" },
  { value: "Headphones", label: "Headphones", group: "Electronics" },
  { value: "Phone Accessories", label: "Phone Accessories", group: "Electronics" },
  
  // Home & Living
  { value: "Home & Kitchen", label: "Home & Kitchen", group: "Home" },
  { value: "Bedding", label: "Bedding", group: "Home" },
  { value: "Curtains", label: "Curtains", group: "Home" },
  { value: "Kitchen Items", label: "Kitchen Items", group: "Home" },
  { value: "Home Decor", label: "Home Decor", group: "Home" },
  
  // Sports & Outdoors
  { value: "Sports & Fitness", label: "Sports & Fitness", group: "Sports" },
  { value: "Gym Equipment", label: "Gym Equipment", group: "Sports" },
  { value: "Outdoor Gear", label: "Outdoor Gear", group: "Sports" },
  
  // Books & Media
  { value: "Books", label: "Books", group: "Books & Media" },
  { value: "Magazines", label: "Magazines", group: "Books & Media" },
  { value: "Music & Movies", label: "Music & Movies", group: "Books & Media" },
  
  // Toys & Games
  { value: "Toys", label: "Toys", group: "Kids" },
  { value: "Games", label: "Games", group: "Kids" },
  { value: "Baby Products", label: "Baby Products", group: "Kids" },
  
  // Vehicles & Parts (for the "Cars" category in your DB)
  { value: "Cars", label: "Cars", group: "Vehicles" },
  { value: "Car Parts", label: "Car Parts", group: "Vehicles" },
  { value: "Motorcycles", label: "Motorcycles", group: "Vehicles" },
  { value: "Bicycles", label: "Bicycles", group: "Vehicles" },
  
  // Beauty & Personal Care
  { value: "Beauty Products", label: "Beauty Products", group: "Beauty" },
  { value: "Cosmetics", label: "Cosmetics", group: "Beauty" },
  { value: "Hair Products", label: "Hair Products", group: "Beauty" },
  { value: "Perfumes", label: "Perfumes", group: "Beauty" },
  
  // Other/Miscellaneous (for "Baddie" and other unique items)
  { value: "Other", label: "Other", group: "Other" },
  { value: "Vintage Items", label: "Vintage Items", group: "Other" },
  { value: "Collectibles", label: "Collectibles", group: "Other" },
];

// Simple list for backwards compatibility
export const CATEGORY_VALUES = PRODUCT_CATEGORIES.map(cat => cat.value);

// Grouped categories for better UX
export const CATEGORIES_BY_GROUP = PRODUCT_CATEGORIES.reduce((acc, cat) => {
  if (!acc[cat.group]) {
    acc[cat.group] = [];
  }
  acc[cat.group].push(cat);
  return acc;
}, {} as Record<string, typeof PRODUCT_CATEGORIES>);

// Get all unique groups
export const CATEGORY_GROUPS = Array.from(new Set(PRODUCT_CATEGORIES.map(cat => cat.group)));
