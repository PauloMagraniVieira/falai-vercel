"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Sparkles,
    Upload,
    Wand2,
    Loader2,
    ChevronDown,
    Zap,
    DollarSign,
    Download,
    RotateCcw,
    Check,
    AlertCircle,
    X,
    Heart,
    Star,
    Grid3X3,
    List,
    Columns3,
    LayoutGrid,
    ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { personas, type Persona } from "@/data/personas";

// ====== Types ======
type ViewMode = "tinder" | "grid" | "list" | "columns" | "gallery";
type GarmentCategory = "auto" | "tops" | "bottoms" | "one-pieces";
type GenerationMode = "performance" | "balanced" | "quality";

interface GenerationResult {
    url: string;
    width?: number;
    height?: number;
}

export default function V2Page() {
    // ====== State ======
    const [viewMode, setViewMode] = useState<ViewMode>("tinder");
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

    // Tinder state
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);

    // ====== Tinder Swipe Handlers ======
    const handleSwipe = useCallback(
        (direction: "left" | "right") => {
            setSwipeDirection(direction);
            if (direction === "right") {
                setSelectedPersona(personas[currentCardIndex]);
            }
            setTimeout(() => {
                setSwipeDirection(null);
                setDragX(0);
                setCurrentCardIndex((prev) =>
                    prev >= personas.length - 1 ? 0 : prev + 1
                );
            }, 400);
        },
        [currentCardIndex]
    );

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        setIsDragging(true);
        startX.current = e.clientX;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - startX.current;
            setDragX(dx);
        },
        [isDragging]
    );

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        if (Math.abs(dragX) > 100) {
            handleSwipe(dragX > 0 ? "right" : "left");
        } else {
            setDragX(0);
        }
    }, [dragX, handleSwipe]);

    // ====== File Upload ======
    const handleFileUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Por favor, envie apenas imagens (JPG, PNG, WebP).");
            return;
        }
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
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        },
        [handleFileUpload]
    );

    // ====== Generate ======
    const handleGenerate = async () => {
        if (!selectedPersona) {
            setError("Selecione uma modelo primeiro (deslize para a direita!).");
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
            if (!response.ok) throw new Error(data.error || "Erro na geração.");

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

    const handleReset = () => {
        setResult(null);
        setGarmentUrl("");
        setGarmentPreview("");
        setError(null);
        setProgress(0);
    };

    // ====== Render Helpers ======
    const renderTinderCard = () => {
        const current = personas[currentCardIndex];
        const next = personas[(currentCardIndex + 1) % personas.length];

        const rotation = dragX * 0.08;
        const likeOpacity = Math.max(0, Math.min(1, dragX / 120));
        const nopeOpacity = Math.max(0, Math.min(1, -dragX / 120));

        return (
            <div className="flex flex-col items-center">
                <div className="tinder-stack">
                    {/* Background card (next) */}
                    <div
                        className="tinder-card"
                        style={{
                            transform: "scale(0.93) translateY(12px)",
                            opacity: 0.5,
                            zIndex: 0,
                        }}
                    >
                        <Image
                            src={next.imageUrl}
                            alt={next.name}
                            fill
                            className="object-cover"
                            sizes="340px"
                        />
                    </div>

                    {/* Active card */}
                    <div
                        ref={cardRef}
                        className={`tinder-card ${swipeDirection === "right" ? "animate-swipe-right" : ""
                            } ${swipeDirection === "left" ? "animate-swipe-left" : ""}`}
                        style={{
                            transform: swipeDirection
                                ? undefined
                                : `translateX(${dragX}px) rotate(${rotation}deg)`,
                            zIndex: 1,
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    >
                        {/* MATCH badge */}
                        <div
                            className="match-badge like"
                            style={{ opacity: likeOpacity }}
                        >
                            MATCH ✨
                        </div>
                        <div
                            className="match-badge nope"
                            style={{ opacity: nopeOpacity }}
                        >
                            NOPE
                        </div>

                        <Image
                            src={current.imageUrl}
                            alt={current.name}
                            fill
                            className="object-cover pointer-events-none"
                            sizes="340px"
                            priority
                        />

                        <div className="card-info">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {current.name}
                                    </h3>
                                    <p className="text-sm text-white/70 mt-0.5">
                                        {current.description}
                                    </p>
                                </div>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {current.style.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 text-[10px] font-medium text-white/90 bg-white/15 rounded-full backdrop-blur-sm uppercase tracking-wide"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="tinder-action-buttons">
                    <button
                        className="tinder-btn reject"
                        onClick={() => handleSwipe("left")}
                        title="Pular"
                    >
                        <X size={22} strokeWidth={2.5} />
                    </button>
                    <button
                        className="tinder-btn accept"
                        onClick={() => handleSwipe("right")}
                        title="Selecionar modelo"
                    >
                        <Heart size={26} strokeWidth={2.5} />
                    </button>
                    <button
                        className="tinder-btn"
                        onClick={() => {
                            setSelectedPersona(current);
                        }}
                        title="Super Like"
                        style={{ color: "var(--brand-secondary)" }}
                    >
                        <Star size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <p
                    className="text-xs mt-3 text-center"
                    style={{ color: "var(--text-muted)" }}
                >
                    Arraste para a direita para selecionar • {currentCardIndex + 1}/
                    {personas.length}
                </p>
            </div>
        );
    };

    const renderGridView = () => (
        <div className="view-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
            {personas.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p)}
                    className={`persona-item aspect-[3/4] relative ${selectedPersona?.id === p.id ? "selected" : ""
                        }`}
                >
                    <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                            {p.style.slice(0, 2).map((t) => (
                                <span
                                    key={t}
                                    className="px-1.5 py-0.5 text-[9px] font-medium text-white/90 bg-white/20 rounded-full uppercase"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    {selectedPersona?.id === p.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 grid place-items-center bg-purple-600 text-white rounded-full z-10 text-xs font-bold">
                            ✓
                        </div>
                    )}
                </button>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="view-list flex flex-col gap-1.5">
            {personas.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p)}
                    className={`persona-item text-left ${selectedPersona?.id === p.id ? "selected" : ""
                        }`}
                >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p
                            className="text-xs truncate"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {p.description}
                        </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                        {p.style.slice(0, 2).map((t) => (
                            <span key={t} className="style-tag">
                                {t}
                            </span>
                        ))}
                    </div>
                    {selectedPersona?.id === p.id && (
                        <Check size={16} className="text-purple-600 flex-shrink-0" />
                    )}
                </button>
            ))}
        </div>
    );

    const renderColumnsView = () => (
        <div className="view-columns">
            {personas.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p)}
                    className={`persona-item text-left ${selectedPersona?.id === p.id ? "selected" : ""
                        }`}
                >
                    <div className="relative aspect-square">
                        <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="180px"
                        />
                    </div>
                    <div className="p-2.5">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p
                            className="text-xs mt-0.5 line-clamp-1"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {p.description}
                        </p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                            {p.style.slice(0, 2).map((t) => (
                                <span key={t} className="style-tag">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );

    const renderGalleryView = () => (
        <div className="view-gallery grid grid-cols-2 gap-3">
            {personas.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p)}
                    className={`persona-item aspect-[4/5] relative ${selectedPersona?.id === p.id ? "selected" : ""
                        }`}
                >
                    <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 30vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                        <h3 className="text-base font-bold text-white">{p.name}</h3>
                        <p className="text-xs text-white/70">{p.description}</p>
                    </div>
                    {selectedPersona?.id === p.id && (
                        <div className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full z-10 text-white text-sm font-bold"
                            style={{ background: "var(--gradient-main)" }}>
                            ✓
                        </div>
                    )}
                </button>
            ))}
        </div>
    );

    // ====== MAIN RENDER ======
    return (
        <main
            className="min-h-screen p-4 md:p-8"
            style={{ background: "var(--gradient-surface)" }}
        >
            {/* ====== HEADER ====== */}
            <header className="max-w-7xl mx-auto mb-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            className="w-8 h-8 grid place-items-center rounded-lg transition-all hover:bg-purple-50"
                            style={{ color: "var(--text-muted)" }}
                            title="V1"
                        >
                            <ArrowLeft size={18} />
                        </a>
                        <div
                            className="w-10 h-10 rounded-xl grid place-items-center"
                            style={{ background: "var(--gradient-main)" }}
                        >
                            <Sparkles size={20} color="white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                AI Models Agency{" "}
                                <span
                                    className="text-sm font-medium px-2 py-0.5 rounded-md"
                                    style={{
                                        background: "rgba(124, 58, 237, 0.06)",
                                        color: "var(--brand-primary)",
                                    }}
                                >
                                    V2
                                </span>
                            </h1>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                Virtual Try-On • Swipe & Match
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
                {/* ====== LEFT: PERSONA SELECTION ====== */}
                <section className="lg:col-span-5 animate-fade-in-up">
                    {/* View mode toolbar */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="section-header" style={{ marginBottom: 0 }}>
                            <div className="icon">
                                <Heart size={16} />
                            </div>
                            <h2>
                                {viewMode === "tinder" ? "Swipe & Match" : "Escolha a Modelo"}
                            </h2>
                        </div>

                        <div className="view-toolbar">
                            <button
                                onClick={() => setViewMode("tinder")}
                                className={viewMode === "tinder" ? "active" : ""}
                                title="Tinder (Swipe)"
                            >
                                <Heart size={14} />
                            </button>
                            <div className="separator" />
                            <button
                                onClick={() => setViewMode("grid")}
                                className={viewMode === "grid" ? "active" : ""}
                                title="Ícones"
                            >
                                <Grid3X3 size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={viewMode === "list" ? "active" : ""}
                                title="Lista"
                            >
                                <List size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode("columns")}
                                className={viewMode === "columns" ? "active" : ""}
                                title="Colunas"
                            >
                                <Columns3 size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode("gallery")}
                                className={viewMode === "gallery" ? "active" : ""}
                                title="Galeria"
                            >
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content based on view mode */}
                    <div className="glass-card p-4">
                        {viewMode === "tinder" && renderTinderCard()}
                        {viewMode === "grid" && renderGridView()}
                        {viewMode === "list" && renderListView()}
                        {viewMode === "columns" && renderColumnsView()}
                        {viewMode === "gallery" && renderGalleryView()}
                    </div>

                    {/* Selected persona indicator */}
                    {selectedPersona && (
                        <div
                            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl animate-fade-in-up"
                            style={{
                                background: "rgba(124, 58, 237, 0.05)",
                                border: "1px solid rgba(124, 58, 237, 0.12)",
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0">
                                <Image
                                    src={selectedPersona.imageUrl}
                                    alt={selectedPersona.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                />
                            </div>
                            <p className="text-sm font-medium flex-1">
                                <span style={{ color: "var(--brand-primary)" }}>
                                    {selectedPersona.name}
                                </span>{" "}
                                <span style={{ color: "var(--text-muted)" }}>selecionada</span>
                            </p>
                            <button
                                onClick={() => setSelectedPersona(null)}
                                className="p-1 rounded-md hover:bg-purple-50 transition-colors"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </section>

                {/* ====== RIGHT: UPLOAD & RESULT ====== */}
                <section className="lg:col-span-7 space-y-5 animate-fade-in-up">
                    {/* Upload Zone */}
                    <div className="glass-card p-5">
                        <div className="section-header">
                            <div className="icon">
                                <Upload size={16} />
                            </div>
                            <h2>Roupa para Try-On</h2>
                        </div>

                        <div
                            className={`upload-zone min-h-[180px] flex flex-col items-center justify-center p-6 cursor-pointer ${garmentPreview ? "has-image" : ""
                                }`}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
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
                                <div className="text-center space-y-2">
                                    <div
                                        className="w-14 h-14 mx-auto rounded-2xl grid place-items-center"
                                        style={{
                                            background: "rgba(124, 58, 237, 0.06)",
                                            color: "var(--brand-primary)",
                                        }}
                                    >
                                        <Upload size={22} />
                                    </div>
                                    <p className="text-sm font-medium">
                                        Arraste a imagem da roupa
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        JPG, PNG ou WebP • Flat-lay ou manequim
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* URL Input */}
                        <div className="mt-3">
                            <input
                                type="text"
                                placeholder="Ou cole a URL da imagem da roupa..."
                                value={garmentUrl.startsWith("data:") ? "" : garmentUrl}
                                onChange={(e) => {
                                    setGarmentUrl(e.target.value);
                                    if (e.target.value.startsWith("http"))
                                        setGarmentPreview(e.target.value);
                                }}
                                className="input-clean"
                            />
                        </div>

                        {/* Options */}
                        <div className="mt-3 flex flex-wrap gap-3">
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
                                        className="select-clean"
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
                                        className="select-clean"
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
                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-fade-in-up"
                            style={{
                                background: "rgba(239, 68, 68, 0.05)",
                                border: "1px solid rgba(239, 68, 68, 0.12)",
                                color: "#dc2626",
                            }}
                        >
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="flex items-center gap-3">
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
                                    background: "var(--surface-subtle)",
                                    border: "1px solid var(--surface-glass-border)",
                                    color: "var(--text-secondary)",
                                }}
                                title="Recomeçar"
                            >
                                <RotateCcw size={18} />
                            </button>
                        )}
                    </div>

                    {/* Progress */}
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
                                FASHN Try-On v1.5 • ~30-45 segundos
                            </p>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="result-panel animate-fade-in-up">
                            <div
                                className="p-4 flex items-center justify-between"
                                style={{
                                    borderBottom: "1px solid var(--surface-glass-border)",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Check size={16} style={{ color: "#059669" }} />
                                    <span className="text-sm font-semibold">
                                        Look Gerado com Sucesso!
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
                                            background: "var(--surface-subtle)",
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
                                Histórico ({history.length})
                            </h3>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {history.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setResult(img)}
                                        className="aspect-[3/4] rounded-lg overflow-hidden border transition-all hover:scale-105 hover:shadow-md"
                                        style={{ borderColor: "var(--surface-glass-border)" }}
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
                className="max-w-7xl mx-auto mt-10 pt-5 text-center text-xs"
                style={{
                    color: "var(--text-muted)",
                    borderTop: "1px solid var(--surface-glass-border)",
                }}
            >
                <p>
                    AI Models Agency V2 •{" "}
                    <span style={{ color: "var(--brand-primary)" }}>FASHN Try-On v1.5</span> +{" "}
                    <span style={{ color: "var(--brand-secondary)" }}>FLUX Dev</span> via Fal.ai
                </p>
            </footer>
        </main>
    );
}
