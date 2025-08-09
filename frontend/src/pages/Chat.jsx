import React, { useState, useEffect, useRef } from "react";

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Japanese"];

const TARGET_MAP = {
  English: ["Hindi", "Marathi", "Tamil", "Japanese"],
  Hindi: ["English", "Marathi", "Tamil", "Japanese"],
  Marathi: ["English", "Hindi", "Tamil", "Japanese"],
  Tamil: ["English", "Hindi", "Marathi", "Japanese"],
  Japanese: ["English", "Hindi", "Marathi", "Tamil"],
};

// Map for STT locale codes
const STT_LANG_CODES = {
  English: "en-US",
  Hindi: "hi-IN",
  Marathi: "mr-IN",
  Tamil: "ta-IN",
  Japanese: "ja-JP",
};

function TranslatorChat() {
  const [sourceLang, setSourceLang] = useState("English");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [sentence, setSentence] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    setTargetLang(TARGET_MAP[sourceLang][0]);

    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = STT_LANG_CODES[sourceLang] || "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSentence(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sourceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.lang = STT_LANG_CODES[sourceLang] || "en-US";
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const speak = (text, lang) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const langCodePrefix = STT_LANG_CODES[lang]?.split("-")[0] || "en";
    const matched = voices.find((v) =>
      v.lang.toLowerCase().startsWith(langCodePrefix)
    );
    if (matched) utterance.voice = matched;
    speechSynthesis.speak(utterance);
  };

  const sendQuery = async () => {
    if (!sentence.trim()) return;

    const userMessage = { from: "user", text: sentence };
    setChatLog((log) => [...log, userMessage]);

    try {
      const res = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_lang: sourceLang,
          target_lang: targetLang,
          sentence,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const botText = `Translation (${data.target_lang}): ${data.translation}`;
        const botMessage = { from: "bot", text: botText };
        setChatLog((log) => [...log, botMessage]);

        speak(data.translation, targetLang);
      } else {
        setChatLog((log) => [
          ...log,
          { from: "bot", text: `❌ ${data.error}` },
        ]);
      }
    } catch (err) {
      setChatLog((log) => [
        ...log,
        { from: "bot", text: `❌ Network error: ${err.message}` },
      ]);
    }

    setSentence("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  const checkPronunciation = async () => {
    const reference = sentence;
    const spoken = sentence;
    if (!spoken.trim()) return;

    const res = await fetch("http://localhost:5000/score-pronunciation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spoken, reference }),
    });

    const data = await res.json();
    const botText = `🎤 Pronunciation Score: ${data.score}%\n🗣 You said: ${data.spoken}\n✅ Feedback: ${data.feedback}`;
    setChatLog((log) => [...log, { from: "bot", text: botText }]);
  };

  return (
    <>
    <div style={styles.container}>
      <h2 style={styles.bot}>🤖 Bhaashyabhaarat Multilingual Bot</h2>

      <div style={styles.controls}>
        <div>
          <label>
            Source Language:{" "}
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Target Language:{" "}
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {TARGET_MAP[sourceLang].map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={styles.chatBox}>
        {chatLog.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.from === "user" ? "#DCF8C6" : "#eee",
              whiteSpace: "pre-line",
              position: "relative",
            }}
          >
            {msg.text}

            {/* Repeat speak button only for bot messages */}
            {msg.from === "bot" && (
              <button
                onClick={() => speak(msg.text, targetLang)}
                style={styles.repeatButton}
                title="Repeat Speak"
              >
                🔊
              </button>
            )}
          </div>
        ))}
      </div>

      <textarea
        style={styles.textarea}
        placeholder={`🎤 Type or speak in ${sourceLang}...`}
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={styles.button} onClick={sendQuery}>
          Translate
        </button>
        <button
          style={{
            ...styles.button,
            backgroundColor: listening ? "#f44" : "#ccc",
            color: listening ? "white" : "black",
          }}
          onClick={toggleListening}
        >
          {listening ? "Stop 🎙" : "Speak 🎤"}
        </button>
        <button style={styles.button} onClick={checkPronunciation}>
          Check Pronunciation
        </button>
      </div>
      <footer style={styles.owe}>
        <div className="copyright">
          © {new Date().getFullYear()} By Whiter. All rights reserved.
        </div>
      </footer>
    </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: "20px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    height: "90vh",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  chatBox: {
    flexGrow: 1,
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    maxWidth: "80%",
    padding: "8px 36px 8px 8px", // add right padding for button space
    margin: "4px 0",
    borderRadius: 8,
    position: "relative", // required for button absolute
    whiteSpace: "pre-line",
    wordBreak: "break-word",
  },
  repeatButton: {
    position: "absolute",
    right: 8,
    top: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: 1,
    padding: 2,
  },
  textarea: {
    resize: "none",
    width: "100%",
    padding: 8,
    fontSize: 16,
  },
  button: {
    padding: "8px 12px",
    fontSize: 16,
    cursor: "pointer",
    border: "1px solid #999",
    borderRadius: 4,
  },
  owe: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    fontFamily: "'Yuji Syuku', serif",
  },
  bot: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    fontFamily: "'Nova Mono', monospace",
  },
};
export default TranslatorChat;