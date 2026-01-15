import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from("Orders").select("*");
      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="orders-page">
      <h2>Orders</h2>
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderItem({ order }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!order.screenshot_url) return;
      const { data, error } = await supabase.storage
        .from("Payments") // your bucket name
        .createSignedUrl(order.screenshot_url, 60); // valid for 60 seconds
      if (error) {
        console.error("Error generating signed URL:", error);
      } else {
        setImageUrl(data.signedUrl);
      }
    };
    getSignedUrl();
  }, [order.screenshot_url]);

  return (
    <div className="order-item">
      <p><strong>User:</strong> {order.telegram_username}</p>
      <p><strong>Status:</strong> {order.status}</p>
      {imageUrl ? (
        <img src={imageUrl} alt="Payment Screenshot" className="screenshot" />
      ) : (
        <p>No screenshot uploaded</p>
      )}
    </div>
  );
}