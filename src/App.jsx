import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [universityId, setUniversityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: uniData, error: uniError } = await supabase
        .from("University")
        .select("*");
      const { data: deptData, error: deptError } = await supabase
        .from("department")
        .select("*");

      console.log("Universities:", uniData, "Error:", uniError);
      console.log("Departments:", deptData, "Error:", deptError);

      setUniversities(uniData || []);
      setDepartments(deptData || []);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const { error } = await supabase.from("Orders").insert({
      university_id: universityId,
      department_id: departmentId,
      full_name: fullName,
      telegram_username: username,
      screenshot_url: screenshot ? screenshot.name : null,
      status: "pending",
    });

    if (error) alert("Error: " + error.message);
    else alert("Submitted successfully!");
  };

  const selectedUniversity = universities.find((u) => u.id === universityId);
  const selectedDepartment = departments.find((d) => d.id === departmentId);

  return (
    <form>
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
      {selectedDepartment && <p>Selected Department: {selectedDepartment.name}</p>}

     {/* 🔒 Payment Instructions Section */}
<div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
  <h3>Payment Instructions</h3>
  <p>
    Please transfer the required amount to the following account at the
    Commercial Bank of Ethiopia:
  </p>
  <p><strong>Account Name:</strong> Israel Hailegebreal Worku</p>
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
        borderRadius: "4px"
      }}
    >
      Copy
    </button>
  </p>
  <p><strong>Bank:</strong> Commercial Bank of Ethiopia</p>
  <p>
    After completing the payment, upload the screenshot of your receipt
    above before submitting the form.
  </p>
</div>
    </form>
  );
}

export default App;