"use client";
import React, { useEffect, useState } from "react";
import { GrCart } from "react-icons/gr";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState(""); // New state for sorting
  const productsPerPage = 12;

  const { user } = useAuth();
  const { addToCart: addToLocalCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filtered.slice(indexOfFirst, indexOfLast);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    axios
      .get("https://smart-shop-server-three.vercel.app/products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
        setLoading(false);

        // Extract categories dynamically
        const uniqueCategories = Array.from(
          new Set(res.data.map((p) => p.category))
        );
        setCategories(["All", ...uniqueCategories]);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        toast.error("Failed to load products");
      });
  }, []);

  // Search
  const handleSearch = async (e) => {
    const name = e.target.value;
    try {
      const res = await axios.get(
        `https://smart-shop-server-three.vercel.app/products?name=${name}`
      );
      setProducts(res.data);
      setFiltered(res.data);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  // Add to cart
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add to cart");
      router.push("/login");
      return;
    }

    const cartItem = {
      userEmail: user.email,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      sellerEmail: product.sellerEmail,
      sellerName: product.sellerName,
    };

    try {
      const res = await axios.post(
        "https://smart-shop-server-three.vercel.app/addToCart",
        cartItem
      );
      if (res.data?.insertedId) {
        toast.success("Added to cart");
        addToLocalCart(product);
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  // Category filter
  const handleCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    let filteredItems =
      cat === "All"
        ? [...products]
        : products.filter(
            (p) => p.category.toLowerCase() === cat.toLowerCase()
          );

    // Apply sorting if any
    if (sortOption) {
      filteredItems = sortProducts(filteredItems, sortOption);
    }

    setFiltered(filteredItems);
  };

  // Sorting
  const sortProducts = (items, option) => {
    let sorted = [...items];
    if (option === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (option === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  };

  const handleSort = (option) => {
    setSortOption(option);
    const sortedFiltered = sortProducts(filtered, option);
    setFiltered(sortedFiltered);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-base-100">
      <div className="container mx-auto p-4">
        {/* Section Title + Search + Sort */}
        <div className="text-center mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <h2 className="text-3xl font-bold">
            {selectedCategory === "All"
              ? "All Products"
              : `Products of ${selectedCategory}`}
          </h2>

          <input
            type="text"
            placeholder="Search products..."
            className="w-full sm:w-1/2 md:w-1/3 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
            onChange={handleSearch}
          />

          <select
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-4 py-2 rounded-full transition cursor-pointer font-medium text-sm
              ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <div
              key={product._id}
              className="border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
            >
              <Link href={`/products/${product._id}`}>
                <div className="w-full h-48 flex items-center justify-center bg-gray-50">
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </Link>

              <div className="p-4 flex flex-col flex-grow">
                <Link href={`/products/${product._id}`}>
                  <h3 className="inline-block relative text-gray-500 font-medium text-sm mb-1 hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                </Link>

                <div className="text-blue-600 font-bold text-sm mb-2">
                  ${product.price}{" "}
                  <span className="text-gray-500 line-through text-xs">
                    {product.origPrice}
                  </span>
                </div>

                <div className="flex justify-between mt-auto">
                  <button onClick={() => handleAddToCart(product)}>
                    <GrCart className="w-6 h-6 text-blue-600 hover:cursor-pointer" />
                  </button>
                  <Link
                    href={`/checkout?type=single&id=${product._id}`}
                    className="text-md py-1 px-3 bg-secondary text-white rounded"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded disabled:opacity-50 bg-secondary text-white cursor-pointer"
          >
            Prev
          </button>
          {[...Array(Math.ceil(filtered.length / productsPerPage))].map(
            (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded cursor-pointer ${
                  currentPage === i + 1
                    ? "border text-primary"
                    : "bg-secondary text-white"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(filtered.length / productsPerPage)
            }
            className="px-3 py-1 rounded disabled:opacity-50 bg-secondary text-white"
          >
            Next
          </button>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}
