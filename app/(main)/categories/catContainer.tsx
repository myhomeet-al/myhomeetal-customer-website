'use client';

import { FaCaretDown } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageWithFallback from '@/app/components/ImageWithFallback';

interface Product {
  _id: string;
  productTitle: string;
  price: string;
  images: string[];
  category: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
  products: Product[];
  product_category_image?: string;
}

// Skeleton Loader Component
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/item/${product._id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative w-full h-48 bg-gray-100">
          <ImageWithFallback
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.productTitle}
            width={192}
            height={192}
            className="w-full h-full object-cover"
            fallbackText="Image unavailable"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2 text-gray-800 hover:text-blue-600">
            {product.productTitle}
          </h3>
          <p className="text-lg font-bold text-gray-900 mt-1">
            ₦{product.price}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CatContainer() {
  const [currentCategory, setCurrentCategory] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/v1/product-category/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data: Category[] = await response.json();

        setCategories(data);
        if (data.length > 0) {
          setCurrentCategory(data[0]._id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const currentCategoryData = categories.find(
    (category) => category._id === currentCategory
  );

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="relative min-h-screen p-4 md:p-6 mt-20 lg:mt-0">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <p className='font-semibold text-lg'>Browse Categories:</p>
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {categories.find(c => c._id === currentCategory)?.name || 'Select'} <FaCaretDown size={14} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-12 left-0 bg-white text-black rounded-md shadow-lg p-2 w-64 z-10 max-h-80 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="p-3 hover:bg-blue-50 cursor-pointer rounded text-sm"
                  onClick={() => {
                    setCurrentCategory(category._id);
                    setDropdownOpen(false);
                  }}
                >
                  {category.name} ({category.products?.length || 0})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : currentCategoryData?.products?.length ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">{currentCategoryData.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentCategoryData.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this category</p>
        </div>
      )}
    </div>
  );
} 































// 'use client';

// import { FaCaretDown } from 'react-icons/fa6';
// import { categoriesData } from './categoriesData';
// import { useState } from 'react';

// export default function CatContainer() {
//   const [currentCategory, setCurrentCategory] = useState('Electronics');
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const baseURL = process.env.NEXT_PUBLIC_V1_BASE_API_URL as string;

//   const currentCategoryData = categoriesData.find(
//     (category) => category.title === currentCategory
//   );

//   return (
//     <div className="relative min-h-screen p-6 mt-20 lg:mt-0">
//       {/* Header Section */}
//       <div className="bg-black text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
//         <div className="flex items-center gap-4">
//           <p className='font-medium'>Categories:</p>
//           <button
//             className="text-sm flex items-center gap-1"
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//           >
//             {currentCategory} <FaCaretDown />
//           </button>
//           {dropdownOpen && (
//             <div className="absolute top-20 left-4 bg-white text-black rounded-md shadow-lg p-2 w-64 z-10">
//               {categoriesData.map((category) => (
//                 <div
//                   key={category.title}
//                   className="p-2 hover:bg-gray-100 cursor-pointer"
//                   onClick={() => {
//                     setCurrentCategory(category.title);
//                     setDropdownOpen(false);
//                   }}
//                 >
//                   {category.title}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <span className="text-lg font-bold">{currentCategory}</span>
//       </div>

//       {/* Content Section */}
//       <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
//         {currentCategoryData?.sections.map((section, index) => (
//           <div key={index} className="space-y-3 border-r border-gray-300 pr-4">
//             <p className="font-semibold text-sm relative">
//               {section.header}
//               <div className="w-full h-px bg-gray-300 mt-1"></div>
//             </p>
//             <ul className="space-y-1 text-gray-700">
//               {section.items.map((item, idx) => (
//                 <li key={idx}>{item}</li>
//               ))}
//             </ul>
//             {section.subcategories && (
//               <div className="mt-3 space-y-2">
//                 {Object.keys(section.subcategories).map((subHeader, idx) => (
//                   <div key={idx}>
//                     <p className="font-semibold text-sm">
//                       {subHeader}
//                       <div className="w-full h-0.5 bg-gray-300 mt-1"></div>
//                     </p>
//                     <ul className="space-y-1 text-gray-500">
//                       {section.subcategories[subHeader].map((subItem, id) => (
//                         <li key={id}>{subItem}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


