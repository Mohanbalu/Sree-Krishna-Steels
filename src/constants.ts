export interface Product {
  id: string;
  name: string;
  category: 'Beds' | 'Sofas' | 'Dining Tables' | 'Dressing Tables';
  description: string;
  fullDescription: string;
  price: string;
  images: string[];
  material: string;
  size: string;
  benefits: string[];
  isBestSeller?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'royal-teak-bed',
    name: 'Royal Teak King Size Bed',
    category: 'Beds',
    description: 'Handcrafted premium teak wood bed with intricate carvings.',
    fullDescription: 'The Royal Teak King Size Bed is a masterpiece of craftsmanship. Made from 100% genuine teak wood, it offers unparalleled durability and a timeless aesthetic that elevates any bedroom.',
    price: 'Starting from ₹45,000',
    images: [
      'https://s.alicdn.com/@sc04/kf/Aa3017c80300d40c4be2584db5928aeb7U/Luxury-Royal-European-Midcentury-Modern-Solid-Teak-Wood-King-Size-Bed-2-Hand-Carved-Eco-Friendly-Upholstered-Nightstands-Soft.png',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Premium Teak Wood & High-Grade Steel Reinforcement',
    size: 'King Size (72" x 78")',
    benefits: ['Termite Resistant', 'Lifetime Durability', 'Customizable Polish'],
    isBestSeller: true
  },
  {
    id: 'modern-velvet-sofa',
    name: 'Luxurious 3-Seater Velvet Sofa',
    category: 'Sofas',
    description: 'Modern minimalist design with premium velvet upholstery.',
    fullDescription: 'Experience ultimate comfort with our Modern Velvet Sofa. Featuring high-density foam and a robust steel frame, this sofa combines contemporary style with long-lasting support.',
    price: 'Starting from ₹32,000',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Steel Frame, Premium Velvet, High-Density Foam',
    size: '84" L x 36" D x 34" H',
    benefits: ['Ergonomic Design', 'Easy to Clean', 'Sturdy Steel Base'],
    isBestSeller: true
  },
  {
    id: 'marble-dining-table',
    name: '6-Seater Marble Top Dining Set',
    category: 'Dining Tables',
    description: 'Elegant dining table with Italian marble top and steel legs.',
    fullDescription: 'Make every meal special with our Marble Top Dining Set. The combination of natural marble and gold-finished steel legs creates a sophisticated look for your dining area.',
    price: 'Starting from ₹58,000',
    images: [
      'https://www.getmycouch.com/cdn/shop/files/ScreenShot2023-11-01at20.21.41.png?v=1698850398',
      'https://images.unsplash.com/photo-1577145900570-7705823c42d6?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Italian Marble, PVD Coated Steel',
    size: '72" x 36" (Table)',
    benefits: ['Heat Resistant', 'Scratch Resistant', 'Luxury Finish']
  },
  {
    id: 'classic-dressing-table',
    name: 'Classic Steel & Wood Dressing Table',
    category: 'Dressing Tables',
    description: 'Functional design with ample storage and full-length mirror.',
    fullDescription: 'Our Classic Dressing Table is designed for the modern home. It features a sleek steel frame integrated with premium wood panels, providing both style and utility.',
    price: 'Starting from ₹18,000',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Powder Coated Steel, Engineered Wood',
    size: '36" W x 18" D x 72" H',
    benefits: ['Space Saving', 'Rust Proof', 'Modern Aesthetics']
  },
  {
    id: 'l-shaped-sofa',
    name: 'Modern L-Shaped Sectional Sofa',
    category: 'Sofas',
    description: 'Spacious sectional sofa with premium fabric and steel frame.',
    fullDescription: 'Our L-Shaped Sectional Sofa is perfect for large families and social gatherings. Built on a heavy-duty steel frame with premium high-density foam, it offers both luxury and longevity.',
    price: 'Starting from ₹48,000',
    images: [
      'https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Reinforced Steel Frame, Premium Fabric, High-Density Foam',
    size: '108" L x 72" D x 34" H',
    benefits: ['Spacious Seating', 'Modular Design', 'Heavy-Duty Frame']
  },
  {
    id: 'queen-storage-bed',
    name: 'Modern Queen Size Storage Bed',
    category: 'Beds',
    description: 'Sleek design with hydraulic lift storage and steel frame.',
    fullDescription: 'Maximize your bedroom space with our Modern Queen Size Storage Bed. Featuring a robust steel structure and a smooth hydraulic lift mechanism, this bed combines style with practical storage solutions.',
    price: 'Starting from ₹38,000',
    images: [
      'https://www.midhafurniture.com/upload/products/Queen_Storage_Bed.jpg',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'High-Grade Steel, Engineered Wood, Hydraulic System',
    size: 'Queen Size (60" x 78")',
    benefits: ['Ample Storage', 'Easy Lift Mechanism', 'Space Efficient'],
    isBestSeller: true
  },
  {
    id: 'compact-dining-set',
    name: '4-Seater Compact Dining Set',
    category: 'Dining Tables',
    description: 'Space-saving dining set with wooden top and steel base.',
    fullDescription: 'Perfect for modern apartments, our 4-Seater Compact Dining Set offers a minimalist aesthetic without compromising on quality. The sturdy steel base ensures stability for years to come.',
    price: 'Starting from ₹24,000',
    images: [
      'https://www.vikinterio.com/product-images/VSQF_A_0.jpg/473239000004619004/1100x1100',
      'https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Solid Wood Top, Powder Coated Steel',
    size: '48" x 30" (Table)',
    benefits: ['Space Saving', 'Minimalist Design', 'Durable Build']
  },
  {
    id: 'led-vanity',
    name: 'Modern Vanity with LED Mirror',
    category: 'Dressing Tables',
    description: 'Sleek dressing table with touch-sensitive LED mirror.',
    fullDescription: 'Elevate your grooming routine with our Modern Vanity. Featuring a touch-sensitive LED mirror and a sleek steel-wood hybrid design, it brings a touch of Hollywood to your bedroom.',
    price: 'Starting from ₹22,000',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800'
    ],
    material: 'Steel Frame, LED Mirror, Premium Finish',
    size: '42" W x 18" D x 60" H',
    benefits: ['Adjustable Lighting', 'Modern Aesthetics', 'Premium Finish']
  }
];

export const REFERENCES = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Home Owner',
    content: 'The quality of the teak bed I purchased from Sree Krishna Steels & Furniture is exceptional. The craftsmanship is truly royal.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 2,
    name: 'Anjali Sharma',
    role: 'Interior Designer',
    content: 'As a designer, I always look for durability and style. Sree Krishna Steels & Furniture delivers both consistently. Their steel frames are top-notch.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 3,
    name: 'Vikram Singh',
    role: 'Bulk Buyer',
    content: 'We ordered furniture for our entire guest house. The bulk enquiry process was smooth and the delivery was on time. Highly recommended.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 4,
    name: 'Priya Reddy',
    role: 'Home Owner',
    content: 'The dining set we bought is the highlight of our home. It is elegant, sturdy, and easy to maintain. Great value for money.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 5,
    name: 'Suresh Babu',
    role: 'Architect',
    content: 'I have recommended Sree Krishna Steels & Furniture to many of my clients. Their attention to detail and ability to customize is impressive.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 6,
    name: 'Meena Kumari',
    role: 'Boutique Owner',
    content: 'The dressing table is perfect for my boutique. It is stylish and the LED mirror is a great touch. My customers love it!',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200'
  }
];
