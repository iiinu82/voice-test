import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [randomNumber, setRandomNumber] = useState(null);

  // 音の二重反応防止
  const soundProcessed = useRef(false);
  const lastSoundTime = useRef(0);

  // 1〜9のランダムな数字を作る
  const createRandomNumber = () => {
    const number = Math.floor(Math.random() * 9) + 1;
    setRandomNumber(number);
  };

  // 大きな音を検出
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
        const now = Date.now();
        // 大きな音を1回検出
        if (
          max > 50 &&
          !soundProcessed.current &&
          now - lastSoundTime.current > 500
        ) {
          createRandomNumber();

          soundProcessed.current = true;
          lastSoundTime.current = now;
        }

        if (max <= 50) {
          soundProcessed.current = false;
        }
        requestAnimationFrame(detectSound);
      };

      detectSound();
    });
  }, []);

  return (
    <div className="app">
      <h1>3×3 音スイッチテスト</h1>

      <button onClick={createRandomNumber}>次</button>

      <div className="grid">
        {Array.from({ length: 9 }, (_, index) => {
          const number = index + 1;

          return (
            <div key={number} className="cell">
              <span>{number}</span>

              {randomNumber === number && <span className="circle">○</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
