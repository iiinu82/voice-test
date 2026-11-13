import { useState, useRef, useEffect } from "react";

function App() {
  const [result, setResult] = useState("");
  const [count, setCount] = useState(1);
  const commandProcessed = useRef(false);
  const soundProcessed = useRef(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      const detectSound = () => {
        analyser.getByteTimeDomainData(dataArray);

        let max = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const value = Math.abs(dataArray[i] - 128);

          if (value > max) {
            max = value;
          }
        }

        if (max > 50 && !soundProcessed.current) {
          setCount((prev) => prev + 1);
          soundProcessed.current = true;
        }

        if (max <= 50) {
          soundProcessed.current = false;
        }

        requestAnimationFrame(detectSound);
      };

      detectSound();
    });
  }, []);

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

      // まだ今回の発声を処理していなければ実行
      if (!commandProcessed.current) {
        if (text.includes("開始")) {
          setResult("開始");
        }
        if (text.includes("おはよう")) {
          setResult("おはようございます！！");
        }

        if (text.includes("終了")) {
          setResult("終了");
        }
        if (text.includes("足して")) {
          setResult("足して");
          setCount((prev) => prev + 1);
          commandProcessed.current = true;
        }
        if (text.includes("減らして")) {
          setResult("減らして");
          setCount((prev) => prev - 1);
          commandProcessed.current = true;
        }
      } // 音声認識が「この発声は終了した」と判断したら、
      // 次の発声を受け付けられる状態に戻す
      if (event.results[event.results.length - 1].isFinal) {
        commandProcessed.current = false;
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
