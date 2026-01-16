import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 👈 added useNavigate
import { supabase } from "./supabase";
import "./quiz.css";

function Quiz() {
  const { id: subcourseId } = useParams();
  const navigate = useNavigate(); // 👈 for back button
  const [quizzes, setQuizzes] = useState([]);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const cleanId = subcourseId?.trim();
      console.log("Subcourse ID:", cleanId, "length:", cleanId?.length);

      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("subcourse_id", cleanId);

      console.log("Fetched quizzes:", data, error);

      if (error) {
        console.error("Error fetching quizzes:", error);
      } else {
        setQuizzes(data);
      }
      setLoading(false);
    };

    if (subcourseId) fetchQuizzes();
  }, [subcourseId]);

  const handleSelect = (qid, opt, correctOpt) => {
    if (selected[qid]) return;
    setSelected((prev) => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = () => {
    let newScore = 0;
    quizzes.forEach((q) => {
      if (selected[q.id] === q.correct_option) {
        newScore++;
      }
    });
    setScore(newScore);
    setFinished(true);
  };

  return (
    <div className="quiz-page">
      {/* 👆 Back button in top-right corner */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ⬅ Back
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : quizzes.length === 0 ? (
        <p>No quizzes found for this subject.</p>
      ) : (
        <>
          {quizzes.map((q, index) => (
            <div key={q.id} className="quiz-question">
              <h4>Question {index + 1}: {q.question}</h4>
              {["A", "B", "C", "D"].map((opt) => {
                const isSelected = selected[q.id] === opt;
                const isCorrect = opt === q.correct_option;
                const wasSelected = selected[q.id] != null;
                const className =
                  !wasSelected ? "option"
                  : isSelected && isCorrect ? "option correct"
                  : isSelected && !isCorrect ? "option wrong"
                  : "option";

                return (
                  <button
                    key={opt}
                    className={className}
                    onClick={() => handleSelect(q.id, opt, q.correct_option)}
                    disabled={wasSelected}
                  >
                    <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                  </button>
                );
              })}
              {selected[q.id] && selected[q.id] !== q.correct_option && (
                <p className="explanation">{q.explanation}</p>
              )}
            </div>
          ))}

          {/* 👇 Submit button at bottom */}
          {!finished && (
            <button
              onClick={handleSubmit}
              style={{
                marginTop: "20px",
                padding: "10px 15px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Submit Quiz
            </button>
          )}

          {finished && (
            <div className="score-box">
              <h3>Your Score: {score} / {quizzes.length}</h3>
              <p>{((score / quizzes.length) * 100).toFixed(0)}% correct</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Quiz;