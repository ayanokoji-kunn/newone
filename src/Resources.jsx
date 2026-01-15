import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import "./resources.css";

function Resources() {
  const location = useLocation();
  const navigate = useNavigate();

  const [universityName, setUniversityName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [subjectsByYear, setSubjectsByYear] = useState({});
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const universityId = queryParams.get("university");
  const departmentId = queryParams.get("department");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      console.log("departmentId from URL:", departmentId);

      const { data: uniData, error: uniError } = await supabase
        .from("University")
        .select("name")
        .eq("id", universityId)
        .single();

      const { data: deptData, error: deptError } = await supabase
        .from("department")
        .select("name")
        .eq("id", departmentId)
        .single();

      const { data: subData, error: subError } = await supabase
        .from("subcourses")
        .select("id, name, year, quiz_count")
        .eq("department_id", departmentId);

      console.log("Fetched subcourses:", subData);

      const grouped = {};
      subData?.forEach((sub) => {
        if (!grouped[sub.year]) grouped[sub.year] = [];
        grouped[sub.year].push(sub);
      });

      setUniversityName(uniData?.name || "Unknown University");
      setDepartmentName(deptData?.name || "Unknown Department");
      setSubjectsByYear(grouped);
      setLoading(false);
    };

    if (universityId && departmentId) {
      fetchData();
    }
  }, [universityId, departmentId]);

  return (
    <div className="resources-page">
      <h2>📚 Study Resources</h2>
      {loading ? (
        <p>Loading resources...</p>
      ) : (
        <>
          <p><strong>University:</strong> {universityName}</p>
          <p><strong>Department:</strong> {departmentName}</p>
          <hr />

          {Object.keys(subjectsByYear).length === 0 ? (
            <p>No subjects found for this department.</p>
          ) : (
            Object.keys(subjectsByYear).sort().map((year) => (
              <div key={year}>
                <h3>Year {year}</h3>
                <div className="subcourse-grid">
                  {subjectsByYear[year].map((sub) => (
                    <div
                      key={sub.id}
                      className="subcourse-card"
                      onClick={() => navigate(`/quiz/${sub.id}`)}
                    >
                      <h4>{sub.name}</h4>
                      <p>{sub.quiz_count} quizzes available</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default Resources;