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
  }
];
