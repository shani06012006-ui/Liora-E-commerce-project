//frontend/src/ProductCardSkeleton.jsx

const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-xl aspect-[3/4] w-full" />
    <div className="mt-2 md:mt-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);
 
export const ProductGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
 
export default ProductCardSkeleton;