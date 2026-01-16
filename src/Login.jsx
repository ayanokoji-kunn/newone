import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);

  // Recover session on load + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        redirectBasedOnApproval(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          redirectBasedOnApproval(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 🔍 Helper: redirect based on approval status
  const redirectBasedOnApproval = async (user) => {
    const { data: orders, error } = await supabase
      .from("Orders")
      .select("status, university_id, department_id")
      .eq("auth_user_id", user.id)
      .order("id", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      navigate("/register");
      return;
    }

    if (orders && orders.length > 0 && orders[0].status === "approved") {
      navigate(
        `/resources?university=${orders[0].university_id}&department=${orders[0].department_id}`
      );
    } else {
      navigate("/register");
    }
  };

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: null }
    });
    if (error) {
      alert("Signup failed: " + error.message);
    } else {
      navigate("/register");
    }
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Login failed: " + error.message);
    } else {
      const user = data.user;
      await redirectBasedOnApproval(user);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login / Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleLogin} style={{ marginRight: "10px" }}>
          Login
        </button>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}