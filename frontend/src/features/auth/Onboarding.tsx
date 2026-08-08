import React from "react";

// academia.io - Onboarding screen

function Onboarding({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [avatar, setAvatar] = React.useState("hat");
  const [grade, setGrade] = React.useState(null);

  const avatars = ["hat", "panda", "fox", "cat", "dog", "owl", "penguin", "bunny", "bear", "frog", "monkey", "unicorn"];
  const grades = ["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

  function next() {
    if (step === 0 && !name.trim()) return;
    if (step === 1 && !grade) return;
    if (step === 2) {
      onDone({ name: name.trim(), avatar, grade });
      return;
    }
    setStep(step + 1);
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Logo size={64} />
        </div>

        <div className="card" style={{ padding: 28 }}>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  background: i <= step ? "var(--ink)" : "var(--line)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Step 1 of 3</div>
              <h2 style={{ marginBottom: 8 }}>What should we call you?</h2>
              <p className="soft" style={{ marginTop: 0, marginBottom: 18 }}>
                We'll use this on your profile and streak.
              </p>
              <input
                autoFocus
                type="text"
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && next()}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  fontSize: 16,
                  border: "1.5px solid var(--line-strong)",
                  borderRadius: 14,
                  background: "var(--bg-soft)",
                  outline: "none",
                  fontWeight: 700,
                }}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Step 2 of 3</div>
              <h2 style={{ marginBottom: 8 }}>Hi {name}! Which grade are you in?</h2>
              <p className="soft" style={{ marginTop: 0, marginBottom: 18 }}>
                We'll tailor recommendations to your level.
              </p>
              <div className="grade-grid">
                {grades.map((g) => (
                  <button key={g} className={grade === g ? "sel" : ""} onClick={() => setGrade(g)}>
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Step 3 of 3</div>
              <h2 style={{ marginBottom: 8 }}>Pick your avatar</h2>
              <p className="soft" style={{ marginTop: 0, marginBottom: 18 }}>
                You can change this later.
              </p>
              <div className="avatar-grid">
                {avatars.map((a) => {
                  const map = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
                  return (
                    <button key={a} className={avatar === a ? "sel" : ""} onClick={() => setAvatar(a)}>
                      {map[a]}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "space-between" }}>
            <button className="btn ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              Back
            </button>
            <button
              className="btn"
              onClick={next}
              disabled={(step === 0 && !name.trim()) || (step === 1 && !grade)}
            >
              {step === 2 ? "Start learning →" : "Continue"}
            </button>
          </div>
        </div>

        <p className="muted" style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
          Your progress is saved locally in this browser.
        </p>
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
