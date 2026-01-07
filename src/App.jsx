// App.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ExternalLink,
  Download,
  Play,
  Pause,
  X,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
} from "lucide-react";

// =====================================================
// Self-contained UI primitives (so nothing breaks on deploy)
// Tailwind required. Works great with Vite + React + Tailwind.
// =====================================================
function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white shadow-sm",
        "dark:bg-slate-900 dark:border-slate-800",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

function CardTitle({ className, children }) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-900 dark:text-slate-100", className)}>
      {children}
    </h3>
  );
}

function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-0", className)}>{children}</div>;
}

function Badge({ className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        "border-slate-200 bg-white/70 text-slate-700 backdrop-blur",
        "dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}

function Button({
  className,
  variant = "solid", // solid | outline | ghost
  size = "md", // sm | md | lg | icon
  type = "button",
  disabled,
  onClick,
  children,
  ariaLabel,
  title,
}) {
  const sizes = {
    sm: "h-9 px-3 text-sm rounded-xl",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "h-11 px-5 text-base rounded-2xl",
    icon: "h-10 w-10 rounded-xl p-0",
  };

  const variants = {
    solid: cn(
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700",
      "dark:bg-blue-600 dark:hover:bg-blue-500"
    ),
    outline: cn(
      "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
      "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/60"
    ),
    ghost: cn(
      "bg-transparent hover:bg-slate-100 text-slate-900",
      "dark:text-slate-100 dark:hover:bg-slate-800/60"
    ),
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300",
        "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:ring-blue-500 dark:focus:border-blue-500",
        className
      )}
    />
  );
}

function Divider({ className }) {
  return <div className={cn("h-px w-full bg-slate-200/70 dark:bg-slate-800", className)} />;
}

// =====================================================
// DATA (edit safely)
// =====================================================
const PRODUCTS = [
  {
    id: "prod-ru-book-1",
    title: "Russian Short Stories by Leo Tolstoy",
    kind: "A1–B1 Level",
    price: 12.99,
    image: "/Product_Leo.png", // public/Product_Leo.png
    externalUrl: "https://amazon.example/your-book",
    marketplace: "amazon",
    badges: ["RU–EN", "Paperback", "Audio"],
    description:
      "Word-by-word translation, stress marks, grammar notes, exercises, and audio. Designed for confident reading.",
  },
];

const AUDIO_BOOKS = [
  {
    id: "tolstoy-short-stories",
    title: "Russian Short Stories",
    cover: "/Audio_External_Leo.png", // public/Audio_External_Leo.png
    description: "by Leo Tolstoy",
    tracks: [
      { id: "kostochka", title: "Косточка (The Pit)", src: "/audio/kostochka.mp3" },
      { id: "kotenok", title: "Котёнок (The Kitten)", src: "/audio/kotenok.mp3" },
      { id: "lebedy", title: "Лебеди (The Swans)", src: "/audio/lebedy.mp3" },
      { id: "bears", title: "Три медведя (The Three Bears)", src: "/audio/bears.mp3" },
      { id: "shark", title: "Акула (The Shark)", src: "/audio/shark.mp3" },
      { id: "jump", title: "Прыжок (The Jump)", src: "/audio/jump.mp3" },
    ],
  },
];

// =====================================================
// I18N
// =====================================================
const I18N = {
  en: {
    name: "Genndy Bogdanov",
    tagline: "Russian teacher • Reading-first approach",
    nav_about: "About",
    nav_products: "Store",
    nav_audio: "Audiobooks",

    about_title: "Hi! I’m Genndy — a Russian teacher and learning-materials author",
    about_p1:
      "I help English speakers read Russian faster and with confidence. 1000+ lessons taught, consistently high ratings.",
    contacts: "Contacts",
    learn_with_me: "Learn Russian with me on:",
    newsletter: "Newsletter",

    products_search: "Search by title, level, or description…",
    search_clear: "Clear",
    not_found: "Nothing found",
    try_another: "Try another search query.",
    buy_amazon: "Buy on Amazon",
    buy_etsy: "Buy on Etsy",
    buy_generic: "Buy",

    audio_choose: "Choose a book to listen to or download",
    audio_empty: "No audiobooks available yet.",
    back: "Back",
    download_all: "Download all",
    listen: "Play",
    pause: "Pause",
    download: "Download",
    now_playing: "Now playing",
    playback_speed: "Speed",
    volume: "Volume",
    muted: "Muted",
    unmuted: "Unmuted",
    reset: "Restart",
    forward_15: "Forward 15s",
    error_audio: "Audio failed to load. Check the file path in /public/audio.",
    theme_light: "Light",
    theme_dark: "Dark",
  },

  ru: {
    name: "Genndy Bogdanov",
    tagline: "Преподаватель русского • Учимся читать быстрее",
    nav_about: "Обо мне",
    nav_products: "Магазин",
    nav_audio: "Аудиокниги",

    about_title: "Привет! Я — Геннадий. Преподаватель русского языка и автор учебных материалов.",
    about_p1:
      "Я помогаю англоговорящим быстрее и увереннее читать по-русски. 1000+ уроков, стабильно высокий рейтинг.",
    contacts: "Контакты",
    learn_with_me: "Учи русский язык со мной на платформах:",
    newsletter: "Рассылка",

    products_search: "Поиск по названию, уровню или описанию…",
    search_clear: "Очистить",
    not_found: "Ничего не найдено",
    try_another: "Попробуйте другой запрос.",
    buy_amazon: "Купить на Amazon",
    buy_etsy: "Купить на Etsy",
    buy_generic: "Купить",

    audio_choose: "Выберите книгу, чтобы слушать или скачать материалы",
    audio_empty: "Пока нет доступных аудиокниг.",
    back: "Назад",
    download_all: "Скачать всё",
    listen: "Слушать",
    pause: "Пауза",
    download: "Скачать",
    now_playing: "Сейчас играет",
    playback_speed: "Скорость",
    volume: "Громкость",
    muted: "Звук выключен",
    unmuted: "Звук включен",
    reset: "С начала",
    forward_15: "+15 сек",
    error_audio: "Не удалось загрузить аудио. Проверьте пути в /public/audio.",
    theme_light: "Светлая",
    theme_dark: "Тёмная",
  },
};

// =====================================================
// Helpers
// =====================================================
function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function currencyUSD(n) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  } catch {
    return `$${n}`;
  }
}

function productBuyLabel(item, t) {
  if (item.marketplace === "amazon") return t("buy_amazon");
  if (item.marketplace === "etsy") return t("buy_etsy");
  return t("buy_generic");
}

function NavPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 px-4 rounded-full border text-sm font-medium transition select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-500",
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/60",
        active && "dark:border-blue-600 dark:bg-blue-600"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <Card className="border border-slate-200/70 dark:border-slate-800">
      <CardContent className="p-6">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}

function ProductCard({ item, t }) {
  const buyText = productBuyLabel(item, t);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {item.badges?.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      </div>

      <CardContent className="flex flex-col flex-grow">
        <div className="space-y-2">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.kind}</p>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200">{item.description}</p>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {currencyUSD(item.price)}
          </span>

          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" className="gap-2" ariaLabel={buyText} title={buyText}>
              <ExternalLink className="w-4 h-4" />
              <span>{buyText}</span>
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function AudioBookTile({ book, onOpen }) {
  return (
    <button onClick={() => onOpen(book.id)} className="w-full text-left" type="button">
      <Card className="p-4 hover:shadow-md transition">
        <div className="flex gap-4 items-center">
          <img
            src={book.cover}
            alt={book.title}
            className="w-16 h-16 rounded-2xl object-cover flex-none"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{book.title}</p>
            {book.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </button>
  );
}

function TrackRow({
  track,
  t,
  isActive,
  isPlaying,
  onToggle,
  onSeek,
  currentTime,
  duration,
  onDownload,
}) {
  const activeAndPlaying = isActive && isPlaying;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;

  return (
    <Card className={cn("transition", isActive ? "shadow-md border-blue-200/80 dark:border-blue-700/60" : "")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("font-medium truncate", isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-200")}>
              {track.title}
            </p>

            {isActive && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatTime(safeTime)} / {formatTime(safeDuration)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-none">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onToggle(track)}
              ariaLabel={activeAndPlaying ? t("pause") : t("listen")}
              title={activeAndPlaying ? t("pause") : t("listen")}
              className={cn(isActive ? "shadow-sm" : "")}
            >
              {activeAndPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={() => onDownload(track)}
              ariaLabel={`${t("download")}: ${track.title}`}
              title={t("download")}
              disabled={!track.src || track.src === "#"}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isActive && (
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={safeDuration || 0}
              step={0.25}
              value={Math.min(safeTime, safeDuration || safeTime)}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={!safeDuration}
              className={cn(
                "w-full accent-blue-600",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              aria-label="Seek"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// APP
// =====================================================
export default function App() {
  // ---- language ----
  const detectLanguage = () => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ru" || saved === "en") return saved;
      const browser = (navigator.language || "en").toLowerCase();
      return browser.startsWith("ru") ? "ru" : "en";
    } catch {
      return "en";
    }
  };

  const [lang, setLang] = useState(() => detectLanguage());
  const t = useCallback((key) => I18N[lang]?.[key] ?? I18N.en[key] ?? key, [lang]);

  const switchLang = (next) => {
    setLang(next);
    try {
      localStorage.setItem("lang", next);
    } catch {}
  };

  // ---- theme (light/dark) ----
  const detectTheme = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
      return "light";
    } catch {
      return "light";
    }
  };

  const [theme, setTheme] = useState(() => detectTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // ---- tab ----
  const detectTab = () => {
    try {
      const saved = localStorage.getItem("tab");
      if (saved === "about" || saved === "products" || saved === "free-audio") return saved;
    } catch {}
    return "about";
  };

  const [tab, setTab] = useState(() => detectTab());

  useEffect(() => {
    try {
      localStorage.setItem("tab", tab);
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  // ---- store search ----
  const [query, setQuery] = useState("");
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) =>
      [p.title, p.kind, p.description, ...(p.badges || [])].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const clearQuery = () => setQuery("");

  // ---- audiobooks ----
  const [audioBookId, setAudioBookId] = useState(null);
  const selectedBook = useMemo(
    () => AUDIO_BOOKS.find((b) => b.id === audioBookId) || null,
    [audioBookId]
  );

  // One global audio player
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [audioError, setAudioError] = useState("");

  // restore player prefs
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem("volume"));
      const r = Number(localStorage.getItem("rate"));
      const m = localStorage.getItem("muted");
      if (Number.isFinite(v) && v >= 0 && v <= 1) setVolume(v);
      if (Number.isFinite(r) && r >= 0.5 && r <= 2) setPlaybackRate(r);
      if (m === "1" || m === "0") setMuted(m === "1");
    } catch {}
  }, []);

  // apply to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    audio.muted = muted;
    try {
      localStorage.setItem("volume", String(volume));
      localStorage.setItem("rate", String(playbackRate));
      localStorage.setItem("muted", muted ? "1" : "0");
    } catch {}
  }, [playbackRate, volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onMeta = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const onErr = () => {
      setAudioError(t("error_audio"));
      setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("error", onErr);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("error", onErr);
    };
  }, [t]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setAudioError("");
  }, []);

  const loadTrack = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio || !track?.src || track.src === "#") return;

    setAudioError("");
    if (audio.src !== track.src) {
      // IMPORTANT: make sure it becomes absolute to avoid some browser quirks
      audio.src = track.src;
    }
    setCurrentTrack(track);
  }, []);

  const toggleTrack = useCallback(
    async (track) => {
      const audio = audioRef.current;
      if (!audio || !track?.src || track.src === "#") return;

      // same track: toggle
      if (currentTrack?.id === track.id) {
        if (!audio.paused) {
          audio.pause();
          return;
        }
        try {
          await audio.play();
        } catch (e) {
          console.warn("Audio play failed:", e);
        }
        return;
      }

      // new track
      loadTrack(track);

      try {
        await audio.play();
      } catch (e) {
        console.warn("Audio play failed:", e);
      }
    },
    [currentTrack, loadTrack]
  );

  const seekTo = useCallback((sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, sec || 0);
    setCurrentTime(audio.currentTime);
  }, []);

  const restart = useCallback(() => {
    seekTo(0);
  }, [seekTo]);

  const forward15 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    seekTo((audio.currentTime || 0) + 15);
  }, [seekTo]);

  const handleDownload = useCallback((track) => {
    if (!track?.src || track.src === "#") return;
    const a = document.createElement("a");
    a.href = track.src;
    a.download = ""; // let browser pick filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAllAudio = useCallback(() => {
    if (!selectedBook?.tracks?.length) return;
    // Browser limitation: this will trigger multiple downloads (normal behavior)
    selectedBook.tracks.forEach((tr) => handleDownload(tr));
  }, [selectedBook, handleDownload]);

  useEffect(() => {
    // leaving audio tab — stop and reset selection
    if (tab !== "free-audio") {
      stopAudio();
      setCurrentTrack(null);
      setAudioBookId(null);
    }
  }, [tab, stopAudio]);

  useEffect(() => {
    // closing a book — stop
    if (!audioBookId) {
      stopAudio();
      setCurrentTrack(null);
    }
  }, [audioBookId, stopAudio]);

  // Keyboard shortcuts (only inside audio book view)
  useEffect(() => {
    if (tab !== "free-audio" || !audioBookId) return;

    const onKeyDown = (e) => {
      // ignore typing into inputs
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (currentTrack) toggleTrack(currentTrack);
      }
      if (e.key === "ArrowRight") forward15();
      if (e.key === "r" || e.key === "R") restart();
      if (e.key === "m" || e.key === "M") setMuted((v) => !v);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tab, audioBookId, currentTrack, toggleTrack, forward15, restart]);

  // Layout
  const CONTAINER = "w-full max-w-6xl mx-auto px-4 sm:px-6";
  const TOPBAR_H = "min-h-[68px]";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 shadow"
      >
        Skip to content
      </a>

      <audio ref={audioRef} preload="metadata" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/70 backdrop-blur border-b border-slate-200/70 dark:border-slate-800">
        {/* TOP BAR */}
        <div className="w-full">
          <div className={cn(CONTAINER, "py-3 flex items-center justify-between gap-4", TOPBAR_H)}>
            <div className="flex items-center gap-3 min-w-0">
              {/* Use your own logo if you want: /logo.png */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white font-bold">
                G
              </div>

              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">{t("name")}</p>
                <p className="text-xs opacity-70 truncate">{t("tagline")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Theme toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
                ariaLabel={theme === "dark" ? t("theme_light") : t("theme_dark")}
                title={theme === "dark" ? t("theme_light") : t("theme_dark")}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Language */}
              <NavPill active={lang === "ru"} onClick={() => switchLang("ru")}>
                RU
              </NavPill>
              <NavPill active={lang === "en"} onClick={() => switchLang("en")}>
                EN
              </NavPill>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="border-t border-slate-200/70 dark:border-slate-800">
          <div className={cn(CONTAINER, "py-3 flex items-center gap-3 overflow-x-auto")}>
            <NavPill active={tab === "about"} onClick={() => setTab("about")}>
              {t("nav_about")}
            </NavPill>
            <NavPill active={tab === "products"} onClick={() => setTab("products")}>
              {t("nav_products")}
            </NavPill>
            <NavPill
              active={tab === "free-audio"}
              onClick={() => {
                setTab("free-audio");
                setAudioBookId(null);
              }}
            >
              {t("nav_audio")}
            </NavPill>
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <main id="content" className={cn("flex-1", CONTAINER, "py-8 space-y-10")}>
        {/* ABOUT */}
        {tab === "about" && (
          <section className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("about_title")}
              </h1>
              <p className="leading-relaxed text-slate-700 dark:text-slate-200">{t("about_p1")}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://preply.com/en/?pref=ODkzOTkyOQ==&id=1759522486.457389&ep=w1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="solid" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Preply
                  </Button>
                </a>

                <a
                  href="https://www.italki.com/affshare?ref=af11775706"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    italki
                  </Button>
                </a>

                <a
                  href="https://substack.com/@gbogdanov"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t("newsletter")}
                  </Button>
                </a>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{t("learn_with_me")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-slate-700 dark:text-slate-200 text-sm">
                    <li className="flex items-center justify-between gap-3">
                      <span>Preply</span>
                      <a
                        className="underline hover:opacity-80"
                        href="https://preply.com/en/?pref=ODkzOTkyOQ==&id=1759522486.457389&ep=w1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        open
                      </a>
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span>italki</span>
                      <a
                        className="underline hover:opacity-80"
                        href="https://www.italki.com/affshare?ref=af11775706"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        open
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contacts")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <span>E-mail</span>
                    <a className="underline hover:opacity-80" href="mailto:genndybogdanov@gmail.com">
                      genndybogdanov@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Substack</span>
                    <a
                      className="underline hover:opacity-80"
                      href="https://substack.com/@gbogdanov"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      open
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <img
                  src="/Portrait_1.jpg"
                  alt="Portrait"
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                />
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Minimal, clean, and readable — like your future Russian. 🙂
                  </p>
                </CardContent>
              </Card>
            </aside>
          </section>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  aria-label={t("products_search")}
                  placeholder={t("products_search")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 pr-10"
                />
                {!!query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={t("search_clear")}
                    title={t("search_clear")}
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300">
                {filteredProducts.length} / {PRODUCTS.length}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <EmptyState title={t("not_found")} subtitle={t("try_another")} />
                </div>
              ) : (
                filteredProducts.map((p) => <ProductCard key={p.id} item={p} t={t} />)
              )}
            </div>
          </section>
        )}

        {/* AUDIO */}
        {tab === "free-audio" && (
          <section className="space-y-6">
            {!audioBookId && (
              <>
                <p className="text-slate-700 dark:text-slate-200">{t("audio_choose")}</p>

                {AUDIO_BOOKS.length === 0 ? (
                  <EmptyState title={t("audio_empty")} />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AUDIO_BOOKS.map((book) => (
                      <AudioBookTile key={book.id} book={book} onOpen={setAudioBookId} />
                    ))}
                  </div>
                )}
              </>
            )}

            {audioBookId && selectedBook && (
              <>
                {/* Top: responsive header row */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Mobile: mini cover next to title; Desktop: title only (big cover on the left below) */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={selectedBook.cover}
                      alt={selectedBook.title}
                      className="w-20 h-20 rounded-2xl object-cover shadow flex-none md:hidden"
                    />
                    <div className="min-w-0">
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight truncate">
                        {selectedBook.title}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-300">{selectedBook.description}</p>
                      {currentTrack && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {t("now_playing")}: {currentTrack.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (no a>button nesting, fully responsive) */}
                  <div className="flex w-full md:w-auto flex-wrap gap-3 md:justify-end">
                    <Button variant="outline" onClick={() => setAudioBookId(null)} className="w-full sm:w-auto">
                      ← {t("back")}
                    </Button>
                    <Button onClick={downloadAllAudio} className="w-full sm:w-auto">
                      <Download className="w-4 h-4" />
                      {t("download_all")}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  {/* Desktop cover */}
                  <Card className="hidden md:block overflow-hidden md:col-span-1">
                    <img
                      src={selectedBook.cover}
                      alt={selectedBook.title}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {t("playback_speed")}
                          </span>
                          <div className="flex gap-2">
                            {[0.75, 1, 1.25, 1.5].map((r) => (
                              <Button
                                key={r}
                                size="sm"
                                variant={playbackRate === r ? "solid" : "outline"}
                                onClick={() => setPlaybackRate(r)}
                              >
                                {r}×
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">{t("volume")}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setMuted((v) => !v)}
                            ariaLabel={muted ? t("unmuted") : t("muted")}
                            title={muted ? t("unmuted") : t("muted")}
                          >
                            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                        </div>

                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-full accent-blue-600"
                          aria-label={t("volume")}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={restart} className="flex-1">
                          <RotateCcw className="w-4 h-4" />
                          {t("reset")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={forward15} className="flex-1">
                          <FastForward className="w-4 h-4" />
                          {t("forward_15")}
                        </Button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Hotkeys: Space = play/pause, → = +15s, R = restart, M = mute.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Tracks */}
                  <div className="md:col-span-2 space-y-3">
                    {/* Mobile quick controls */}
                    <Card className="md:hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">{t("playback_speed")}</span>
                          <div className="flex gap-2">
                            {[1, 1.25, 1.5].map((r) => (
                              <Button
                                key={r}
                                size="sm"
                                variant={playbackRate === r ? "solid" : "outline"}
                                onClick={() => setPlaybackRate(r)}
                              >
                                {r}×
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setMuted((v) => !v)}
                            ariaLabel={muted ? t("unmuted") : t("muted")}
                            title={muted ? t("unmuted") : t("muted")}
                          >
                            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>

                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full accent-blue-600"
                            aria-label={t("volume")}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={restart} className="flex-1">
                            <RotateCcw className="w-4 h-4" />
                            {t("reset")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={forward15} className="flex-1">
                            <FastForward className="w-4 h-4" />
                            {t("forward_15")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {audioError && (
                      <EmptyState
                        title={audioError}
                        subtitle="Tip: files must be in /public/audio and referenced like /audio/name.mp3"
                        action={
                          <Button variant="outline" onClick={() => setAudioError("")}>
                            OK
                          </Button>
                        }
                      />
                    )}

                    {selectedBook.tracks?.length ? (
                      selectedBook.tracks.map((tr) => (
                        <TrackRow
                          key={tr.id}
                          track={tr}
                          t={t}
                          isActive={currentTrack?.id === tr.id}
                          isPlaying={isPlaying}
                          onToggle={toggleTrack}
                          onSeek={seekTo}
                          onDownload={handleDownload}
                          currentTime={currentTrack?.id === tr.id ? currentTime : 0}
                          duration={currentTrack?.id === tr.id ? duration : 0}
                        />
                      ))
                    ) : (
                      <EmptyState title={t("not_found")} subtitle={t("audio_empty")} />
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-800">
        © {new Date().getFullYear()} Genndy Bogdanov
      </footer>
    </div>
  );
}
