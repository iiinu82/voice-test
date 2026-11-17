import { useState, useRef, useEffect } from "react";
import "./App.css";
import logo from "/logo.png";

function App() {
  // =========================
  // 設定
  // =========================

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || "count";
  });

  const [hasCountdown, setHasCountdown] = useState(() => {
    return localStorage.getItem("hasCountdown") || "true";
  });

  const [targetCount, setTargetCount] = useState(() => {
    return Number(localStorage.getItem("targetCount")) || 10;
  });

  const [targetTime, setTargetTime] = useState(() => {
    return Number(localStorage.getItem("targetTime")) || 10;
  });

  const [intervalTime, setIntervalTime] = useState(() => {
    return Number(localStorage.getItem("intervalTime")) || 1;
  });

  const [rows, setRows] = useState(() => {
    return Number(localStorage.getItem("rows")) || 3;
  });

  const [columns, setColumns] = useState(() => {
    return Number(localStorage.getItem("columns")) || 3;
  });

  // =========================
  // ゲームの状態
  // =========================
  const [result, setResult] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);
  // 回数
  const [count, setCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // カウントダウン表示
  const [countdown, setCountdown] = useState(null);

  // 設定モーダル開閉
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const previousNumber = useRef(null);

  const totalCells = rows * columns;
  const commandProcessed = useRef(false);

  // =========================
  // 設定を保存
  // =========================

  useEffect(() => {
    localStorage.setItem("mode", mode);
    localStorage.setItem("hasCountdown", hasCountdown);
    localStorage.setItem("targetCount", targetCount);
    localStorage.setItem("targetTime", targetTime);
    localStorage.setItem("intervalTime", intervalTime);
    localStorage.setItem("rows", rows);
    localStorage.setItem("columns", columns);
  }, [
    mode,
    hasCountdown,
    targetCount,
    targetTime,
    intervalTime,
    rows,
    columns,
  ]);

  // =========================
  // ランダムなマスを作る
  // =========================

  const createRandomNumber = () => {
    let number = Math.floor(Math.random() * (totalCells - 1)) + 1;
    if (number >= previousNumber.current) {
      number++;
    }

    previousNumber.current = number;

    setRandomNumber(number);
  };

  // =========================
  // スタート
  // =========================

  const startGameNow = () => {
    setCountdown(null);
    setCount(0);
    setElapsedTime(0);
    setRandomNumber(null);
    previousNumber.current = null;
    setIsRunning(true);

    createRandomNumber();

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const nextCount = prev + 1;

        if (mode === "count" && nextCount >= targetCount) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
        }

        return nextCount;
      });

      createRandomNumber();
    }, intervalTime * 1000);

    if (mode === "timer") {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const nextTime = prev + 1;

          if (nextTime >= targetTime) {
            clearInterval(timerRef.current);
            clearInterval(intervalRef.current);
            setIsRunning(false);
          }

          return nextTime;
        });
      }, 1000);
    }
  };

  const startGame = () => {
    if (isRunning || countdown !== null) return;

    // 秒読み無し
    if (!hasCountdown) {
      startGameNow();
      return;
    }

    setCountdown("READY");

    setTimeout(() => {
      setCountdown(3);

      setTimeout(() => {
        setCountdown(2);

        setTimeout(() => {
          setCountdown(1);

          setTimeout(() => {
            startGameNow();
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // =========================
  // ストップ
  // =========================

  const stopGame = () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    setIsRunning(false);
    setElapsedTime(0);
  };

  // =========================
  // 終了時の後片付け
  // =========================

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // =========================
  // 音声認識
  // =========================

  // 音声認識中かどうか
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
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

      if (!commandProcessed.current) {
        if (text.includes("スタート")) {
          startGame();

          commandProcessed.current = true;
        }
      }

      if (!commandProcessed.current) {
        if (text.includes("ストップ")) {
          stopGame();

          commandProcessed.current = true;
        }
      }

      if (event.results[event.results.length - 1].isFinal) {
        commandProcessed.current = false;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();

    setIsListening(true);
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  return (
    <div className="app">
      {/* タイトル */}
      <header className="header">
        <img className="logo" src={logo} alt="ランダムトレーニング" />
      </header>

      {/* =========================
          設定モーダル
      ========================= */}

      {isSettingsOpen && (
        <div className="modalOverlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>トレーニング設定</h2>

              <button
                className="closeButton"
                onClick={() => setIsSettingsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="settings">
              {/* モード */}
              <div className="settingItem">
                <label>モード</label>

                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="count">回数モード</option>
                  <option value="timer">タイマーモード</option>
                </select>
              </div>
              {/* 秒読み */}
              <div className="settingItem">
                <label>秒読み</label>
                <input
                  type="checkbox"
                  checked={hasCountdown}
                  onChange={(e) => setHasCountdown(e.target.checked)}
                />
              </div>

              {/* 回数 */}
              {mode === "count" && (
                <div className="settingItem">
                  <label>回数</label>
                  <input
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                  />{" "}
                  <button
                    type="button"
                    className="minusButton"
                    onClick={() =>
                      setTargetCount((prev) => Math.max(1, prev - 1))
                    }
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="plusButton"
                    onClick={() => setTargetCount((prev) => prev + 1)}
                  >
                    ＋
                  </button>
                  <span>回</span>
                </div>
              )}

              {/* 時間 */}
              {mode === "timer" && (
                <div className="settingItem">
                  <label>時間</label>
                  <input
                    type="number"
                    min="1"
                    value={targetTime}
                    onChange={(e) => setTargetTime(Number(e.target.value))}
                  />{" "}
                  <button
                    type="button"
                    className="minusButton"
                    onClick={() =>
                      setTargetTime((prev) => Math.max(1, prev - 1))
                    }
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="plusButton"
                    onClick={() => setTargetTime((prev) => prev + 1)}
                  >
                    ＋
                  </button>
                  <span>秒</span>
                </div>
              )}

              {/* ○の表示間隔 */}
              <div className="settingItem">
                <label>間隔</label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={intervalTime}
                  onChange={(e) => setIntervalTime(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="minusButton"
                  onClick={() =>
                    setIntervalTime((prev) =>
                      Math.max(0.1, Math.round((prev - 0.1) * 10) / 10),
                    )
                  }
                >
                  −
                </button>
                <button
                  type="button"
                  className="plusButton"
                  onClick={() =>
                    setIntervalTime(
                      (prev) => Math.round((prev + 0.1) * 10) / 10,
                    )
                  }
                >
                  ＋
                </button>

                <span>秒</span>
              </div>

              {/* 縦 */}
              <div className="settingItem">
                <label>縦</label>

                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="minusButton"
                  onClick={() => setRows((prev) => Math.max(1, prev - 1))}
                >
                  −
                </button>
                <button
                  type="button"
                  className="plusButton"
                  onClick={() => setRows((prev) => Math.min(5, prev + 1))}
                >
                  ＋
                </button>
                <span>マス</span>
              </div>

              {/* 横 */}
              <div className="settingItem">
                <label>横</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={columns}
                  onChange={(e) => setColumns(Number(e.target.value))}
                />{" "}
                <button
                  type="button"
                  className="minusButton"
                  onClick={() => setColumns((prev) => Math.max(1, prev - 1))}
                >
                  −
                </button>
                <button
                  type="button"
                  className="plusButton"
                  onClick={() => setColumns((prev) => Math.min(5, prev + 1))}
                >
                  ＋
                </button>
                <span>マス</span>
              </div>
            </div>

            {/* 設定保存 */}
            <button
              className="saveButton"
              onClick={() => {
                setCount(0);
                setElapsedTime(0);
                setIsSettingsOpen(false);
              }}
            >
              設定を保存する
            </button>
          </div>
        </div>
      )}

      {/* =========================
          ステータス表示
      ========================= */}

      <div className="status">
        <h2 style={{ height: "20px" }}>{result}</h2>
        {mode === "count" && (
          <span>
            {count} / {targetCount} 回
          </span>
        )}

        {mode === "timer" && (
          <span>
            {elapsedTime} / {targetTime}秒
          </span>
        )}
      </div>

      {/* =========================
          START・設定ボタン
      ========================= */}

      <div className="buttons">
        {/* 音声認識ボタン */}
        <button
          className="soundStartButton"
          onClick={isListening ? stopRecognition : startRecognition}
          disabled={isRunning}
        >
          {isListening ? (
            <i className="fa-solid fa-microphone"></i>
          ) : (
            <i className="fa-solid fa-microphone-slash"></i>
          )}
        </button>

        {!isRunning ? (
          <button className="startButton" onClick={startGame}>
            {countdown !== null ? countdown : "START"}
          </button>
        ) : (
          <button className="stopButton" onClick={stopGame}>
            STOP
          </button>
        )}

        {/* 歯車ボタン */}
        <button
          className="settingsButton"
          onClick={() => setIsSettingsOpen(true)}
          disabled={isRunning}
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </div>

      {/* =========================
          3×3などのマス
      ========================= */}

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: totalCells }, (_, index) => {
          const number = index + 1;

          return (
            <div key={number} className="cell">
              {randomNumber === number && <span className="circle"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
