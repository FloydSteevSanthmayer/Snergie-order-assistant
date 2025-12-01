import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';

const Index = () => {
  return (
    <main>
      <Hero />
      <div id="products">
        <ProductGrid />
      </div>
    </main>
  );
};

export default Index;
