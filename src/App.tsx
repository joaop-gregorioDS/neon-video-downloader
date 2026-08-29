import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [destination, setDestination] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "mp3">("video");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  useEffect(() => {
    const unlistenProgress = listen<string>("download-progress", (event) => {
      const line = event.payload;
      setLog((prev) => prev + line + "\n");
      
      const match = line.match(/\[download\]\s+([\d.]+)%/);
      if (match && match[1]) {
        setProgress(parseFloat(match[1]));
      }
    });

    const unlistenFinished = listen<string>("download-finished", (event) => {
      setIsDownloading(false);
      setLog((prev) => prev + `\n▶ Download Finalizado [${event.payload}]\n`);
      if (event.payload === "SUCCESS") setProgress(100);
    });

    return () => {
      unlistenProgress.then((f) => f());
      unlistenFinished.then((f) => f());
    };
  }, []);

  const selectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Selecione a pasta de destino"
      });
      
      if (selected) {
        setDestination(selected as string);
      }
    } catch (err) {
      console.error("Erro ao abrir seletor de pasta:", err);
    }
  };

  const handleDownload = async () => {
    if (!url || !destination) {
      alert("Por favor, preencha a URL e escolha uma pasta.");
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setLog("Iniciando requisição de download...\n");

    try {
      await invoke("download_video", { url, destination, mediaType });
    } catch (error) {
      setIsDownloading(false);
      setLog((prev) => prev + `\nERRO FATAL: ${error}\n`);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "400px",
      // Estilo Glassmorphism (Vidro Fosco)
      background: "rgba(15, 15, 25, 0.4)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)", // Safari
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      display: "flex",
      flexDirection: "column",
      gap: "18px"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "5px" }}>
        {/* Ícone de Mídia/Vídeo do Fluent Design com gradiente de cobre aplicado */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="copperGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f1c40f" />
              <stop offset="50%" stopColor="#e67e22" />
              <stop offset="100%" stopColor="#d35400" />
            </linearGradient>
          </defs>
          {/* Path de um ícone de "Filme/Vídeo" clássico e limpo (estilo Fluent) */}
          <path d="M4 6.25C4 5.01 5.01 4 6.25 4h11.5C18.99 4 20 5.01 20 6.25v11.5c0 1.24-1.01 2.25-2.25 2.25H6.25A2.25 2.25 0 0 1 4 17.75V6.25zm11.5 5.75L9.5 7.75v8.5l6.0-4.25z" fill="url(#copperGrad)"/>
        </svg>

        <h2 style={{ 
          margin: 0,
          fontFamily: "'Monoton', cursive",
          fontWeight: "normal",
          fontSize: "36px",
          background: "linear-gradient(135deg, #f1c40f 0%, #e67e22 50%, #d35400 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 15px rgba(230, 126, 34, 0.3)",
          letterSpacing: "3px"
        }}>
          DOWNLOADER
        </h2>
      </div>
      
      {/* Input de URL */}
      <input 
        type="text" 
        placeholder="Cole a URL do vídeo aqui..." 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isDownloading}
        style={{ 
          padding: "12px", 
          borderRadius: "8px", 
          border: "1px solid rgba(255,255,255,0.2)", 
          outline: "none",
          background: "rgba(0, 0, 0, 0.4)",
          color: "#fff",
          fontSize: "14px"
        }}
      />

      {/* Seletor de Formato (Vídeo vs MP3) */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setMediaType("video")}
          disabled={isDownloading}
          style={{
            flex: 1,
            padding: "10px",
            background: mediaType === "video" ? "rgba(255, 126, 95, 0.2)" : "rgba(0,0,0,0.3)",
            color: mediaType === "video" ? "#ff7e5f" : "#aaa",
            border: mediaType === "video" ? "1px solid #ff7e5f" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: isDownloading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            boxShadow: mediaType === "video" ? "0 0 10px rgba(255, 126, 95, 0.3)" : "none"
          }}
        >
          🎬 Vídeo (MP4)
        </button>
        <button
          onClick={() => setMediaType("mp3")}
          disabled={isDownloading}
          style={{
            flex: 1,
            padding: "10px",
            background: mediaType === "mp3" ? "rgba(0, 242, 254, 0.2)" : "rgba(0,0,0,0.3)",
            color: mediaType === "mp3" ? "#00f2fe" : "#aaa",
            border: mediaType === "mp3" ? "1px solid #00f2fe" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: isDownloading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            boxShadow: mediaType === "mp3" ? "0 0 10px rgba(0, 242, 254, 0.3)" : "none"
          }}
        >
          🎵 Áudio (MP3)
        </button>
      </div>

      {/* Seletor de Destino */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        alignItems: "center", 
        background: "rgba(0,0,0,0.3)", 
        padding: "10px", 
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <button 
          onClick={selectFolder} 
          disabled={isDownloading} 
          style={{ 
            padding: "8px 12px", 
            cursor: "pointer", 
            borderRadius: "5px", 
            border: "none", 
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontWeight: "bold",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
        >
          📁 Pasta
        </button>
        <span style={{ fontSize: "12px", color: "#ddd", wordBreak: "break-all" }}>
          {destination || "Nenhuma pasta selecionada"}
        </span>
      </div>

      {/* Botão de Iniciar */}
      <button 
        onClick={handleDownload} 
        disabled={isDownloading || !url || !destination}
        style={{
          padding: "14px",
          background: (isDownloading || !url || !destination) 
            ? "rgba(255,255,255,0.1)" 
            : "linear-gradient(90deg, #8a2be2, #4169e1)",
          color: (isDownloading || !url || !destination) ? "#888" : "#fff",
          fontWeight: "bold",
          border: "none",
          borderRadius: "8px",
          cursor: (isDownloading || !url || !destination) ? "not-allowed" : "pointer",
          transition: "transform 0.1s, filter 0.3s",
          boxShadow: (isDownloading || !url || !destination) ? "none" : "0 4px 15px rgba(65, 105, 225, 0.4)"
        }}
        onMouseDown={(e) => {
          if (!isDownloading && url && destination) {
            e.currentTarget.style.transform = "scale(0.97)";
          }
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isDownloading ? "Processando..." : (mediaType === "video" ? "▶️ Baixar Vídeo" : "▶️ Baixar Áudio")}
      </button>

      {/* Barra de Progresso Real-time */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#ccc" }}>Progresso</span>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{ width: "100%", height: "12px", background: "rgba(0,0,0,0.5)", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ 
            width: `${progress}%`, 
            height: "100%", 
            background: progress === 100 ? "#00ffcc" : "linear-gradient(90deg, #ff007f, #8a2be2)", 
            transition: "width 0.3s ease-in-out, background 0.5s",
            boxShadow: "0 0 10px rgba(138, 43, 226, 0.5)"
          }} />
        </div>
      </div>

      {/* Terminal de Logs */}
      <div style={{
        background: "rgba(0, 0, 0, 0.6)",
        color: "#00ffcc",
        padding: "12px",
        borderRadius: "8px",
        height: "180px",
        overflowY: "auto",
        fontFamily: "Consolas, monospace",
        fontSize: "11px",
        whiteSpace: "pre-wrap",
        lineHeight: "1.5",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {log || "Pronto! Cole a URL e escolha a pasta acima para começar."}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

export default App;
