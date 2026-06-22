import { useState } from "react";
import "./App.css";
import SymbolBar from "./components/SymbolBar";

function App() {
  const [arQuery, setArQuery] = useState("");
  const [crtQuery, setCrtQuery] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [dbConfig, setDbConfig] = useState({
    host: "host.docker.internal",
    port: "3307",
    user: "root",
    password: "",
    database: ""
  });

  const [connectedDb, setConnectedDb] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const arSymbols = [
    { symbol: "π", label: "Proyección" },
    { symbol: "σ", label: "Selección" },
    { symbol: "∪", label: "Unión" },
    { symbol: "∩", label: "Intersección" },
    { symbol: "∧", label: "AND lógico" },
    { symbol: "∨", label: "OR lógico" },
    { symbol: "×", label: "Producto cartesiano" },
    { symbol: "¬", label: "NOT lógico" },
    { symbol: "γ", label: "Agrupación"}
  ];

  const crtSymbols = [
    { symbol: "∧", label: "AND lógico" },
    { symbol: "∨", label: "OR lógico" },
    { symbol: "|", label: "Tal que" },
    { symbol: "¬", label: "NOT lógico" },
    { symbol: "∃",label: "EXISTS"},
    {symbol: "∀",label: "FOR ALL"}
  ];

  const addToAR = (symbol) => {
    setArQuery(arQuery + symbol + " ");
  };

  const addToCRT = (symbol) => {
    setCrtQuery(crtQuery + symbol + " ");
  };

  const clearAll = () => {
    setArQuery("");
    setCrtQuery("");
    setSqlQuery("");
    setResult(null);
    setError(null);
  };

  const handleConnectDB = async () => {
    try {
      setError(null);

      const response = await fetch("http://localhost:5000/api/db/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dbConfig)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setConnectedDb(dbConfig);
      setShowModal(false);
    } catch (err) {
      setConnectedDb(null);
      setError(err.message);
    }
  };

  const translateARToCRT = async () => {
    try {
      setError(null);

      if (!connectedDb) {
        throw new Error("Primero debes conectar una base de datos");
      }

      const response = await fetch("http://localhost:5000/traducir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: arQuery,
          dbConfig: connectedDb,
          outputType: "crt"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setCrtQuery(data.crt);
    } catch (err) {
      setError(err.message);
    }
  };

  const translateCRTToSQL = async () => {
    try {
      setError(null);

      if (!connectedDb) {
        throw new Error("Primero debes conectar una base de datos");
      }

      const response = await fetch("http://localhost:5000/traducir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: crtQuery,
          dbConfig: connectedDb,
          outputType: "sql"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSqlQuery(data.sql);
    } catch (err) {
      setError(err.message);
    }
  };

  const translateARToSQL = async () => {
    try {
      setError(null);

      if (!connectedDb) {
        throw new Error("Primero debes conectar una base de datos");
      }

      const response = await fetch("http://localhost:5000/traducir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: arQuery,
          dbConfig: connectedDb,
          outputType: "sql"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSqlQuery(data.sql);
    } catch (err) {
      setError(err.message);
    }
  };

  const executeSQL = async () => {
    try {
      setError(null);

      if (!connectedDb) {
        throw new Error("Primero debes conectar una base de datos");
      }

      const response = await fetch("http://localhost:5000/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sql: sqlQuery,
          dbConfig: connectedDb
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>NOPLICA</h1>
          <p>Traductor AR / CRT / SQL</p>
        </div>

        <div className="topbar-right">
          {connectedDb ? (
            <span className="connected">
              Conectado a: {connectedDb.database}
            </span>
          ) : (
            <span className="not-connected">Sin conexión</span>
          )}

          <button
            className="connect-button"
            onClick={() => setShowModal(true)}
          >
            Conectar BD
          </button>
        </div>
      </header>

      <div className="translation-grid">
        <div className="panel">
          <div className="panel-title">
            <h2>Álgebra Relacional</h2>

            <button
              className="trash-button"
              onClick={() => setArQuery("")}
            >
              ⌫
            </button>
          </div>
          <textarea
            value={arQuery}
            onChange={(e) => setArQuery(e.target.value)}
          />

          <SymbolBar
            title="Símbolos AR"
            symbols={arSymbols}
            addSymbol={addToAR}
          />

          <div className="panel-buttons">
            <button onClick={translateARToCRT}>Traducir a CRT</button>
            <button onClick={translateARToSQL}>Traducir a SQL</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>CRT</h2>

            <button
              className="trash-button"
              onClick={() => setCrtQuery("")}
            >
              ⌫
            </button>
          </div>

          <textarea
            value={crtQuery}
            onChange={(e) => setCrtQuery(e.target.value)}
          />

          <SymbolBar
            title="Símbolos CRT"
            symbols={crtSymbols}
            addSymbol={addToCRT}
          />

          <div className="panel-buttons">
            <button onClick={translateCRTToSQL}>Traducir a SQL</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>SQL</h2>

            <button
              className="trash-button"
              onClick={() => setSqlQuery("")}
            >
              ⌫
            </button>
          </div>
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
          />

          <div className="panel-buttons">
            <button onClick={executeSQL}>Ejecutar SQL</button>
          </div>
        </div>
      </div>

      <div className="results-card">
        <div className="results-header">
          <h2>Resultado</h2>
          <button onClick={clearAll}>Limpiar</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {result && result.resultado && (
          <div>
            {result.resultado.length > 0 ? (
              <table className="resultado-table">
                <thead>
                  <tr>
                    {Object.keys(result.resultado[0]).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {result.resultado.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay resultados</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Conectar Base de Datos</h2>

            <input
              type="text"
              placeholder="Host"
              value={dbConfig.host}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, host: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Puerto"
              value={dbConfig.port}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, port: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Usuario"
              value={dbConfig.user}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, user: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={dbConfig.password}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, password: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Base de datos"
              value={dbConfig.database}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, database: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button onClick={handleConnectDB}>Conectar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;