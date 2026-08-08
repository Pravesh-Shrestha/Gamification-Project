import React from "react";

// academia.io - Lesson player (content slides → quiz → results)

function LessonPlayer({ lessonId, profile, onComplete, onExit, opts }) {
  const lesson = window.findLesson(lessonId);
  const [phase, setPhase] = React.useState("content"); // content | quiz | result
  const [slideIdx, setSlideIdx] = React.useState(0);
  const [qIdx, setQIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState([]); // {correct, given}
  const [committed, setCommitted] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  const [comboMax, setComboMax] = React.useState(0);
  const [comboFlash, setComboFlash] = React.useState(null);

  if (!lesson) return <div className="card">Lesson not found.</div>;

  const total = lesson.quiz.length;
  const correct = answers.filter((a) => a.correct).length;

  function commitResult(finalAnswers, finalComboMax) {
    if (committed) return;
    setCommitted(true);
    const c = finalAnswers.filter((a) => a.correct).length;
    onComplete(lesson.id, c, total, finalComboMax);
  }

  if (phase === "content") {
    const slide = lesson.slides[slideIdx];
    const last = slideIdx === lesson.slides.length - 1;
    return (
      <LessonShell lesson={lesson} onExit={onExit} step={slideIdx + 1} steps={lesson.slides.length + total} phase="Read">
        <SlideView slide={slide} color={lesson.color} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button className="btn ghost" onClick={() => (slideIdx > 0 ? setSlideIdx(slideIdx - 1) : onExit())}>
            {slideIdx > 0 ? "← Back" : "Exit"}
          </button>
          {last ? (
            <button className="btn" style={{ background: lesson.color, color: window.readableTextOn(lesson.color) }} onClick={() => setPhase("quiz")}>
              Start quiz →
            </button>
          ) : (
            <button className="btn" style={{ background: lesson.color, color: window.readableTextOn(lesson.color) }} onClick={() => setSlideIdx(slideIdx + 1)}>
              Next →
            </button>
          )}
        </div>
      </LessonShell>
    );
  }

  if (phase === "quiz") {
    const q = lesson.quiz[qIdx];
    return (
      <LessonShell
        lesson={lesson}
        onExit={onExit}
        step={lesson.slides.length + qIdx + 1}
        steps={lesson.slides.length + total}
        phase={`Question ${qIdx + 1} of ${total}`}
        combo={combo}
        comboFlash={comboFlash}
      >
        <QuestionView
          key={qIdx}
          q={q}
          color={lesson.color}
          onAnswer={(correctAnswer, given, usedHint) => {
            const next = [...answers, { correct: correctAnswer, given, usedHint, q }];
            setAnswers(next);
            if (correctAnswer) {
              window.FX && window.FX.Sound.correct();
            } else {
              window.FX && window.FX.Sound.wrong();
            }
            let newCombo = combo;
            let newComboMax = comboMax;
            if (correctAnswer && !usedHint) {
              newCombo = combo + 1;
              setCombo(newCombo);
              if (newCombo > comboMax) {
                newComboMax = newCombo;
                setComboMax(newCombo);
              }
              if (newCombo >= 2) {
                setComboFlash(newCombo);
                window.FX && window.FX.Sound.combo(newCombo);
                setTimeout(() => setComboFlash(null), 1100);
              }
            } else {
              newCombo = 0;
              setCombo(0);
            }
            const isLast = qIdx === total - 1;
            setTimeout(() => {
              if (isLast) {
                commitResult(next, newComboMax);
                setPhase("result");
              } else {
                setQIdx(qIdx + 1);
              }
            }, 900);
          }}
        />
      </LessonShell>
    );
  }

  // result
  const perfect = correct === total;
  const xpEarned = (() => {
    const mult = opts?.xpMultiplier || 1;
    return Math.round(((correct * window.Engine.XP_PER_CORRECT) + window.Engine.XP_PER_LESSON + (perfect ? window.Engine.XP_PERFECT_BONUS : 0)) * mult);
  })();

  return (
    <LessonShell lesson={lesson} onExit={onExit} step={lesson.slides.length + total} steps={lesson.slides.length + total} phase="Result">
      <div style={{ textAlign: "center", padding: "30px 10px" }}>
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 14 }}>
          {perfect ? "🏆" : correct >= total / 2 ? "🎉" : "💪"}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>
          {perfect ? "Perfect!" : correct >= total / 2 ? "Nicely done!" : "Keep going!"}
        </h1>
        <p className="soft" style={{ maxWidth: 380, margin: "0 auto 26px" }}>
          You answered <b>{correct} out of {total}</b> correctly on <b>{lesson.title}</b>.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 460, margin: "0 auto 30px" }}>
          <div className="card card-tight" style={{ textAlign: "center" }}>
            <div className="eyebrow">Score</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26 }}>{correct}/{total}</div>
          </div>
          <div className="card card-tight" style={{ textAlign: "center" }}>
            <div className="eyebrow">XP earned</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: lesson.color }}>+{xpEarned}</div>
          </div>
          <div className="card card-tight" style={{ textAlign: "center" }}>
            <div className="eyebrow">Streak</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#F59E0B" }}>{profile.streak} 🔥</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="btn ghost" onClick={onExit}>Back to home</button>
          {(() => {
            const next = window.Engine.recommendNext({ ...profile, lessonsCompleted: [...(profile.lessonsCompleted || []), lesson.id] });
            if (next) {
              return (
                <button
                  className="btn"
                  style={{ background: next.color, color: window.readableTextOn(next.color) }}
                  onClick={() => {
                    setPhase("content");
                    setSlideIdx(0);
                    setQIdx(0);
                    setAnswers([]);
                    setCommitted(false);
                    onComplete && onComplete.__advanceTo && onComplete.__advanceTo(next.id);
                    // simpler: dispatch event
                    window.dispatchEvent(new CustomEvent("aio:open-lesson", { detail: next.id }));
                  }}
                >
                  Next lesson: {next.title} →
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </LessonShell>
  );
}

function LessonShell({ lesson, onExit, step, steps, phase, children, combo = 0, comboFlash = null }: any) {
  const pct = (step / steps) * 100;
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
      {comboFlash && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 250,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 80,
            color: comboFlash >= 5 ? "#A855F7" : comboFlash >= 4 ? "#EF4444" : comboFlash >= 3 ? "#F59E0B" : "#3B82F6",
            textShadow: "0 8px 24px rgba(0,0,0,0.2)",
            animation: "comboPop 1.1s cubic-bezier(.2,1.6,.6,1) both",
            pointerEvents: "none",
            letterSpacing: "-0.04em",
          }}
        >
          {comboFlash}× COMBO!
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <button className="btn ghost" onClick={onExit} style={{ padding: "8px 14px", fontSize: 13 }}>
          ← Exit
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, fontWeight: 800, color: "var(--ink-soft)" }}>
            <span>{lesson.subjectName} · {lesson.chapterTitle}</span>
            <span>{phase}</span>
          </div>
          <div style={{ height: 8, background: "var(--line)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: lesson.color, transition: "width 0.4s" }} />
          </div>
        </div>
        {combo >= 2 && (
          <div style={{ padding: "8px 14px", background: "linear-gradient(135deg, #F59E0B, #EF4444)", color: "white", borderRadius: 99, fontWeight: 800, fontSize: 13, animation: "comboPulse 0.6s infinite alternate" }}>
            🔥 {combo}× combo
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 32, minHeight: 380 }}>{children}</div>
      <style>{`
        @keyframes comboPop {
          0% { transform: translateX(-50%) scale(0.4); opacity: 0; }
          30% { transform: translateX(-50%) scale(1.15); opacity: 1; }
          70% { transform: translateX(-50%) scale(1); opacity: 1; }
          100% { transform: translateX(-50%) scale(1.4); opacity: 0; }
        }
        @keyframes comboPulse {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}

function SlideView({ slide, color }) {
  if (slide.kind === "flashcard") {
    return <FlashcardSlide slide={slide} color={color} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
            background: `${color}1A`,
            padding: "4px 10px",
            borderRadius: 99,
          }}
        >
          {slide.kind === "intro" ? "Learn" : slide.kind === "example" ? "Example" : "Tip"}
        </span>
      </div>
      <p style={{ fontSize: 22, lineHeight: 1.45, fontWeight: 600, margin: 0, color: "var(--ink)" }}>
        {slide.body}
      </p>
      {slide.visual === "pizza" && <PizzaVisual color={color} />}
      {slide.visual === "blocks" && <BlocksVisual color={color} />}
    </div>
  );
}

function FlashcardSlide({ slide, color }) {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0" }}>
      <div className="eyebrow" style={{ color }}>Flashcard Study</div>
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "100%",
          maxWidth: 400,
          height: 220,
          background: flipped ? `linear-gradient(135deg, ${color}15, ${color}25)` : "var(--bg-card)",
          border: `2.5px dashed ${color}`,
          borderRadius: 16,
          display: "grid",
          placeItems: "center",
          padding: 24,
          cursor: "pointer",
          boxShadow: "var(--shadow)",
          transform: flipped ? "rotateY(180deg)" : "none",
          transition: "transform 0.4s, background 0.3s",
        }}
      >
        <div style={{
          transform: flipped ? "rotateY(-180deg)" : "none",
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 22,
          color: "var(--ink)"
        }}>
          {flipped ? slide.back : slide.front}
        </div>
      </div>
      <div className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
        💡 Click the card to flip!
      </div>
    </div>
  );
}

function PizzaVisual({ color }) {
  const slices = 4;
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill={`${color}22`} stroke={color} strokeWidth="3" />
        {Array.from({ length: slices }).map((_, i) => {
          const a = (i * 2 * Math.PI) / slices;
          const x2 = 100 + 90 * Math.cos(a);
          const y2 = 100 + 90 * Math.sin(a);
          return <line key={i} x1="100" y1="100" x2={x2} y2={y2} stroke={color} strokeWidth="3" />;
        })}
        {/* Highlight 1 slice */}
        <path
          d={`M 100 100 L 190 100 A 90 90 0 0 1 100 190 Z`}
          fill={color}
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

function BlocksVisual({ color }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "10px 0" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0].map((i) => (
          <div key={i} style={{ width: 30, height: 60, background: color, borderRadius: 6 }} />
        ))}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--ink-mute)", alignSelf: "center" }}>+</div>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ width: 30, height: 60, background: color, borderRadius: 6 }} />
        ))}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--ink-mute)", alignSelf: "center" }}>=</div>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 30, height: 60, background: color, borderRadius: 6 }} />
        ))}
      </div>
    </div>
  );
}

function QuestionView({ q, onAnswer, color }) {
  const [picked, setPicked] = React.useState(null);
  const [text, setText] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [hintUsed, setHintUsed] = React.useState(false);
  const [hintShown, setHintShown] = React.useState(false);

  function reveal(correct, given) {
    if (revealed) return;
    setRevealed(true);
    onAnswer(correct, given, hintUsed);
  }

  // Hint text: for MCQ eliminate two wrong answers; for TF give nudge; for fill show hint or first char
  function showHint() {
    if (hintUsed) return;
    setHintUsed(true);
    setHintShown(true);
  }

  // For MCQ, hint = remove 2 wrong choices
  let eliminated = [];
  if (q.kind === "mcq" && hintShown) {
    const wrongs = q.choices.map((_, i) => i).filter((i) => i !== q.answer);
    // shuffle then take 2
    eliminated = wrongs.sort(() => Math.random() - 0.5).slice(0, Math.max(0, q.choices.length - 2));
  }

  const HintButton = (
    <button
      onClick={showHint}
      disabled={hintUsed || revealed}
      style={{
        padding: "6px 12px",
        borderRadius: 99,
        background: hintUsed ? "var(--bg-soft)" : "rgba(245,158,11,0.16)",
        color: hintUsed ? "var(--ink-mute)" : "#FBBF24",
        border: hintUsed ? "1px solid transparent" : "1px solid rgba(245,158,11,0.4)",
        fontWeight: 800,
        fontSize: 12,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: hintUsed || revealed ? "default" : "pointer",
      }}
    >
      💡 {hintUsed ? "Hint used" : "Use hint"} {!hintUsed && <span style={{ opacity: 0.7, fontSize: 10 }}>(half XP for this Q)</span>}
    </button>
  );

  if (q.kind === "mcq") {
    return (
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 22px", lineHeight: 1.4 }}>{q.q}</p>
        <div style={{ display: "grid", gap: 10 }}>
          {q.choices.map((c, i) => {
            const isPicked = picked === i;
            const isCorrect = i === q.answer;
            let style: React.CSSProperties = {
              padding: "14px 18px",
              border: "2px solid var(--line-strong)",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              background: "var(--bg-card)",
              color: "var(--ink)",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.15s",
              cursor: revealed ? "default" : "pointer",
            };
            if (revealed) {
              if (isCorrect) {
                style.background = "rgba(16,185,129,0.14)";
                style.borderColor = "#34D399";
                style.color = "#6EE7B7";
              } else if (isPicked) {
                style.background = "rgba(239,68,68,0.14)";
                style.borderColor = "#F87171";
                style.color = "#FCA5A5";
              } else {
                style.opacity = 0.5;
              }
            } else if (isPicked) {
              style.borderColor = color;
              style.background = `${color}11`;
            }
            return (
              <button
                key={i}
                style={style}
                onClick={() => {
                  if (revealed) return;
                  setPicked(i);
                  setTimeout(() => reveal(i === q.answer, c), 200);
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, opacity: 0.6 }}>{String.fromCharCode(65 + i)}</span>
                <span>{c}</span>
                {revealed && isCorrect && <span style={{ marginLeft: "auto" }}>✓</span>}
                {revealed && isPicked && !isCorrect && <span style={{ marginLeft: "auto" }}>✗</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (q.kind === "tf") {
    return (
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 22px", lineHeight: 1.4 }}>{q.q}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[true, false].map((v) => {
            const isPicked = picked === v;
            const isCorrect = v === q.answer;
            let style: React.CSSProperties = {
              padding: "26px 18px",
              borderRadius: 16,
              fontSize: 20,
              fontWeight: 800,
              border: "2px solid var(--line-strong)",
              background: "var(--bg-card)",
              transition: "all 0.15s",
            };
            if (revealed) {
              if (isCorrect) { style.background = "rgba(16,185,129,0.14)"; style.borderColor = "#34D399"; style.color = "#6EE7B7"; }
              else if (isPicked) { style.background = "rgba(239,68,68,0.14)"; style.borderColor = "#F87171"; style.color = "#FCA5A5"; }
              else style.opacity = 0.5;
            } else if (isPicked) { style.borderColor = color; style.background = `${color}11`; }
            return (
              <button
                key={String(v)}
                style={style}
                onClick={() => {
                  if (revealed) return;
                  setPicked(v);
                  setTimeout(() => reveal(v === q.answer, String(v)), 200);
                }}
              >
                {v ? "✓ True" : "✗ False"}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (q.kind === "fill") {
    const norm = (s) => String(s).trim().toLowerCase();
    return (
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.4 }}>{q.q}</p>
        {q.hint && <p className="muted" style={{ marginTop: 0, marginBottom: 18, fontSize: 13, fontWeight: 600 }}>Hint: {q.hint}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            autoFocus
            type="text"
            value={text}
            disabled={revealed}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim() && !revealed) {
                reveal(norm(text) === norm(q.answer), text);
              }
            }}
            placeholder="Type your answer"
            style={{
              flex: 1,
              padding: "14px 18px",
              border: `2px solid ${revealed ? (norm(text) === norm(q.answer) ? "#34D399" : "#F87171") : "var(--line-strong)"}`,
              borderRadius: 14,
              background: revealed ? (norm(text) === norm(q.answer) ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)") : "var(--bg-soft)",
              fontSize: 18,
              fontWeight: 700,
              outline: "none",
            }}
          />
          <button
            className="btn"
            style={{ background: color, color: window.readableTextOn(color) }}
            disabled={!text.trim() || revealed}
            onClick={() => reveal(norm(text) === norm(q.answer), text)}
          >
            Check
          </button>
        </div>
        {revealed && norm(text) !== norm(q.answer) && (
          <p style={{ marginTop: 14, color: "#F87171", fontWeight: 700 }}>Correct answer: <b>{q.answer}</b></p>
        )}
      </div>
    );
  }

  return <div>Unknown question type.</div>;
}

window.LessonPlayer = LessonPlayer;
