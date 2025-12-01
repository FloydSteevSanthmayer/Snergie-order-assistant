import ultraCleanseImage from '@/assets/ultracleanse.jpg';
import uberZincImage from '@/assets/uberzinc.jpg';
import hydroGelImage from '@/assets/hydrogel.jpg';
import vitaminBSerumImage from '@/assets/vitamin-b-serum.jpg';
import reclaimMoisturiserImage from '@/assets/reclaim-moisturiser.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  benefits: string[];
}

export const products: Product[] = [
  {
    id: 'UC001',
    name: 'UltraCleanse',
    description: 'Deep cleansing foam that removes impurities while maintaining skin barrier integrity. Suitable for all skin types.',
    price: 45.00,
    image: ultraCleanseImage,
    category: 'Cleanser',
    benefits: ['Deep cleansing', 'Maintains skin barrier', 'Removes impurities', 'All skin types']
  },
  {
    id: 'UZ002',
    name: 'ÜberZinc',
    description: 'Advanced zinc supplement supporting skin health and repair. Clinically formulated for optimal absorption.',
    price: 32.00,
    image: uberZincImage,
    category: 'Supplement',
    benefits: ['Skin repair', 'Anti-inflammatory', 'Optimal absorption', 'Clinically tested']
  },
  {
    id: 'HG003',
    name: 'HydroGel',
    description: 'Intensive hydrating gel with hyaluronic acid. Provides 24-hour moisture protection for healthy, plump skin.',
    price: 58.00,
    image: hydroGelImage,
    category: 'Moisturizer',
    benefits: ['24-hour hydration', 'Hyaluronic acid', 'Plumps skin', 'Long-lasting moisture']
  },
  {
    id: 'VB004',
    name: 'Vitamin B Serum',
    description: 'Concentrated vitamin B complex serum that brightens and evens skin tone. Perfect for daily use.',
    price: 42.00,
    image: vitaminBSerumImage,
    category: 'Serum',
    benefits: ['Brightens skin', 'Evens tone', 'Vitamin B complex', 'Daily use']
  },
  {
    id: 'RM005',
    name: 'ReClaim Moisturiser',
    description: 'Restorative moisturizer with peptides and ceramides. Repairs and protects for visibly healthier skin.',
    price: 52.00,
    image: reclaimMoisturiserImage,
    category: 'Moisturizer',
    benefits: ['Peptides & ceramides', 'Restorative', 'Skin protection', 'Visible results']
  }
];