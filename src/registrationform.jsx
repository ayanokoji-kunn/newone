import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [universityId, setUniversityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [session, setSession] = useState(null);

  // Recover session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Fetch universities and departments
  useEffect(() => {
    const fetchData = async () => {
      const { data: uniData } = await supabase.from("University").select("*");
      const { data: deptData } = await supabase.from("department").select("*");
      setUniversities(uniData || []);
      setDepartments(deptData || []);
    };
    fetchData();
  }, []);

  // Check approval status for user
  useEffect(() => {
    const checkApproval = async () => {
      if (!username) return;
      const { data } = await supabase
        .from("Orders")
        .select("status, university_id, department_id, screenshot_url")
        .eq("telegram_username", username)
        .order("id", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const order = data[0];
        if (order.status === "approved") {
          navigate(
            `/resources?university=${order.university_id}&department=${order.department_id}`
          );
        } else if (order.status === "pending") {
          setStatusMessage("⏳ Waiting for admin approval...");
          if (order.screenshot_url) {
            const { data: signed, error } = await supabase.storage
              .from("payment")
              .createSignedUrl(order.screenshot_url, 60);
            if (error) console.error("Signed URL error:", error);
            if (signed?.signedUrl) setPreviewUrl(signed.signedUrl);
          }
        } else if (order.status === "rejected") {
          setStatusMessage("❌ Registration rejected. Please contact support.");
        }
      }
    };
    checkApproval();
  }, [username, navigate]);

  // Handle form submit with screenshot upload
  const handleSubmit = async () => {
    if (!screenshot) {
      alert("Please upload your payment screenshot.");
      return;
    }

    setSubmitting(true);

    try {
      const ext = screenshot.name.split(".").pop();
      const filename = `${username}-${Date.now()}.${ext}`;
      const storagePath = `screenshot/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("payment")
        .upload(storagePath, screenshot, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Insert order row — always allow submission
      const { error: insertError } = await supabase.from("Orders").insert({
        university_id: parseInt(universityId),
        department_id: parseInt(departmentId),
        full_name: fullName,
        telegram_username: username,
        screenshot_url: storagePath,
        status: "pending",
        auth_user_id: session?.user?.id || null, // attach if available, else null
      });

      if (insertError) throw insertError;

      const { data: signed } = await supabase.storage
        .from("payment")
        .createSignedUrl(storagePath, 60);
      if (signed?.signedUrl) setPreviewUrl(signed.signedUrl);

      alert("Submitted successfully! Please wait for admin approval.");
    } catch (err) {
      alert("Error: " + err.message);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label>Full Name:</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <label>Telegram Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label>University:</label>
        <select
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
        >
          <option value="">Select University</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Department:</label>
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments
            .filter((d) => d.university_id === parseInt(universityId))
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.price_birr} birr
              </option>
            ))}
        </select>
      </div>

      <div>
        <label>Payment Screenshot:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshot(e.target.files[0])}
        />
      </div>

      <button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>

      {statusMessage && <p>{statusMessage}</p>}

      {previewUrl && (
        <div>
          <p>Uploaded Screenshot Preview:</p>
          <img src={previewUrl} alt="Payment screenshot" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </form>
  );
}