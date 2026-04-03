import React from 'react';
import { cookies } from 'next/headers';
import Category from '@/app/components/category/CategoryGrid';
import { CategoryType } from '@/types';
import AdBanner2 from '@components/banner/AdBanner2';
import AdBanner3 from '@components/banner/AdBanner3';
import { shuffleArray } from '../utils/helpers';
import { serverFetch } from '@/app/utils/serverFetch';

// Fetch top categories from the API
const fetchTopCategories = async (token: string | undefined): Promise<CategoryType[]> => {
  try {
    const res = await serverFetch(
      `/api/v1/product-category/top-categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching categories.');
  }
};

// Fetch products for each category
const fetchProductsForCategory = async (category: CategoryType, token: string | undefined): Promise<any> => {
  try {
    const res = await serverFetch(
      `/api/v1/product/category/${category?._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res?.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching products for category ${category?._id}:`, error);
    return []; // Return empty array in case of error
  }
};

const HomeCategoryProductList = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('AUTH_TOKEN')?.value;
  let topCategories: CategoryType[] = [];

  try {
    // Fetch top categories
    topCategories = await fetchTopCategories(token);

    // Fetch products for each category
    topCategories = await Promise.all(
      topCategories.map(async (category) => {
        const products = await fetchProductsForCategory(category, token);
        return { ...category, products };
      })
    );

    // Shuffle categories
    shuffleArray(topCategories);

  } catch (error) {
    // Error handling, returning message as fallback
    return (
      <div className="hidden items-center px-[3%] pb-5 md:flex">
        <p className="text-red-500">Failed to load categories. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      {topCategories.slice(0, 8).map((category, index) => {
        const products = category?.products;
        // Check if the products array exists and is not empty
        if (!products || products.length === 0) {
          console.warn(`No products found for category ID: ${category?._id}`);
          return null;
        }

        return (
          <React.Fragment key={category?._id}>
            <Category
              title={category?.name}
              id={category?._id}
              products={products}
            />
            {index === 0 && <AdBanner2 />}
            {index === 1 && <AdBanner3 />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default HomeCategoryProductList;