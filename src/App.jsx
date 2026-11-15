import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  // =========================
  // 設定
  // =========================

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || "count";
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

  const [randomNumber, setRandomNumber] = useState(null);
  const [count, setCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const totalCells = rows * columns;

  // =========================
  // 設定を保存
  // =========================

  useEffect(() => {
    localStorage.setItem("mode", mode);
    localStorage.setItem("targetCount", targetCount);
    localStorage.setItem("targetTime", targetTime);
    localStorage.setItem("intervalTime", intervalTime);
    localStorage.setItem("rows", rows);
    localStorage.setItem("columns", columns);
  }, [mode, targetCount, targetTime, intervalTime, rows, columns]);

  // =========================
  // ランダムなマスを作る
  // =========================

  const createRandomNumber = () => {
    const number = Math.floor(Math.random() * totalCells) + 1;
    setRandomNumber(number);
  };

  // =========================
  // スタート
  // =========================

  const startGame = () => {
    if (isRunning) return;

    setCount(0);
    setElapsedTime(0);
    setRandomNumber(null);
    setIsRunning(true);

    // 最初の○を表示
    createRandomNumber();

    // ○を表示する間隔
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const nextCount = prev + 1;

        // 回数モード
        if (mode === "count" && nextCount >= targetCount) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
        }

        return nextCount;
      });

      createRandomNumber();
    }, intervalTime * 1000);

    // タイマーモード
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

  return (
    <div className="app">
      {/* タイトル */}
      <header className="header">
        <h1>ランダムトレーニング</h1>
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

              {/* 回数 */}
              {mode === "count" && (
                <div className="settingItem">
                  <label>回数</label>

                  <input
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                  />

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
                  />

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

                <span>秒</span>
              </div>

              {/* 縦 */}
              <div className="settingItem">
                <label>縦</label>

                <input
                  type="number"
                  min="1"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                />

                <span>マス</span>
              </div>

              {/* 横 */}
              <div className="settingItem">
                <label>横</label>

                <input
                  type="number"
                  min="1"
                  value={columns}
                  onChange={(e) => setColumns(Number(e.target.value))}
                />

                <span>マス</span>
              </div>
            </div>

            {/* 設定保存 */}
            <button
              className="saveButton"
              onClick={() => setIsSettingsOpen(false)}
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
        {mode === "count" && (
          <span>
            {count} / {targetCount} 回
          </span>
        )}

        {mode === "timer" && <span>{elapsedTime} 秒</span>}
      </div>

      {/* =========================
          START・設定ボタン
      ========================= */}

      <div className="buttons">
        {!isRunning ? (
          <button className="startButton" onClick={startGame}>
            START
          </button>
        ) : (
          <button className="stopButton" onClick={stopGame}>
            STOP
          </button>
        )}

        <button
          className="settingsButton"
          onClick={() => setIsSettingsOpen(true)}
          disabled={isRunning}
        >
          ⚙
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
              {randomNumber === number && <span className="circle">○</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
