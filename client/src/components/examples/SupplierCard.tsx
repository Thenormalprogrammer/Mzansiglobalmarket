import SupplierCard from '../SupplierCard';
import electronicsImage from '@assets/generated_images/electronics_category_image.png';

export default function SupplierCardExample() {
  return (
    <div className="max-w-3xl">
      <SupplierCard
        id="1"
        companyName="TechElectronics Manufacturing Ltd."
        logo={electronicsImage}
        location="Shenzhen, China"
        yearsInBusiness={12}
        categories={["Electronics", "Components", "Consumer Devices"]}
        rating={4.8}
        responseRate="98%"
        isVerified={true}
        isGoldSupplier={true}
      />
    </div>
  );
}
