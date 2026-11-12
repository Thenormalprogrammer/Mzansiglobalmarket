import ProductCard from '../ProductCard';
import productImage from '@assets/generated_images/product_example_headphones.png';

export default function ProductCardExample() {
  return (
    <div className="max-w-xs">
      <ProductCard
        id="1"
        name="Wireless Bluetooth Headphones with Noise Cancellation"
        image={productImage}
        priceRange="$15.00 - $25.00"
        moq="100 pieces"
        supplierName="TechAudio Manufacturing Co."
        isVerified={true}
        isHot={true}
      />
    </div>
  );
}
