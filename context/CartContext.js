"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from server
  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(
        `https://smart-shop-server-three.vercel.app/cartItems?email=${user.email}`
      )
      .then((res) => setCartItems(res.data))
      .catch((err) => console.log(err));
  }, [user?.email]);

  const addToCart = async (product) => {
    const cartItem = {
      userEmail: user?.email,
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
        setCartItems((prev) => [...prev, cartItem]); // Update local state
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      const res = await axios.delete(
        `https://smart-shop-server-three.vercel.app/cartItems/${id}`
      );
      if (res.data?.deletedCount) {
        setCartItems((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
