"use client";

import { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Upload,
  Wand2,
  Loader2,
  ImageIcon,
  ChevronDown,
  Zap,
  DollarSign,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { personas, type Persona } from "@/data/personas";

type GarmentCategory = "auto" | "tops" | "bottoms" | "one-pieces";
type GenerationMode = "performance" | "balanced" | "quality";

interface GenerationResult {
  url: string;
  width: number;
  height: number;
}

export default function Home() {
  // State
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [garmentUrl, setGarmentUrl] = useState("");
  const [garmentPreview, setGarmentPreview] = useState("");
  const [category, setCategory] = useState<GarmentCategory>("auto");
  const [mode, setMode] = useState<GenerationMode>("balanced");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload via drag & drop or click
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor, envie apenas imagens (JPG, PNG, WebP).");
      return;
    }
    // Create a local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setGarmentPreview(dataUrl);
      setGarmentUrl(dataUrl);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle URL input
  const handleUrlChange = (url: string) => {
    setGarmentUrl(url);
    if (url.startsWith("http")) {
      setGarmentPreview(url);
    }
  };

  // Generate Try-On
  const handleGenerate = async () => {
    if (!selectedPersona) {
      setError("Selecione uma modelo primeiro.");
      return;
    }
    if (!garmentUrl) {
      setError("Adicione uma imagem da roupa.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Simulate progress for UX (actual processing is ~30-45s)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 95));
    }, 1000);

    try {
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_image: selectedPersona.imageUrl,
          garment_image: garmentUrl,
          category,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na geração.");
      }

      if (data.success && data.images?.[0]) {
        const img = data.images[0];
        setResult(img);
        setHistory((prev) => [img, ...prev].slice(0, 12));
        setProgress(100);
      } else {
        throw new Error("Nenhuma imagem retornada.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na geração.");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setResult(null);
    setGarmentUrl("");
    setGarmentPreview("");
    setError(null);
    setProgress(0);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* ============ HEADER ============ */}
      <header className="max-w-7xl mx-auto mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl grid place-items-center"
              style={{ background: "var(--gradient-main)" }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                AI Models Agency
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Virtual Try-On • Powered by Fal.ai FASHN
              </p>
            </div>
          </div>
          <div className="cost-badge hidden sm:flex">
            <DollarSign size={12} />
            ~$0.075/image
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============ LEFT: PERSONA CARDS ============ */}
        <section className="lg:col-span-5 animate-fade-in-up">
          <div className="section-header">
            <div className="icon">
              <ImageIcon size={16} />
            </div>
            <h2>Escolha a Modelo</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => {
                  setSelectedPersona(persona);
                  setError(null);
                }}
                className={`persona-card aspect-[3/4] relative group ${selectedPersona?.id === persona.id ? "selected" : ""
                  }`}
              >
                <Image
                  src={persona.imageUrl}
                  alt={persona.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="persona-info">
                  <p className="text-sm font-semibold text-white">
                    {persona.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {persona.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {persona.style.slice(0, 2).map((tag) => (
                      <span key={tag} className="style-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ============ RIGHT: UPLOAD & RESULT ============ */}
        <section className="lg:col-span-7 space-y-6 animate-fade-in-up">
          {/* Upload Zone */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div className="icon">
                <Upload size={16} />
              </div>
              <h2>Roupa para Try-On</h2>
            </div>

            <div
              className={`upload-zone min-h-[200px] flex flex-col items-center justify-center p-6 ${garmentPreview ? "has-image" : ""
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              {garmentPreview ? (
                <div className="relative w-full max-w-xs aspect-[3/4] mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={garmentPreview}
                    alt="Garment preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div
                    className="w-16 h-16 mx-auto rounded-2xl grid place-items-center"
                    style={{ background: "var(--surface-glass)" }}
                  >
                    <Upload
                      size={24}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Arraste a imagem da roupa aqui
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      JPG, PNG ou WebP • Flat-lay ou manequim
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Ou cole a URL da imagem da roupa..."
                value={garmentUrl.startsWith("data:") ? "" : garmentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm border-none outline-none"
                style={{
                  background: "var(--surface-glass)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--surface-glass-border)",
                }}
              />
            </div>

            {/* Options */}
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Categoria
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as GarmentCategory)
                    }
                    className="appearance-none px-3 py-1.5 pr-7 rounded-lg text-xs cursor-pointer"
                    style={{
                      background: "var(--surface-glass)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--surface-glass-border)",
                    }}
                  >
                    <option value="auto">Auto-detectar</option>
                    <option value="tops">Parte de cima</option>
                    <option value="bottoms">Parte de baixo</option>
                    <option value="one-pieces">Peça inteira</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Qualidade
                </label>
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) =>
                      setMode(e.target.value as GenerationMode)
                    }
                    className="appearance-none px-3 py-1.5 pr-7 rounded-lg text-xs cursor-pointer"
                    style={{
                      background: "var(--surface-glass)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--surface-glass-border)",
                    }}
                  >
                    <option value="performance">Rápido</option>
                    <option value="balanced">Balanceado</option>
                    <option value="quality">Alta Qualidade</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-4 rounded-xl text-sm animate-fade-in-up"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Generate Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedPersona || !garmentUrl}
              className="btn-generate flex-1"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Gerando Virtual Try-On...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Gerar Look Virtual
                </>
              )}
            </button>

            {(result || garmentPreview) && (
              <button
                onClick={handleReset}
                className="p-3 rounded-xl transition-all hover:scale-105"
                style={{
                  background: "var(--surface-glass)",
                  border: "1px solid var(--surface-glass-border)",
                  color: "var(--text-secondary)",
                }}
                title="Recomeçar"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>

          {/* Progress Bar (during loading) */}
          {loading && (
            <div className="animate-fade-in-up">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p
                className="text-xs mt-2 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <Zap size={10} className="inline mr-1" />
                Processando com FASHN Try-On v1.5 • ~30-45 segundos
              </p>
            </div>
          )}

          {/* Result Panel */}
          {result && (
            <div className="result-panel animate-fade-in-up">
              <div className="p-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--surface-glass-border)" }}>
                <div className="flex items-center gap-2">
                  <Check size={16} style={{ color: "#22c55e" }} />
                  <span className="text-sm font-semibold">
                    Look Gerado com Sucesso
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="cost-badge">
                    <DollarSign size={10} />
                    ~$0.075
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{
                      background: "var(--surface-glass)",
                      border: "1px solid var(--surface-glass-border)",
                      color: "var(--text-secondary)",
                    }}
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
              <div className="p-4">
                <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.url}
                    alt="Virtual Try-On Result"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && !loading && (
            <div className="glass-card p-4 animate-fade-in-up">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Histórico de Gerações ({history.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {history.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setResult(img)}
                    className="aspect-[3/4] rounded-lg overflow-hidden border transition-all hover:scale-105 hover:border-purple-500"
                    style={{
                      borderColor: "var(--surface-glass-border)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Result ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer
        className="max-w-7xl mx-auto mt-12 pt-6 text-center text-xs"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--surface-glass-border)",
        }}
      >
        <p>
          AI Models Agency • AaaS (Avatar as a Service) •{" "}
          <span style={{ color: "var(--brand-secondary)" }}>
            FASHN Try-On v1.5
          </span>{" "}
          +{" "}
          <span style={{ color: "var(--brand-primary)" }}>
            FLUX Dev
          </span>{" "}
          via Fal.ai
        </p>
        <p className="mt-1">
          Custo por troca: ~$0.075 • Resolução: 576×864px • Formato: JPEG/PNG
        </p>
      </footer>
    </main>
  );
}
