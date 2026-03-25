import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import "./quiz.css";

function Quiz() {
  const { id: subcourseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitWarning, setSubmitWarning] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    setSelected({});
    setScore(0);
    setFinished(false);
    setSubmitWarning(false);

    const cleanId = subcourseId?.trim();
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("subcourse_id", cleanId);

    if (error) {
      console.error("Error fetching quizzes:", error);
    } else {
      setQuizzes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (subcourseId) fetchQuizzes();
  }, [subcourseId]);

  const handleSelect = (qid, opt) => {
    if (selected[qid]) return;
    setSelected((prev) => ({ ...prev, [qid]: opt }));
    setSubmitWarning(false);
  };

  const handleSubmit = () => {
    const unanswered = quizzes.filter((q) => !selected[q.id]);
    if (unanswered.length > 0) {
      setSubmitWarning(true);
      // Scroll to first unanswered question
      const firstUnanswered = document.getElementById(`question-${unanswered[0].id}`);
      if (firstUnanswered) firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let newScore = 0;
    quizzes.forEach((q) => {
      if (selected[q.id] === q.correct_option) newScore++;
    });
    setScore(newScore);
    setFinished(true);
    setSubmitWarning(false);
  };

  const answeredCount = Object.keys(selected).length;
  const totalCount = quizzes.length;

  return (
    <div className="quiz-page">
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-back"
        >
          ⬅ Back
        </button>

        {/* Progress indicator */}
        {!loading && totalCount > 0 && (
          <span style={{ fontSize: "14px", color: "#555" }}>
            {answeredCount} / {totalCount} answered
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!loading && totalCount > 0 && (
        <div style={{ background: "#e0e0e0", borderRadius: "8px", height: "8px", marginBottom: "24px" }}>
          <div
            style={{
              background: finished ? "#4CAF50" : "#2196F3",
              width: `${(answeredCount / totalCount) * 100}%`,
              height: "100%",
              borderRadius: "8px",
              transition: "width 0.3s ease"
            }}
          />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : quizzes.length === 0 ? (
        <p>No quizzes found for this subject.</p>
      ) : (
        <>
          {quizzes.map((q, index) => {
            const userAnswer = selected[q.id];
            const wasAnswered = userAnswer != null;

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="quiz-question"
                style={{
                  border: submitWarning && !wasAnswered ? "2px solid #f44336" : "2px solid transparent",
                  borderRadius: "8px",
                  padding: "12px",
                  transition: "border 0.2s"
                }}
              >
                <h4>Question {index + 1} of {totalCount}: {q.question}</h4>

                {["A", "B", "C", "D"].map((opt) => {
                  const isSelected = userAnswer === opt;
                  const isCorrect = opt === q.correct_option;

                  let className = "option";
                  let indicator = "";

                  if (wasAnswered) {
                    if (isCorrect) {
                      className = "option correct";
                      indicator = " ✅";
                    } else if (isSelected && !isCorrect) {
                      className = "option wrong";
                      indicator = " ❌";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      className={className}
                      onClick={() => handleSelect(q.id, opt)}
                      disabled={wasAnswered}
                    >
                      <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}{indicator}
                    </button>
                  );
                })}

                {/* Show explanation + correct answer label when wrong */}
                {wasAnswered && userAnswer !== q.correct_option && (
                  <div className="explanation">
                    <strong>✅ Correct answer: {q.correct_option}</strong>
                    {q.explanation && <p style={{ margin: "4px 0 0" }}>{q.explanation}</p>}
                  </div>
                )}

                {/* Praise when correct */}
                {wasAnswered && userAnswer === q.correct_option && (
                  <p style={{ color: "#4CAF50", marginTop: "8px", fontSize: "14px" }}>Great job! That's correct.</p>
                )}
              </div>
            );
          })}

          {/* Submit warning */}
          {submitWarning && (
            <p style={{ color: "#f44336", fontWeight: "bold", marginTop: "12px" }}>
              ⚠️ Please answer all questions before submitting. Unanswered questions are highlighted in red.
            </p>
          )}

          {/* Submit button */}
          {!finished && (
            <button onClick={handleSubmit} className="btn-submit">
              Submit Quiz ({answeredCount}/{totalCount} answered)
            </button>
          )}

          {/* Score box */}
          {finished && (
            <div className="score-box">
              <h3>Your Score: {score} / {totalCount}</h3>
              <p>{((score / totalCount) * 100).toFixed(0)}% correct</p>
              <button onClick={fetchQuizzes} className="btn-retry">
                🔄 Retry Quiz
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Quiz;
