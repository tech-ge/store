export interface CategoryNode {
  slug: string
  name: string
  children?: { slug: string; name: string }[]
}

export const CATEGORY_TREE: CategoryNode[] = [
  { slug: 'vehicles', name: 'Vehicles', children: [
    { slug: 'cars', name: 'Cars' },
    { slug: 'buses', name: 'Buses & Minibuses' },
    { slug: 'trucks', name: 'Trucks & Trailers' },
    { slug: 'motorcycles', name: 'Motorcycles & Scooters' },
    { slug: 'bicycles', name: 'Bicycles' },
    { slug: 'vehicle-parts', name: 'Vehicle Parts & Accessories' }
  ]},
  { slug: 'electronics', name: 'Electronics', children: [
    { slug: 'phones', name: 'Phones & Tablets' },
    { slug: 'computers', name: 'Computers & Laptops' },
    { slug: 'tv-audio', name: 'TV, Video & Audio' },
    { slug: 'cameras', name: 'Cameras & Drones' },
    { slug: 'gaming', name: 'Video Games & Consoles' },
    { slug: 'accessories', name: 'Electronics Accessories' }
  ]},
  { slug: 'home-garden', name: 'Home & Garden', children: [
    { slug: 'furniture', name: 'Furniture' },
    { slug: 'kitchen', name: 'Kitchen & Dining' },
    { slug: 'appliances', name: 'Home Appliances' },
    { slug: 'decor', name: 'Home Decor' },
    { slug: 'garden', name: 'Garden & Outdoor' },
    { slug: 'tools', name: 'Tools & DIY' }
  ]},
  { slug: 'fashion', name: 'Fashion', children: [
    { slug: 'mens-clothing', name: 'Men Clothing' },
    { slug: 'womens-clothing', name: 'Women Clothing' },
    { slug: 'shoes', name: 'Shoes' },
    { slug: 'bags', name: 'Bags & Luggage' },
    { slug: 'jewellery', name: 'Jewellery & Watches' },
    { slug: 'accessories-fashion', name: 'Fashion Accessories' }
  ]},
  { slug: 'food', name: 'Food & Beverages', children: [
    { slug: 'groceries', name: 'Groceries' },
    { slug: 'beverages', name: 'Beverages' },
    { slug: 'snacks', name: 'Snacks & Confectionery' },
    { slug: 'restaurant', name: 'Restaurant & Takeaway' },
    { slug: 'farm-produce', name: 'Farm Produce' },
    { slug: 'meat-fish', name: 'Meat & Fish' }
  ]},
  { slug: 'health-beauty', name: 'Health & Beauty', children: [
    { slug: 'skincare', name: 'Skincare' },
    { slug: 'makeup', name: 'Makeup' },
    { slug: 'haircare', name: 'Hair Care' },
    { slug: 'fragrance', name: 'Fragrance' },
    { slug: 'health', name: 'Health & Wellness' },
    { slug: 'medical', name: 'Medical Supplies' }
  ]},
  { slug: 'baby-kids', name: 'Baby & Kids', children: [
    { slug: 'baby-gear', name: 'Baby Gear' },
    { slug: 'toys', name: 'Toys & Games' },
    { slug: 'kids-clothing', name: 'Kids Clothing' },
    { slug: 'school', name: 'School Supplies' },
    { slug: 'baby-food', name: 'Baby Food' }
  ]},
  { slug: 'sports-outdoors', name: 'Sports & Outdoors', children: [
    { slug: 'fitness', name: 'Fitness & Gym' },
    { slug: 'outdoor', name: 'Outdoor & Camping' },
    { slug: 'sports-equipment', name: 'Sports Equipment' },
    { slug: 'cycling', name: 'Cycling' },
    { slug: 'water-sports', name: 'Water Sports' }
  ]},
  { slug: 'books-media', name: 'Books & Media', children: [
    { slug: 'books', name: 'Books' },
    { slug: 'music', name: 'Music & Instruments' },
    { slug: 'stationery', name: 'Stationery' },
    { slug: 'movies', name: 'Movies & TV' }
  ]},
  { slug: 'business-industrial', name: 'Business & Industrial', children: [
    { slug: 'office', name: 'Office Supplies' },
    { slug: 'industrial', name: 'Industrial Equipment' },
    { slug: 'agriculture', name: 'Agriculture & Farming' },
    { slug: 'construction', name: 'Construction' },
    { slug: 'wholesale', name: 'Wholesale & Bulk' }
  ]},
  { slug: 'property', name: 'Property', children: [
    { slug: 'for-sale', name: 'For Sale' },
    { slug: 'for-rent', name: 'For Rent' },
    { slug: 'land', name: 'Land & Plots' }
  ]},
  { slug: 'services', name: 'Services', children: [
    { slug: 'repairs', name: 'Repairs & Maintenance' },
    { slug: 'cleaning', name: 'Cleaning Services' },
    { slug: 'transport', name: 'Transport & Logistics' },
    { slug: 'professional', name: 'Professional Services' },
    { slug: 'events', name: 'Events & Catering' }
  ]},
  { slug: 'pets', name: 'Pet Supplies', children: [
    { slug: 'pet-food', name: 'Pet Food' },
    { slug: 'pet-accessories', name: 'Pet Accessories' },
    { slug: 'live-animals', name: 'Live Animals' }
  ]},
  { slug: 'arts-crafts', name: 'Arts & Crafts', children: [
    { slug: 'art-supplies', name: 'Art Supplies' },
    { slug: 'handmade', name: 'Handmade Items' },
    { slug: 'collectibles', name: 'Collectibles' }
  ]},
  { slug: 'other', name: 'Other', children: [
    { slug: 'misc', name: 'Miscellaneous' }
  ]}
]

export function flatCategories() {
  const out: { slug: string; name: string; parent?: string }[] = []
  for (const c of CATEGORY_TREE) {
    out.push({ slug: c.slug, name: c.name })
    for (const ch of c.children || []) out.push({ slug: ch.slug, name: ch.name, parent: c.slug })
  }
  return out
}
