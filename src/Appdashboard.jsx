import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function Appdashboard() {
  const [orders, setOrders] = useState([]);

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("Orders")
        .select("id, full_name, telegram_username, status, screenshot_url");

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
    };

    fetchOrders();
  }, []);

  // Approve or reject
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("Orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      alert("Status updated to " + newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            <p><strong>Name:</strong> {order.full_name}</p>
            <p><strong>Telegram:</strong> {order.telegram_username}</p>
            <p><strong>Status:</strong> {order.status}</p>
            {order.screenshot_url ? (
              <p>
                <strong>Screenshot:</strong>{" "}
                <a
                  href={order.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Screenshot
                </a>
              </p>
            ) : (
              <p><strong>Screenshot:</strong> Not uploaded</p>
            )}
            <button
              onClick={() => updateStatus(order.id, "approved")}
              style={{
                marginRight: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "5px 10px",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => updateStatus(order.id, "rejected")}
              style={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "5px 10px",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Appdashboard;