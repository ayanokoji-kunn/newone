import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import "./App.css";
import Resources from "./Resources";
import Quiz from "./Quiz";
import UploadTest from "./uploadtest"; // 👈 make sure filename matches exactly
import Login from "./Login"; // 👈 import login page

function RegistrationForm() {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [universityId, setUniversityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Load universities and departments
  useEffect(() => {
    const fetchData = async () => {
      const { data: uniData, error: uniError } = await supabase
        .from("University")
        .select("*");
      const { data: deptData, error: deptError } = await supabase
        .from("department")
        .select("*");

      if (uniError) console.error("University fetch error:", uniError);
      if (deptError) console.error("Department fetch error:", deptError);

      setUniversities(uniData || []);
      setDepartments(deptData || []);
    };
    fetchData();
  }, []);

  // Poll Supabase every 5s for approval
  useEffect(() => {
    if (!username) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("Orders")
        .select("status, university_id, department_id")
        .eq("telegram_username", username)
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data && data.length > 0) {
        const order = data[0];
        if (order.status === "approved") {
          clearInterval(interval);
          navigate(
            `/resources?university=${order.university_id}&department=${order.department_id}`
          );
        } else if (order.status === "pending") {
          setStatusMessage("⏳ Waiting for admin approval...");
        } else if (order.status === "rejected") {
          clearInterval(interval);
          setStatusMessage("❌ Registration rejected. Please contact support.");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [username, navigate]);

  const handleSubmit = async () => {
    // ✅ remember user locally for future auto-login
    if (username) {
      localStorage.setItem("username", username);
    }

    const { error } = await supabase.from("Orders").insert({
      university_id: universityId,
      department_id: departmentId,
      full_name: fullName,
      telegram_username: username,
      screenshot_url: screenshot ? screenshot.name : null,
      status: "pending"
      // ❌ removed login/session requirement
    });

    if (error) {
      console.error("Insert error:", error);
      alert("Error: " + error.message);
    } else {
      alert("Submitted successfully! Please wait for admin approval.");
    }
  };

  const selectedUniversity = universities.find((u) => u.id === universityId);
  const selectedDepartment = departments.find((d) => d.id === departmentId);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h2>Student Registration</h2>

      <label>University:</label>
      <select
        onChange={(e) => setUniversityId(e.target.value)}
        value={universityId}
      >
        <option value="">Select University</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <label>Department:</label>
      <select
        onChange={(e) => setDepartmentId(e.target.value)}
        value={departmentId}
      >
        <option value="">Select Department</option>
        {departments
          .filter((d) => d.university_id === universityId)
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.price_birr} birr
            </option>
          ))}
      </select>

      <label>Full Name:</label>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <label>Telegram Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label>Payment Screenshot:</label>
      <input type="file" onChange={(e) => setScreenshot(e.target.files[0])} />

      <button type="button" onClick={handleSubmit}>
        Submit
      </button>

      {selectedUniversity && <p>Selected University: {selectedUniversity.name}</p>}
      {selectedDepartment && (
        <p>
          Selected Department: {selectedDepartment.name} — {selectedDepartment.price_birr} birr
        </p>
      )}
      {statusMessage && <p>{statusMessage}</p>}

      <div
        style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}
      >
        <h3>Payment Instructions</h3>
        <p>
          Please transfer the required amount to the following account at the
          Commercial Bank of Ethiopia:
        </p>
        <p>
          <strong>Account Name:</strong> Israel Hailegebreal Worku
        </p>
        <p>
          <strong>Account Number:</strong> 1000622322963{" "}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText("1000622322963");
              alert("Account number copied to clipboard!");
            }}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Copy
          </button>
        </p>
        <p>
          <strong>Bank:</strong> Commercial Bank of Ethiopia
        </p>
        <p>
          After completing the payment, upload the screenshot of your receipt
          above before submitting the form.
        </p>
      </div>
    </form>
  );
}

function App() {
  const navigate = useNavigate();

  // ✅ Auto-login on app load: if a saved username has an approved order, skip login/registration
  useEffect(() => {
    const checkAutoLogin = async () => {
      const savedUsername = localStorage.getItem("username");
      if (!savedUsername) return;

      const { data, error } = await supabase
        .from("Orders")
        .select("status, university_id, department_id")
        .eq("telegram_username", savedUsername)
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Auto-login check error:", error);
        return;
      }

      if (data && data.length > 0 && data[0].status === "approved") {
        navigate(
          `/resources?university=${data[0].university_id}&department=${data[0].department_id}`
        );
      }
    };

    checkAutoLogin();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/quiz/:id" element={<Quiz />} />
      <Route path="/uploadtest" element={<UploadTest />} /> {/* 👈 debug route */}
    </Routes>
  );
}

export default App;