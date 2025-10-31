"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import StatsCards from "./components/StateCards";
import RecentOrders from "./components/RecentOrders";
import QuickActions from "./components/QuickActions";
import Recommended from "./components/Recommended";
import SupportSection from "./components/SupportSection";
import OrdersGraph from "./components/OrdersGraph";

export default function DashboardClient() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchData = async () => {
      try {
        const [ordersRes, cartRes, userRes, recRes] = await Promise.all([
          fetch(
            `https://smart-shop-server-three.vercel.app/orders?orderedBy=${user.email}`
          ),
          fetch(
            `https://smart-shop-server-three.vercel.app/cartItems?email=${user.email}`
          ),
          fetch(
            `https://smart-shop-server-three.vercel.app/users?email=${user.email}`
          ),
          fetch(
            `https://smart-shop-server-three.vercel.app/products?category=electronics`
          ),
        ]);

        const orders = await ordersRes.json();
        const cartItems = await cartRes.json();
        const userData = await userRes.json();
        const recommended = await recRes.json();

        const gems =
          Array.isArray(userData) && userData.length > 0
            ? userData[0]?.gemPoints || 0
            : userData?.gemPoints || 0;

        const totalOrders = orders.length;
        const totalSpent = orders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0
        );

        // ✅ Get last 3 recent orders
        const lastOrders = orders
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 3)
          .map((order) => ({
            id: order._id,
            name: order.name || "Product",
            status: order.status || "Processing",
            date: new Date(order.orderDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            amount: `$${order.totalAmount}`,
            items: order.items || [],
          }));

        // ✅ Limit recommended products to 5
        const top5Products = recommended.slice(0, 5);

        setUserStats({
          totalOrders,
          gemsPoint: gems,
          cartItems: cartItems.length,
          totalSpent,
        });

        setRecentOrders(lastOrders);
        setRecommendedProducts(top5Products);
        setAllOrders(orders);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-8">
      {/* 🟦 Stats Section */}
      <StatsCards userStats={userStats} />

      {/* 🟩 Orders + Graph (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="w-full">
          <RecentOrders recentOrders={recentOrders} />
        </div>
        <div className="w-full">
          <OrdersGraph orders={allOrders} />
        </div>
      </div>

      {/* 🟨 Quick Actions */}
      <QuickActions userStats={userStats} notifications={[]} />

      {/* 🟧 Recommended Products (5 items only) */}
      <div className="w-full">
        <Recommended recommendedProducts={recommendedProducts.slice(0, 5)} />
      </div>

      {/* 🟪 Support Section */}
      <SupportSection />
    </div>
  );
}
