import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card.jsx";
import { Button } from "./components/ui/Button.jsx";
import { Input } from "./components/ui/Input.jsx";
import { Badge } from "./components/ui/Badge.jsx";
import { ExternalLink, Download, Play, Pause, X, Search } from "lucide-react";

// ================== LAYOUT ==================
const CONTAINER = "w-full max-w-6xl mx-auto px-8";
const TOPBAR_H = "min-h-[64px]";

// ================== SWIPE TABS HOOK ==================
// Fixes:
// - Allow swipe starting on buttons/links (previously ignored) to avoid "stuck" feeling on Audiobooks/Store.
// - Add direction-lock, so "tap then drag without lifting" consistently switches on release.
// - Avoid accidental cancellation from small vertical drift once horizontal intent is detected.
function useSwipeTabs({ enabled, onPrev, onNext, thresholdPx = 60, lockPx = 10, restraintPx = 40 }) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const axisLock = useRef(null); // null | "x" | "y"

  const shouldIgnoreTarget = (target) => {
    try {
      return !!target?.closest?.('input, textarea, select, [data-no-swipe="true"], [role="slider"]');
    } catch {
      return false;
    }
  };

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled) return;
      const t = e.touches?.[0];
      if (!t) return;
      if (shouldIgnoreTarget(e.target)) return;

      startX.current = t.clientX;
      startY.current = t.clientY;
      tracking.current = true;
      axisLock.current = null;
    },
    [enabled]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!enabled || !tracking.current) return;
      const t = e.touches?.[0];
      if (!t) return;

      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;

      // Lock axis after a small movement (prevents "animation but no switch" issue)
      if (!axisLock.current) {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        if (adx >= lockPx || ady >= lockPx) {
          axisLock.current = adx > ady ? "x" : "y";
        }
      }

      // If the user is clearly scrolling vertically, cancel swipe tracking
      if (axisLock.current === "y") {
        tracking.current = false;
        return;
      }

      // If locked to horizontal, ignore vertical drift up to restraint
      if (axisLock.current === "x" && Math.abs(dy) > restraintPx) {
        // still allow if it’s basically horizontal; only cancel if it becomes too vertical
        if (Math.abs(dy) > Math.abs(dx)) tracking.current = false;
      }
    },
    [enabled, lockPx, restraintPx]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!enabled || !tracking.current) return;
      tracking.current = false;

      const t = e.changedTouches?.[0];
      if (!t) return;

      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;

      // If user performed a vertical scroll, do not switch tabs
      if (Math.abs(dy) > restraintPx && axisLock.current === "y") return;

      if (dx > thresholdPx) onPrev?.();
      else if (dx < -thresholdPx) onNext?.();
    },
    [enabled, onPrev, onNext, thresholdPx, restraintPx]
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// ================== DATA ==================
const PRODUCTS = [
  {
    id: "prod-ru-book-1",
    title: "Russian Short Stories by Leo Tolstoy",
    kind: "A1-B1 Level",
    price: 12.99,
    image: "/Product_Leo.webp",
    externalUrl: "https://amazon.example/your-book",
    marketplace: "amazon",
    badges: ["RU-EN", "Paper Book", "Audio"],
    description: "Word-by-word translation, stress marks, grammar explanations, exercises, audio included.",
    keywords: [
      // RU
      "лев",
      "толстой",
      "лев толстой",
      "л.н. толстой",
      "толстого",
      "рассказы",
      "короткие рассказы",
      "короткие",
      "книга",
      "бумажная книга",
      "печатная книга",
      "аудио",
      "аудиокнига",
      "двуязычная",
      "ru-en",
      "перевод",
      "слово за словом",
      "билингвальный",
      "на русском",
      "русский",
      // EN
      "leo",
      "tolstoy",
      "short stories",
      "paper book",
      "paperback",
      "book",
      "audio",
      "bilingual",
      "ru-en",
      "russian",
    ],
  },

  {
    id: "prod-ru-book-2",
    title: "Russian Short Stories by Anton Chekhov",
    kind: "A2-B2 Level",
    price: 14.99,
    image: "/Product_Chekhov.webp",
    externalUrl: "",
    marketplace: "amazon",
    badges: ["RU-EN", "Paper Book", "Audio"],
    description: "Coming soon.",
    disabled: true,
    keywords: [
      // RU
      "антон",
      "чехов",
      "антон чехов",
      "а.п. чехов",
      "чехова",
      "рассказы",
      "короткие рассказы",
      "короткие",
      "книга",
      "бумажная книга",
      "печатная книга",
      "аудио",
      "аудиокнига",
      "двуязычная",
      "ru-en",
      "перевод",
      "слово за словом",
      "билингвальный",
      "на русском",
      "русский",
      // EN
      "anton",
      "chekhov",
      "short stories",
      "paper book",
      "paperback",
      "book",
      "audio",
      "bilingual",
      "ru-en",
      "russian",
    ],
  },
];

const AUDIO_BOOKS = [
  {
    id: "tolstoy-short-stories",
    title: "Russian Short Stories",
    cover: "/Audio_External_Leo.webp",
    author: "by Leo Tolstoy",
    comingSoon: false,
    tracks: [
      { id: "kostochka", title: "Косточка (The Pit)", src: "/audio/kostochka.mp3" },
      { id: "kotenok", title: "Котёнок (The Kitten)", src: "/audio/kotenok.mp3" },
      { id: "lebedy", title: "Лебеди (The Swans)", src: "/audio/lebedy.mp3" },
      { id: "bears", title: "Три медведя (The Three Bears)", src: "/audio/bears.mp3" },
      { id: "shark", title: "Акула (The Shark)", src: "/audio/shark.mp3" },
      { id: "jump", title: "Прыжок (The Jump)", src: "/audio/jump.mp3" },
    ],
  },
  {
    id: "chekhov-short-stories",
    title: "Russian Short Stories",
    cover: "/Audio_External_Chekhov.webp",
    author: "by Anton Chekhov",
    comingSoon: true,
    tracks: [],
    disabled: true,
  },
];

// ================== I18N ==================
const I18N = {
  en: {
    name: "Genndy Bogdanov",
    tagline: "",
    nav_about: "About",
    nav_products: "Store",
    nav_audio: "Audiobooks",

    about_title: "Hi everyone! I’m Genndy. I’m a Russian language teacher and the author of books",
    about_p1:
      "I help learners at all levels learn Russian faster and with confidence. I’ve taught over 1,000 lessons and consistently maintain a high rating.",
    contacts: "Contacts",
    learn_with_me: "Learn Russian with me on:",

    products_search: "Search by title or description…",
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
    listen: "Listen",
    pause: "Pause",
    download: "Download",
    coming_soon: "coming soon",
  },

  ru: {
    name: "Genndy Bogdanov",
    tagline: "",
    nav_about: "Обо мне",
    nav_products: "Магазин",
    nav_audio: "Аудиокниги",

    about_title: "Всем привет, друзья! Меня зовут Геннадий. Я\u00A0преподаватель русского языка и автор книг",
    about_p1: "Я помогаю ученикам разных уровней быстрее осваивать русский язык. Более 1000 проведённых уроков и высокий рейтинг.",
    contacts: "Контакты",
    learn_with_me: "Учи русский язык со мной на платформах:",

    products_search: "Поиск по названию или описанию…",
    search_clear: "Очистить",
    not_found: "Не найдено",
    try_another: "Попробуйте другой запрос.",
    buy_amazon: "Купить на Amazon",
    buy_etsy: "Купить на Etsy",
    buy_generic: "Купить",

    audio_choose: "Выберите книгу, чтобы послушать или загрузить материалы",
    audio_empty: "Пока нет доступных аудиокниг.",
    back: "Назад",
    download_all: "Скачать всё",
    listen: "Слушать",
    pause: "Пауза",
    download: "Скачать",
    coming_soon: "скоро",
  },
};

// ================== UI HELPERS ==================
function NavPill({ active, onClick, children, size = "md", ...props }) {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";

  return (
    <button
      onClick={onClick}
      type="button"
      {...props}
      className={[
        padding,
        "whitespace-nowrap",
        "rounded-full border transition-all duration-200 select-none",
        "active:scale-[0.97]",
        "[-webkit-tap-highlight-color:transparent]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-md font-semibold"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// Link that looks like a button (no <button> inside <a>)
function LinkButton({ href, children, className = "", disabled = false, title, "aria-label": ariaLabel }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
    "[-webkit-tap-highlight-color:transparent]";

  const enabledCls = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:scale-[0.98]";
  const disabledCls = "border-slate-200 bg-white text-slate-400 opacity-70 cursor-not-allowed";

  if (disabled || !href) {
    return (
      <span className={[base, disabledCls, className].join(" ")} title={title} aria-label={ariaLabel}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[base, enabledCls, className].join(" ")}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

function ExternalLinkChip({ href, children, className = "" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "block w-full",
        "inline-flex items-center justify-between gap-3",
        "rounded-xl border border-slate-200 bg-white",
        "px-3 py-2 text-sm font-medium text-slate-800",
        "hover:bg-slate-50 active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "[-webkit-tap-highlight-color:transparent]",
        className,
      ].join(" ")}
    >
      <span className="truncate">{children}</span>
      <ExternalLink className="w-4 h-4 opacity-80 flex-none" />
    </a>
  );
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

function EmptyState({ title, subtitle, className = "" }) {
  return (
    <Card className={["border border-slate-200", className].join(" ")}>
      <CardContent className="p-6">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function BookAuthorLine({ author, comingSoon, comingSoonText }) {
  if (!author && !comingSoon) return null;

  return (
    <p className="text-sm text-slate-600 line-clamp-2">
      {author}
      {comingSoon ? <span className="font-semibold text-slate-700"> {" "}({comingSoonText})</span> : null}
    </p>
  );
}

function AudioBookTile({ book, onOpen, comingSoonText }) {
  const isDisabled = !!book.disabled;

  return (
    <button
      onClick={() => {
        if (isDisabled) return;
        onOpen(book.id);
      }}
      className="w-full max-w-sm text-left"
      type="button"
      disabled={isDisabled}
    >
      <Card
        className={[
          "p-4 border border-slate-200 transition",
          isDisabled ? "opacity-70 cursor-not-allowed" : "hover:shadow",
        ].join(" ")}
      >
        <div className="flex gap-4 items-center">
          <img
            src={book.cover}
            alt={book.title}
            className="w-16 h-16 rounded-xl object-cover flex-none"
            decoding="async"
            loading="eager"
            sizes="64px"
          />
          <div className="min-w-0">
            <p className="font-semibold truncate">{book.title}</p>
            <BookAuthorLine author={book.author} comingSoon={!!book.comingSoon} comingSoonText={comingSoonText} />
          </div>
        </div>
      </Card>
    </button>
  );
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TrackRow({ track, isActive, isPlaying, onToggle, onSeek, t, currentTime, duration }) {
  const activeAndPlaying = isActive && isPlaying;
  const showScrubber = isActive;

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;

  return (
    <Card className={["border border-slate-200 transition", isActive ? "shadow-sm" : ""].join(" ")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{track.title}</p>

            {showScrubber && (
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {formatTime(safeTime)} / {formatTime(safeDuration)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-none">
            <button
              type="button"
              onClick={() => onToggle(track)}
              className={[
                "h-10 w-10 inline-flex items-center justify-center rounded-xl border",
                "border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "[-webkit-tap-highlight-color:transparent]",
                isActive ? "shadow-sm" : "",
              ].join(" ")}
              aria-label={activeAndPlaying ? t("pause") : t("listen")}
              title={activeAndPlaying ? t("pause") : t("listen")}
              aria-pressed={activeAndPlaying}
              data-no-swipe="true"
            >
              {activeAndPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {track.src && track.src !== "#" && (
              <a href={track.src} download className="inline-flex" aria-label={`${t("download")}: ${track.title}`}>
                <span
                  className={[
                    "h-10 w-10 inline-flex items-center justify-center rounded-xl border",
                    "border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    "[-webkit-tap-highlight-color:transparent]",
                  ].join(" ")}
                  title={t("download")}
                  data-no-swipe="true"
                >
                  <Download className="w-5 h-5" />
                </span>
              </a>
            )}
          </div>
        </div>

        {showScrubber && (
          <div className="mt-3">
            <input
              type="range"
              role="slider"
              min={0}
              max={safeDuration || 0}
              step={0.25}
              value={Math.min(safeTime, safeDuration || safeTime)}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={!safeDuration}
              className="w-full accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Seek within track"
              data-no-swipe="true"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductCard({ item, t, lang }) {
  const isDisabled = !!item.disabled;
  const canBuy = !isDisabled && !!item.externalUrl;

  return (
    <Card className={["overflow-hidden border border-slate-200 flex flex-col bg-white", isDisabled ? "opacity-80" : ""].join(" ")}>
      <CardHeader className="p-0">
        <div className="relative">
          <div className="w-full aspect-[4/3] bg-white">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-contain block"
              decoding="async"
              loading="eager"
              sizes="(max-width: 1024px) 90vw, 360px"
            />
          </div>

          <div className="absolute top-1 left-1 flex flex-wrap gap-1">
            {item.badges?.map((b) => (
              <Badge key={b} className="px-2 py-0.5 text-[11px] font-normal leading-none">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex flex-col flex-grow -mt-3">
        <div className="space-y-1">
          <CardTitle className="text-base leading-snug font-semibold break-words">{item.title}</CardTitle>
          <p className="text-sm text-slate-600">{item.kind}</p>
        </div>

        <p className="mt-2 text-sm text-slate-700 leading-snug">{item.description}</p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <span className="text-xl font-semibold tabular-nums">
            {Number.isFinite(item.price) ? currencyUSD(item.price) : "—"}
          </span>

          {isDisabled ? (
            <span className="inline-flex">
              <Button variant="outline" type="button" disabled className="flex items-center gap-2 opacity-70 cursor-not-allowed">
                <ExternalLink className="w-4 h-4" />
                <span className="whitespace-nowrap">{lang === "ru" ? "Скоро в продаже" : "Coming soon"}</span>
              </Button>
            </span>
          ) : (
            <LinkButton href={item.externalUrl} disabled={!canBuy} aria-label={productBuyLabel(item, t)}>
              <ExternalLink className="w-4 h-4" />
              <span className="whitespace-nowrap">{productBuyLabel(item, t)}</span>
            </LinkButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ================== prefetch helpers ==================
const preloadedSet = new Set();
function preloadImages(urls = []) {
  if (typeof window === "undefined") return;
  urls.forEach((url) => {
    if (!url || preloadedSet.has(url)) return;
    preloadedSet.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  });
}

// ================== APP ==================
export default function App() {
  const detectLanguage = () => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ru" || saved === "en") return saved;

      const browser = (navigator.language || "en").toLowerCase();
      if (browser.startsWith("ru")) return "ru";
      return "en";
    } catch {
      return "en";
    }
  };

  const PREFETCH_AFTER_ABOUT = ["/Product_Leo.webp", "/Product_Chekhov.webp", "/Audio_External_Leo.webp", "/Audio_External_Chekhov.webp"];

  const [lang, setLang] = useState(() => detectLanguage());
  const t = (key) => I18N[lang]?.[key] ?? I18N.en[key] ?? key;

  const switchLang = (next) => {
    setLang(next);
    try {
      localStorage.setItem("lang", next);
    } catch {}
  };

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

  // runtime title/description (OG всё равно в index.html)
  useEffect(() => {
    document.title = lang === "ru" ? "Геннадий Богданов — русский язык" : "Genndy Bogdanov — Learn Russian";
  }, [lang]);

  // мягкий префетч один раз после первого рендера
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "prefetch_done_v2";
    if (sessionStorage.getItem(key)) return;

    const run = () => {
      preloadImages(PREFETCH_AFTER_ABOUT);
      sessionStorage.setItem(key, "1");
    };

    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 500);
  }, []);

  // прогрев по hover Audiobooks (тоже один раз)
  const hasPrefetchedRef = useRef(false);
  const prefetchAudiobooksOnce = useCallback(() => {
    if (hasPrefetchedRef.current) return;
    hasPrefetchedRef.current = true;
    preloadImages(PREFETCH_AFTER_ABOUT);
  }, []);

  // -------- store search --------
  const [query, setQuery] = useState("");

  const normalize = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const filteredProducts = useMemo(() => {
    const q = normalize(query);
    if (!q) return PRODUCTS;
    const tokens = q.split(" ").filter(Boolean);

    return PRODUCTS.filter((p) => {
      const haystack = normalize([p.title, p.kind, p.description, ...(p.badges || []), ...(p.keywords || [])].join(" "));
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [query]);

  const clearQuery = () => setQuery("");

  // -------- audiobooks --------
  const [audioBookId, setAudioBookId] = useState(null);
  const selectedBook = useMemo(() => AUDIO_BOOKS.find((b) => b.id === audioBookId) || null, [audioBookId]);

  useEffect(() => {
    if (!audioBookId) return;
    const found = AUDIO_BOOKS.find((b) => b.id === audioBookId);
    if (!found || found.disabled) setAudioBookId(null);
  }, [audioBookId]);

  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    // ✅ ended: сбрасываем UI и позицию
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // делаем реальный сброс позиции, чтобы scrubber не "залипал" в конце
      try {
        audio.currentTime = 0;
      } catch {}
      // по желанию можно снять активный трек полностью:
      // setCurrentTrack(null);
    };

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onMeta = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(audio.currentTime || 0);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
    };
  }, []);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const toggleTrack = useCallback(
    async (track) => {
      const audio = audioRef.current;
      if (!audio || !track?.src || track.src === "#") return;

      if (currentTrack?.id === track.id && !audio.paused) {
        audio.pause();
        return;
      }

      if (currentTrack?.id !== track.id) {
        audio.src = track.src;
        setCurrentTrack(track);
        // сброс времени под новый трек
        setCurrentTime(0);
        setDuration(0);
      }

      try {
        await audio.play();
      } catch (e) {
        console.warn("Audio play failed:", e);
      }
    },
    [currentTrack]
  );

  const seekTo = useCallback((sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, sec || 0);
    setCurrentTime(audio.currentTime);
  }, []);

  function downloadAllAudio() {
    if (!selectedBook?.tracks?.length) return;
    selectedBook.tracks.forEach((tr) => {
      if (!tr.src || tr.src === "#") return;
      const a = document.createElement("a");
      a.href = tr.src;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  useEffect(() => {
    if (tab !== "free-audio") {
      stopAudio();
      setCurrentTrack(null);
      setAudioBookId(null);
    }
  }, [tab, stopAudio]);

  useEffect(() => {
    if (!audioBookId) {
      stopAudio();
      setCurrentTrack(null);
    }
  }, [audioBookId, stopAudio]);

  // -------- mobile detection (for swipe) --------
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    setIsMobile(mq.matches);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const TABS_ORDER = ["about", "products", "free-audio"];

  const goPrevTab = useCallback(() => {
    setTab((prev) => {
      const i = TABS_ORDER.indexOf(prev);
      if (i <= 0) return prev;
      const nextTab = TABS_ORDER[i - 1];
      if (nextTab !== "free-audio") setAudioBookId(null);
      return nextTab;
    });
  }, []);

  const goNextTab = useCallback(() => {
    setTab((prev) => {
      const i = TABS_ORDER.indexOf(prev);
      if (i === -1 || i >= TABS_ORDER.length - 1) return prev;
      const nextTab = TABS_ORDER[i + 1];
      if (nextTab !== "free-audio") setAudioBookId(null);
      return nextTab;
    });
  }, []);

  const swipeHandlers = useSwipeTabs({
    enabled: isMobile && !isPlaying, // когда играет — свайп блокируем, чтобы не бесить случайными переключениями
    onPrev: goPrevTab,
    onNext: goNextTab,
    thresholdPx: 60,
    lockPx: 10,
    restraintPx: 40,
  });

  // вкладки НЕ размонтируются — скрываем через hidden
  const showAbout = tab === "about";
  const showProducts = tab === "products";
  const showAudio = tab === "free-audio";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] bg-white border rounded-lg px-3 py-2 shadow"
      >
        Skip to content
      </a>

      <audio ref={audioRef} preload="none" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="w-full">
          <div className={`${CONTAINER} py-3 flex items-center justify-between gap-4 ${TOPBAR_H}`}>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.webp"
                alt="Genndy Bogdanov"
                className="w-9 h-9 rounded-xl object-cover transition-transform duration-200 ease-out hover:scale-[1.04] hover:rotate-1"
                loading="eager"
                decoding="async"
                fetchPriority="high"   // ✅ React prop name
                sizes="36px"
              />
              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">{t("name")}</p>
                <p className="text-xs opacity-70 truncate">{t("tagline")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <NavPill size="sm" active={lang === "ru"} onClick={() => switchLang("ru")}>
                RU
              </NavPill>
              <NavPill size="sm" active={lang === "en"} onClick={() => switchLang("en")}>
                ENG
              </NavPill>
            </div>
          </div>
        </div>

        <nav className="border-t">
          <div className="w-full">
            <div className={`${CONTAINER} py-3`}>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-nowrap">
                <NavPill active={showAbout} onClick={() => setTab("about")}>
                  {t("nav_about")}
                </NavPill>

                <NavPill active={showProducts} onClick={() => setTab("products")}>
                  {t("nav_products")}
                </NavPill>

                <NavPill
                  active={showAudio}
                  onMouseEnter={prefetchAudiobooksOnce}
                  onFocus={prefetchAudiobooksOnce}
                  onClick={() => {
                    setTab("free-audio");
                    setAudioBookId(null);
                  }}
                >
                  {t("nav_audio")}
                </NavPill>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main
        id="content"
        className={`flex-1 ${CONTAINER} py-8 space-y-10`}
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        {/* ABOUT (always mounted) */}
        <section className={showAbout ? "" : "hidden"} aria-hidden={!showAbout}>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight break-words">{t("about_title")}</h1>
              <p className="leading-relaxed text-slate-700">{t("about_p1")}</p>
            </div>

            <Card className="p-5 border border-slate-200">
              <CardTitle className="mb-2">{t("contacts")}</CardTitle>
              <div className="text-sm space-y-1">
                <p>E-mail: genndybogdanov@gmail.com</p>
                <p>
                  <a
                    className="underline hover:text-slate-900 break-all"
                    href="https://substack.com/@gbogdanov"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Substack
                  </a>
                </p>
              </div>
            </Card>

            <Card className="md:col-span-3 border border-slate-200">
              <div className="p-5">
                <div className="flex items-start gap-5">
                  <div className="flex-none w-28 sm:w-32 md:w-36 aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow">
                    <img
                      src="/Portrait_1.webp"
                      alt="Portrait"
                      className="w-full h-full object-contain"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"  // ✅ React prop name
                      sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                    />
                  </div>

                  <div className="min-w-0 flex-1 md:flex md:flex-col md:items-center md:text-center">
                    <h3 className="text-lg sm:text-xl font-semibold leading-snug">{t("learn_with_me")}</h3>

                    <div className="mt-3 flex flex-col gap-2 w-full max-w-[260px]">
                      <ExternalLinkChip href="https://preply.com/en/?pref=ODkzOTkyOQ==&id=1759522486.457389&ep=w1">
                        Preply
                      </ExternalLinkChip>

                      <ExternalLinkChip href="https://www.italki.com/affshare?ref=af11775706">
                        italki
                      </ExternalLinkChip>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* PRODUCTS (always mounted) */}
        <section className={showProducts ? "" : "hidden"} aria-hidden={!showProducts}>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  aria-label={t("products_search")}
                  placeholder={t("products_search")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-10"
                />
                {!!query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-100"
                    aria-label={t("search_clear")}
                    title={t("search_clear")}
                    data-no-swipe="true"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>

              <div className="hidden sm:block lg:col-span-2" />

              {filteredProducts.length === 0 ? (
                <div>
                  <EmptyState title={t("not_found")} subtitle={t("try_another")} className="max-w-[32rem]" />
                </div>
              ) : (
                filteredProducts.map((p) => <ProductCard key={p.id} item={p} t={t} lang={lang} />)
              )}
            </div>
          </div>
        </section>

        {/* AUDIOBOOKS (always mounted) */}
        <section className={showAudio ? "" : "hidden"} aria-hidden={!showAudio}>
          <div className="space-y-6">
            {!audioBookId && (
              <>
                <p className="text-slate-700">{t("audio_choose")}</p>

                {AUDIO_BOOKS.length === 0 ? (
                  <EmptyState title={t("audio_empty")} />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AUDIO_BOOKS.map((book) => (
                      <AudioBookTile
                        key={book.id}
                        book={book}
                        onOpen={setAudioBookId}
                        comingSoonText={t("coming_soon")}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {audioBookId && selectedBook && (
              <>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="order-2 md:order-1 w-full">
                    <div className="flex items-center gap-4 md:block">
                      <img
                        src={selectedBook.cover}
                        alt={selectedBook.title}
                        className="w-20 h-20 rounded-2xl object-cover shadow flex-none md:hidden"
                        decoding="async"
                        loading="eager"
                        sizes="80px"
                      />

                      <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-words">
                          {selectedBook.title}
                        </h1>

                        <p className="text-slate-600 break-words">
                          {selectedBook.author}
                          {selectedBook.comingSoon ? (
                            <span className="font-semibold text-slate-700"> {" "}({t("coming_soon")})</span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 md:order-2 flex gap-3 md:gap-3 w-full md:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setAudioBookId(null)}
                      className="w-1/2 md:w-auto whitespace-nowrap"
                      type="button"
                      data-no-swipe="true"
                    >
                      ← {t("back")}
                    </Button>

                    <Button
                      onClick={downloadAllAudio}
                      className="w-1/2 md:w-auto flex gap-2 justify-center whitespace-nowrap"
                      type="button"
                      data-no-swipe="true"
                      disabled={!selectedBook.tracks?.length}
                      title={!selectedBook.tracks?.length ? t("audio_empty") : t("download_all")}
                    >
                      <Download className="w-4 h-4" />
                      {t("download_all")}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <img
                    src={selectedBook.cover}
                    alt={selectedBook.title}
                    className="hidden md:block w-full aspect-square object-cover rounded-2xl shadow md:col-span-1"
                    decoding="async"
                    loading="eager"
                    sizes="(max-width: 1024px) 40vw, 360px"
                  />

                  <div className="md:col-span-2 space-y-3">
                    {selectedBook.tracks?.length ? (
                      selectedBook.tracks.map((tr) => (
                        <TrackRow
                          key={tr.id}
                          track={tr}
                          isActive={currentTrack?.id === tr.id}
                          isPlaying={isPlaying}
                          onToggle={toggleTrack}
                          onSeek={seekTo}
                          t={t}
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
          </div>
        </section>
      </main>

      <footer className="mt-auto py-6 text-center text-xs text-slate-500 border-t">© {new Date().getFullYear()} Genndy Bogdanov</footer>
    </div>
  );
}
