import { useState } from "react";

function App() {
  const [result, setResult] = useState("");
  const [count, setCount] = useState(1);

  const startRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("このブラウザは音声認識に対応していません");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setResult(text);
      if (text.includes("開始")) {
        setResult("開始");
      }

      if (text.includes("終了")) {
        setResult("終了");
      }
      if (text.includes("足して")) {
        setResult("足して");
        setCount((prev) => prev + 1);
      }
      if (text.includes("へらして || 減らして")) {
        setResult("減らして");
        setCount((prev) => prev - 1);
      }
    };

    recognition.start();
  };

  return (
    <div>
      <h1>音声認識テスト</h1>

      <button onClick={startRecognition}>集音を始める</button>

      <h2>{result}</h2>
      <div>{count}</div>
    </div>
  );
}

export default App;
