import { useState } from "react";
import { supabase } from "./supabase";

export default function UploadTest() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setStatus("❌ No file selected");
      return;
    }

    // 🔍 Inspect session + JWT payload
    const session = await supabase.auth.getSession();
    console.log("Session object:", session);

    if (session.data.session) {
      const token = session.data.session.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload);
    } else {
      console.log("No session → role is anon");
    }

    // 📂 Upload path
    const path = `screenshot/test-${Date.now()}-${file.name}`;
    console.log("Uploading to:", path);

    // 🚀 Attempt upload
    const { data, error } = await supabase.storage
      .from("payment")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      setStatus(`❌ Upload failed: ${error.message}`);
    } else {
      console.log("Upload succeeded:", data);
      setStatus(`✅ Upload succeeded: ${data.path}`);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Upload Test</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
      {status && (
        <p style={{ marginTop: "1rem", color: status.startsWith("✅") ? "green" : "red" }}>
          {status}
        </p>
      )}
    </div>
  );
}