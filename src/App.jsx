import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card.jsx";
import { Button } from "./components/ui/Button.jsx";
import { Input } from "./components/ui/Input.jsx";
import { Badge } from "./components/ui/Badge.jsx";
import { ExternalLink, Download, Play, Pause, X, Search, Sun, Moon } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";

// ================== LAYOUT ==================
const CONTAINER = "w-full max-w-6xl mx-auto px-4 sm:px-8";
const TOPBAR_H = "min-h-[64px]";

// ================== SWIPE TABS HOOK ==================
// ✅ upgraded: returns dragX + isDragging for smooth swipe animations
function useSwipeTabs({
  enabled,
  onPrev,
  onNext,
  thresholdPx = 60,
  lockPx = 10,
  restraintPx = 40,
  tapSlopPx = 8,         // движение, которое всё ещё считается "тапом"
  cancelClickDxPx = 14,  // если сдвиг больше — клики гасим
}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const axisLock = useRef(null); // null | "x" | "y"
  const latestDx = useRef(0);

  const didSwipeRef = useRef(false);
  const rafRef = useRef(0);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const shouldIgnoreTarget = (target) => {
    // ВАЖНО: НЕ игнорим [data-no-swipe] — иначе кнопки снова станут "не-свайпабельны"
    try {
      return !!target?.closest?.('input, textarea, select, [role="slider"], input[type="range"]');
    } catch {
      return false;
    }
  };

  const stopTracking = useCallback(() => {
    tracking.current = false;
    axisLock.current = null;
    latestDx.current = 0;
    didSwipeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setDragX(0);
    setIsDragging(false);
  }, []);

  const setDragXRaf = useCallback((x) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setDragX(x);
    });
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (!enabled) return;
      if (e.pointerType !== "touch") return;
      if (shouldIgnoreTarget(e.target)) return;

      // захватываем pointer, чтобы не "залипало", если палец уехал за пределы <main>
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
      } catch {}

      startX.current = e.clientX;
      startY.current = e.clientY;
      latestDx.current = 0;

      tracking.current = true;
      axisLock.current = null;
      didSwipeRef.current = false;

      setDragX(0);
      setIsDragging(true);
    },
    [enabled]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!enabled || !tracking.current) return;
      if (e.pointerType !== "touch") return;

      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      if (!axisLock.current) {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        if (adx >= lockPx || ady >= lockPx) axisLock.current = adx > ady ? "x" : "y";
      }

      if (axisLock.current === "y") {
        // вертикальный скролл — отпускаем свайп
        setIsDragging(false);
        setDragXRaf(0);
        tracking.current = false;
        return;
      }

      if (axisLock.current === "x" && Math.abs(dy) > restraintPx && Math.abs(dy) > Math.abs(dx)) {
        // похоже на вертикаль — отпускаем
        setIsDragging(false);
        setDragXRaf(0);
        tracking.current = false;
        return;
      }

      // горизонтальный свайп
      latestDx.current = dx;

      // если сдвиг заметный — считаем это свайпом и будем гасить клики
      if (Math.abs(dx) > cancelClickDxPx) didSwipeRef.current = true;

      // “резинка”
      const damp = 0.85;
      setDragXRaf(dx * damp);

      // не даём браузеру устраивать свои жесты (особенно на iOS)
      if (axisLock.current === "x") {
        e.preventDefault?.();
      }
    },
    [enabled, lockPx, restraintPx, cancelClickDxPx, setDragXRaf]
  );

  const onPointerUp = useCallback(
    (e) => {
      if (!enabled) {
        stopTracking();
        return;
      }
      if (e.pointerType !== "touch") return;

      // ✅ CANCEL pending RAF so it can't apply stale drag after release
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      if (!tracking.current) {
        setIsDragging(false);
        setDragX(0);
        return;
      }

      tracking.current = false;
      setIsDragging(false);

      const dx = latestDx.current;
      const dy = e.clientY - startY.current;

      if (axisLock.current === "y" && Math.abs(dy) > restraintPx) {
        setDragX(0);
        axisLock.current = null;
        return;
      }

      if (dx > thresholdPx) onPrev?.();
      else if (dx < -thresholdPx) onNext?.();

      // ✅ snap back, guaranteed final state
      setDragX(0);
      axisLock.current = null;
    },
    [enabled, onPrev, onNext, thresholdPx, restraintPx, stopTracking]
  );

  const onPointerCancel = useCallback(() => {
    stopTracking();
  }, [stopTracking]);

  // 🔥 КЛЮЧЕВОЕ: гасим клики по кнопкам/ссылкам, если человек реально свайпнул
  const onClickCapture = useCallback((e) => {
    if (!didSwipeRef.current) return;

    // если это был свайп — запрещаем "нажатие" на play/download и т.п.
    e.preventDefault?.();
    e.stopPropagation?.();

    // сбросим флаг чуть позже, чтобы не поймать следующий клик
    setTimeout(() => {
      didSwipeRef.current = false;
    }, 0);
  }, []);

  return {
    // pointer handlers
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,

    // click-cancel
    onClickCapture,

    // ui state
    dragX,
    isDragging,
  };
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
      "leo",
      "tolstoy",
      "short stories",
      "paper book",
      "paperback",
      "book",
      "audio",
      "bilingual",
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
      "anton",
      "chekhov",
      "short stories",
      "paper book",
      "paperback",
      "book",
      "audio",
      "bilingual",
      "russian",
    ],
  },
];

const AUDIO_ROUTE_MAP = {
  tolstoy: "tolstoy-short-stories",
  // chekhov: "chekhov-short-stories",
  // добавить новое
};

const AUDIO_BOOKS = [
  {
    id: "tolstoy-short-stories",
    slug: "tolstoy",
    title: "Russian Short Stories",
    cover: "/Audio_External_Leo.webp",
    author: "by Leo Tolstoy",
    comingSoon: false,

    // ✅ ZIP archive for "Download all"
    zipSrc: "/audio/Russian_Short_Stories_by_Leo_Tolstoy.zip",
    
    tracks: [
      { id: "kostochka", title: "Косточка (The Pit)", src: "/audio/1_The_Pit.mp3" },
      { id: "kotenok", title: "Котёнок (The Kitten)", src: "/audio/2_The_Kitten.mp3" },
      { id: "lebedy", title: "Лебеди (The Swans)", src: "/audio/3_The_Swans.mp3" },
      { id: "bears", title: "Три медведя (The Three Bears)", src: "/audio/4_The_Three_Bears.mp3" },
      { id: "shark", title: "Акула (The Shark)", src: "/audio/5_The_Shark.mp3" },
      { id: "jump", title: "Прыжок (The Jump)", src: "/audio/6_The_Jump.mp3" },
    ],
  },
  {
    id: "chekhov-short-stories",
    slug: "chekhov",
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
    try_another: "Try another search query",
    buy_amazon: "Buy on Amazon",
    buy_etsy: "Buy on Etsy",
    buy_generic: "Buy",

    audio_choose: "Choose an audiobook to listen to or download",
    audio_empty: "No audiobooks available yet.",
    back: "Back",
    download_all: "Download all",
    listen: "Listen",
    pause: "Pause",
    download: "Download",
    coming_soon: "coming soon",

    theme_light: "Light",
    theme_dark: "Dark",
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
    try_another: "Попробуйте другой запрос",
    buy_amazon: "Купить на Amazon",
    buy_etsy: "Купить на Etsy",
    buy_generic: "Купить",

    audio_choose: "Выберите аудиокнигу для прослушивания или загрузки",
    audio_empty: "Пока нет доступных аудиокниг.",
    back: "Назад",
    download_all: "Скачать всё",
    listen: "Слушать",
    pause: "Пауза",
    download: "Скачать",
    coming_soon: "скоро",

    theme_light: "Светлая",
    theme_dark: "Тёмная",
  },
};

// ================== THEME ==================
function getSystemTheme() {
  try {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function detectTheme() {
  try {
    const saved = localStorage.getItem("theme_user");
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return getSystemTheme();
}

function applyThemeToHtml(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = theme;
}

// ================== UI HELPERS ==================
function NavPill({ active, onClick, children, size = "md", className = "", ...props }) {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";

  return (
    <button
      onClick={onClick}
      type="button"
      {...props}
      className={[
        padding,
        "whitespace-nowrap rounded-full border transition-all duration-200 select-none",
        "active:scale-[0.97]",
        "[-webkit-tap-highlight-color:transparent]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950",
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-md font-semibold"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/70 dark:hover:border-slate-600",
        className,
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
    "dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950 " +
    "[-webkit-tap-highlight-color:transparent]";

  const enabledCls =
    "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:scale-[0.98] " +
    "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/70";
  const disabledCls =
    "border-slate-200 bg-white text-slate-400 opacity-70 cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500";

  if (disabled || !href) {
    return (
      <span className={[base, disabledCls, className].join(" ")} title={title} aria-label={ariaLabel}>
        {children}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={[base, enabledCls, className].join(" ")} title={title} aria-label={ariaLabel}>
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
        "rounded-xl border",
        "px-3 py-2 text-sm font-medium",
        "transition",
        "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/70",
        "active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950",
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
    <Card className={["border border-slate-200 dark:border-slate-800", "bg-white dark:bg-slate-950", "rounded-2xl", className].join(" ")}>
      <CardContent className="p-6">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function BookAuthorLine({ author, comingSoon, comingSoonText }) {
  if (!author && !comingSoon) return null;

  return (
    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
      {author}
      {comingSoon ? <span className="font-semibold text-slate-700 dark:text-slate-200"> {" "}({comingSoonText})</span> : null}
    </p>
  );
}

function AudioBookTile({ book, onOpen, comingSoonText }) {
  const isDisabled = !!book.disabled;

  return (
    <button
      onClick={() => {
        if (isDisabled) return;
        onOpen();
      }}
      className="w-full max-w-sm text-left"
      type="button"
      disabled={isDisabled}
    >
      <Card
        className={[
          "p-4 border transition rounded-2xl",
          "bg-white border-slate-200",
          "dark:bg-slate-950 dark:border-slate-800",
          isDisabled ? "opacity-70 cursor-not-allowed" : "hover:shadow dark:hover:shadow-none",
        ].join(" ")}
      >
        <div className="flex gap-4 items-center">
          <img src={book.cover} alt={book.title} className="w-16 h-16 rounded-xl object-cover flex-none" decoding="async" loading="eager" sizes="64px" />
          <div className="min-w-0">
            <p className="font-semibold truncate text-slate-900 dark:text-slate-100">{book.title}</p>
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

// ✅ (1) compact TrackRow + bigger title text WITHOUT changing block size
// ✅ compactness restored (smaller paddings/buttons/icons) BUT your title size stays!
function TrackRow({ track, isActive, isPlaying, onToggle, onSeek, t, currentTime, duration }) {
  const activeAndPlaying = isActive && isPlaying;
  const showScrubber = isActive;

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;

  return (
    <Card
      className={[
        "border transition rounded-2xl",
        "bg-white border-slate-200",
        "dark:bg-slate-950 dark:border-slate-800",
        isActive ? "shadow-sm dark:shadow-none" : "",
      ].join(" ")}
    >
      {/* ✅ НИКАКОГО CardContent -> никаких сюрпризов */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* LEFT: text, строго по центру по вертикали */}
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate text-[15px] sm:text-[15.5px] leading-none text-slate-900 dark:text-slate-100">
              {track.title}
            </p>

            {showScrubber && (
              <p className="mt-1 text-[10.5px] leading-none text-slate-500 dark:text-slate-400 tabular-nums">
                {formatTime(safeTime)} / {formatTime(safeDuration)}
              </p>
            )}
          </div>

          {/* RIGHT: buttons */}
          <div className="flex items-center gap-5 flex-none">
            <button
              type="button"
              onClick={() => onToggle(track)}
              className={[
                "h-12 w-12 inline-flex items-center justify-center flex-none",
                "rounded-2xl border transition",
                "border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.97]",
                "dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950",
                "[-webkit-tap-highlight-color:transparent]",
              ].join(" ")}
              aria-label={activeAndPlaying ? t("pause") : t("listen")}
              title={activeAndPlaying ? t("pause") : t("listen")}
              aria-pressed={activeAndPlaying}
              data-no-swipe="true"
            >
              {activeAndPlaying ? <Pause className="w-6 h-6" strokeWidth={1.8} /> : <Play className="w-6 h-6 translate-x-[1px]" strokeWidth={1.8} />}
            </button>

            {track.src && track.src !== "#" && (
              <a href={track.src} download className="inline-flex" aria-label={`${t("download")}: ${track.title}`}>
                <span
                  className={[
                    "h-12 w-12 inline-flex items-center justify-center flex-none",
                    "rounded-2xl border transition",
                    "border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.97]",
                    "dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    "dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950",
                    "[-webkit-tap-highlight-color:transparent]",
                  ].join(" ")}
                  title={t("download")}
                  data-no-swipe="true"
                >
                  <Download className="w-6 h-6" strokeWidth={1.8} />
                </span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Scrubber отдельно снизу */}
      {showScrubber && (
        <div className="px-3 pb-2">
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
    </Card>
  );
}

// ================== ProductCard ==================
function ProductCard({ item, t, lang }) {
  const isDisabled = !!item.disabled;
  const canBuy = !isDisabled && !!item.externalUrl;

  return (
    <Card
      className={[
        "overflow-hidden border flex flex-col rounded-2xl",
        "bg-white border-slate-200",
        "dark:bg-slate-950 dark:border-slate-800",
        isDisabled ? "opacity-80" : "",
      ].join(" ")}
    >
      {/* ✅ IMAGE PANEL (без CardHeader, чтобы убрать скрытые padding’и) */}
      <div className="relative p-[1px]">
        <div className="relative rounded-2xl overflow-hidden">
          {/* ✅ 4:3, занимает почти всю область */}
          <div className="w-full aspect-[4/3] bg-transparent dark:bg-slate-200/35">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover block"
              decoding="async"
              loading="eager"
              sizes="(max-width: 1024px) 90vw, 360px"
            />
          </div>

          {/* ✅ бейджи в углу КАРТИНКИ */}
          <div className="absolute top-[6px] left-[6px] flex flex-wrap gap-1.5">
            {item.badges?.map((b) => (
              <Badge
                key={b}
                className={[
                  "px-2.5 py-1 text-[11px] font-medium leading-none rounded-full",
                  "bg-slate-100/95 text-slate-700 border border-slate-200",
                  "dark:bg-slate-100/95 dark:text-slate-700 dark:border-slate-200",
                ].join(" ")}
              >
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <CardContent className="p-4 pt-3 flex flex-col flex-grow dark:bg-slate-200/10">
        <div className="space-y-1">
          <CardTitle className="text-base leading-snug font-semibold break-words text-slate-900 dark:text-slate-100">
            {item.title}
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-300">{item.kind}</p>
        </div>

        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-snug">{item.description}</p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <span className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {Number.isFinite(item.price) ? currencyUSD(item.price) : "—"}
          </span>

          {isDisabled ? (
            <span className="inline-flex">
              <Button
                variant="outline"
                type="button"
                disabled
                className="flex items-center gap-2 opacity-70 cursor-not-allowed dark:bg-slate-900 dark:border-slate-700 rounded-full px-5 py-2.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="whitespace-nowrap">{lang === "ru" ? "Скоро в продаже" : "Coming soon"}</span>
              </Button>
            </span>
          ) : (
            <LinkButton
              href={item.externalUrl}
              disabled={!canBuy}
              aria-label={productBuyLabel(item, t)}
              className="rounded-full px-5 py-2.5"
            >
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

// ================== EASTER EGG MESSAGES ==================
const EASTER = {
  FIRST: "Привет! 👋",

  // thresholds
  AFTER_5: "Не нажимай больше! 😑",
  AFTER_10: "Тебе что, нечего делать? 🗿",
  AFTER_12: "Зачем я всегда ставлю точки над «ё»? 😵‍💫",
  AFTER_15: "Сколько можно жать! 🤬",

  SOBACHYE: 'Прочитай «Собачье сердце» Булгакова.',
  SOBACHYE_FOLLOW: "Это крутая книга! 🙂",

  TOLSTOY: "Кстати, почитай Толстого.",
  TOLSTOY_FOLLOW: "Ни на что не намекаю, но ты можешь купить здесь книгу. 😏",

  HOW_LONG: "Знаешь, как долго делать такой сайт?",
  HOW_LONG_FOLLOW: "Несмотря на это, он всё равно лагает. 😅",

  ARBAT: "Ну что, зайдём в книжный на Арбате? 📚",
  WALK: "Я буду идти вдоль поребрика, пока не пройду 50к шагов. 🚶‍♂️‍➡️",

  YOU_LEARN: "Ты учишь русский язык? Круто. 😎",
  NEVER_GIVE_UP: "Никогда не сдавайся! 💪",
  YOU_ARE_GREAT: "Ты молодец! 👍",
  IM_DONE: "Всё! Я больше не отвечаю. 🤐",
  HARD_TO_PRESS: "Трудно жать кнопку? Я бы уже устал... 😵",

  DOSTO: "Почему у Достоевского всегда всё так мрачно? 🌚",
  READ_BOOKS: "Не теряй время – читай книги! 📖",
  CHEKHOV: "У Чехова лучшие рассказы в мире! 😄",
  DEAD_SOULS: "Где второй том «Мёртвых душ»? 🤔",
  GORKY: "Где Нобелевская премия Горького? 🥇",
  LERMONTOV: '«…И ты, им преданный народ…» — Лермонтов',
  PISTOL: "Дайте Пушкину другой пистолет! 🔫",
  PHONE: "Лучше читать, чем залипать в телефоне. 📱",
  ENGLAND: "О, вы из Англии? 🎩",
  AMAZING: "Этот web сайт просто amazing! 💫",
  KAZBEK: "Главное не потерять коробку сижек «Казбек». 🚬",
  OIL: "Кто-то уже разлил масло... Главное, чтобы оно не вспыхнуло... 🔥",

  AI_SITE: "Я бы не сделал этот сайт без ИИ. 🤖",
  AI_WORLD: "ИИ может уничтожить мир. Берегись! 💀",
};

function pickRandom(arr) {
  if (!arr.length) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

// ================== TABS SLIDER (ANIMATED) ==================
// ✅ Makes the content "slide" on mobile with smooth transition.
// Keeps desktop behavior unchanged.
function TabsSlider({ isMobile, activeIndex, dragX, isDragging, children }) {
  const count = React.Children.count(children);
  const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(count - 1, 0));

  // ✅ 1. ref на контейнер
  const hostRef = React.useRef(null);
  const [hostW, setHostW] = React.useState(1);

  // ✅ 2. измеряем РЕАЛЬНУЮ ширину слайдера
  React.useEffect(() => {
    if (!isMobile) return;
    const el = hostRef.current;
    if (!el) return;

    const update = () => setHostW(el.clientWidth || 1);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [isMobile]);

  // ❗ ВАЖНО: проценты считаем от hostW, а не от window
  const dragPct = isMobile ? (dragX / hostW) * 100 : 0;

  const basePct = -safeIndex * 100;
  const translatePct = basePct + (isMobile ? dragPct : 0);

  return (
    <div ref={hostRef} className="relative w-full overflow-hidden">
      <div
        className={["flex w-full", isMobile ? "" : "block"].join(" ")}
        style={
          isMobile
            ? {
                transform: `translate3d(${translatePct}%, 0, 0)`,
                transition: isDragging ? "none" : "transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                willChange: "transform",
              }
            : undefined
        }
      >
        {React.Children.map(children, (child, i) => (
          <div
            key={i}
            className={isMobile ? "w-full flex-none" : i === safeIndex ? "block" : "hidden"}
            aria-hidden={isMobile ? false : i !== safeIndex}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// ================== APP ==================
export default function App() {
  // ---- language ----
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

  const [lang, setLang] = useState(() => detectLanguage());
  const t = (key) => I18N[lang]?.[key] ?? I18N.en[key] ?? key;

  const switchLang = (next) => {
    setLang(next);
    try {
      localStorage.setItem("lang", next);
    } catch {}
  };

  // ---- theme ----
  const [theme, setTheme] = useState(() => detectTheme());

  useEffect(() => {
    applyThemeToHtml(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      try {
        const saved = localStorage.getItem("theme_user");
        if (saved === "dark" || saved === "light") return;
      } catch {}
      setTheme(mq.matches ? "dark" : "light");
    };

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme_user", next);
      } catch {}
      return next;
    });
  };

  // ---- tabs ----
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

  useEffect(() => {
    document.title = lang === "ru" ? "Геннадий Богданов — русский язык" : "Genndy Bogdanov — Learn Russian";
  }, [lang]);

  // ---- prefetch ----
  const PREFETCH_AFTER_ABOUT = ["/Product_Leo.webp", "/Product_Chekhov.webp", "/Audio_External_Leo.webp", "/Audio_External_Chekhov.webp"];

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

  const hasPrefetchedRef = useRef(false);
  const prefetchAudiobooksOnce = useCallback(() => {
    if (hasPrefetchedRef.current) return;
    hasPrefetchedRef.current = true;
    preloadImages(PREFETCH_AFTER_ABOUT);
  }, []);

  // ---- store search ----
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

  // ---- audiobooks ----
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

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      try {
        audio.currentTime = 0;
      } catch {}
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
  // ✅ Always download a single ZIP instead of multiple mp3 clicks
  const zip = selectedBook?.zipSrc || "/audio/Russian_Short_Stories_by_Leo_Tolstoy.zip";

  const a = document.createElement("a");
  a.href = zip;

  // set filename for nicer download (works on most browsers)
  const name = zip.split("/").pop() || "audiobook.zip";
  a.setAttribute("download", name);

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

  // ---- mobile detection (for swipe + easter placement) ----
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

  const TAB_TO_PATH = {
    about: "/about",
    products: "/store",
    "free-audio": "/audio",
  };

  function pathToTab(pathname) {
    if (/^\/(about)?\/?$/i.test(pathname)) return "about";
    if (/^\/(store|products)\/?$/i.test(pathname)) return "products";
    if (/^\/audio(\/.*)?$/i.test(pathname)) return "free-audio";
    return "about";
  }

  function parseAudioSlug(pathname) {
    const m = pathname.match(/^\/audio(?:\/([^\/?#]+))?\/?$/i);
    return m ? (m[1] || "").toLowerCase() : null; // null => не audio
  }

  const findBookIdBySlug = useCallback((slug) => {
    if (!slug) return null;
    const found = AUDIO_BOOKS.find((b) => (b.slug || "").toLowerCase() === slug.toLowerCase() && !b.disabled);
    return found ? found.id : null;
  }, []);

  // ✅ MOVED UP: navigate must be defined BEFORE goPrevTab/goNextTab use it
  const navigate = useCallback((to) => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === to) return;
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const goPrevTab = useCallback(() => {
    const i = TABS_ORDER.indexOf(tab);
    if (i > 0) navigate(TAB_TO_PATH[TABS_ORDER[i - 1]]);
  }, [tab, navigate]);

  const goNextTab = useCallback(() => {
    const i = TABS_ORDER.indexOf(tab);
    if (i >= 0 && i < TABS_ORDER.length - 1) navigate(TAB_TO_PATH[TABS_ORDER[i + 1]]);
  }, [tab, navigate]);

  const swipeHandlers = useSwipeTabs({
    enabled: isMobile && !isPlaying,
    onPrev: goPrevTab,
    onNext: goNextTab,
    thresholdPx: 45,
    lockPx: 12,
    restraintPx: 40,
  });

  const showAbout = tab === "about";
  const showProducts = tab === "products";
  const showAudio = tab === "free-audio";

  // ✅ active index for animated slider
  const activeIndex = useMemo(() => TABS_ORDER.indexOf(tab), [tab]);

  // ================== EASTER EGG STATE ==================
  const [eggText, setEggText] = useState("");
  const [eggVisible, setEggVisible] = useState(false);

  // what has been shown (each message once)
  const shownSetRef = useRef(new Set());
  const shownCountRef = useRef(0);

  // sequence forcing: after some messages must come a specific next message
  const forcedNextRef = useRef(null);

  // constraints "after X other messages"
  const lastNeverGiveUpIndexRef = useRef(null); // index when NEVER_GIVE_UP was shown
  const lastYouAreGreatIndexRef = useRef(null); // index when YOU_ARE_GREAT was shown

  const hideEgg = useCallback(() => {
    setEggVisible(false);
  }, []);

  // auto-hide timer
  const eggTimerRef = useRef(null);
  useEffect(() => {
    if (!eggVisible) return;
    if (eggTimerRef.current) clearTimeout(eggTimerRef.current);

    eggTimerRef.current = setTimeout(() => {
      setEggVisible(false);
    }, 8000);

    return () => {
      if (eggTimerRef.current) clearTimeout(eggTimerRef.current);
    };
  }, [eggVisible, eggText]);

  // hide on tab change (buttons or swipe)
  useEffect(() => {
    if (eggVisible) setEggVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const TAB_FROM_PATH = (p) => {
      if (/^\/(about)?\/?$/i.test(p)) return "about";
      if (/^\/(store|products)\/?$/i.test(p)) return "products";
      if (/^\/audio(\/.*)?$/i.test(p)) return "free-audio";
      return "about";
    };

    const AUDIO_SLUG_FROM_PATH = (p) => {
      const m = p.match(/^\/audio(?:\/([^\/?#]+))?\/?$/i);
      return m ? (m[1] || "").toLowerCase() : null;
    };

    const applyRouteFromUrl = () => {
      const path = window.location.pathname || "/";

      const nextTab = TAB_FROM_PATH(path);
      const slug = AUDIO_SLUG_FROM_PATH(path);
      const bookId = slug ? findBookIdBySlug(slug) : null;

      setTab(nextTab);

      if (nextTab === "free-audio") {
        // /audio -> список книг (null)
        // /audio/tolstoy -> конкретная книга
        setAudioBookId(bookId);
      }
    };

    applyRouteFromUrl();
    window.addEventListener("popstate", applyRouteFromUrl);
    return () => window.removeEventListener("popstate", applyRouteFromUrl);
  }, [findBookIdBySlug]);

  const showEggMessage = useCallback(
    (text) => {
      // animate replace if already visible
      if (eggVisible) {
        setEggVisible(false);
        setTimeout(() => {
          setEggText(text);
          setEggVisible(true);
        }, 120);
      } else {
        setEggText(text);
        setEggVisible(true);
      }
    },
    [eggVisible]
  );

  const pickNextEasterMessage = useCallback(() => {
    const shown = shownSetRef.current;
    const count = shownCountRef.current;

    // forced next always wins, but still "once"
    if (forcedNextRef.current) {
      const forced = forcedNextRef.current;
      forcedNextRef.current = null;

      if (!shown.has(forced)) return forced;
      // if somehow already shown, fall through to normal picking
    }

    // very first message is fixed
    if (count === 0 && !shown.has(EASTER.FIRST)) return EASTER.FIRST;

    // build pool of eligible messages
    const pool = [];

    const addIfEligible = (msg, cond = true) => {
      if (!cond) return;
      if (!msg) return;
      if (shown.has(msg)) return;
      pool.push(msg);
    };

    // thresholds
    addIfEligible(EASTER.AFTER_5, count >= 5);
    addIfEligible(EASTER.AFTER_10, count >= 10);
    addIfEligible(EASTER.AFTER_12, count >= 12);
    addIfEligible(EASTER.AFTER_15, count >= 15);

    // sequenced starters
    addIfEligible(EASTER.SOBACHYE);
    addIfEligible(EASTER.TOLSTOY);
    addIfEligible(EASTER.HOW_LONG);

    // other messages + conditions
    addIfEligible(EASTER.DOSTO);
    addIfEligible(EASTER.READ_BOOKS);
    addIfEligible(EASTER.CHEKHOV);
    addIfEligible(EASTER.DEAD_SOULS);
    addIfEligible(EASTER.GORKY);
    addIfEligible(EASTER.LERMONTOV, count >= 10);
    addIfEligible(EASTER.PISTOL, count >= 8);
    addIfEligible(EASTER.PHONE, count >= 5);
    addIfEligible(EASTER.ENGLAND, count >= 5);
    addIfEligible(EASTER.AMAZING, count >= 8);
    addIfEligible(EASTER.KAZBEK, count >= 10);
    addIfEligible(EASTER.OIL, count >= 14);

    addIfEligible(EASTER.ARBAT, count >= 12);
    addIfEligible(EASTER.WALK, count >= 14);

    addIfEligible(EASTER.YOU_LEARN);
    addIfEligible(EASTER.NEVER_GIVE_UP);

    // "Ты молодец!" — only if NEVER_GIVE_UP was shown and at least 3 other messages passed
    const neverIdx = lastNeverGiveUpIndexRef.current;
    addIfEligible(EASTER.YOU_ARE_GREAT, neverIdx != null && count - neverIdx >= 4);

    // "Всё! Я больше не отвечаю." — only if YOU_ARE_GREAT was shown and at least 3 other messages passed
    const greatIdx = lastYouAreGreatIndexRef.current;
    addIfEligible(EASTER.IM_DONE, greatIdx != null && count - greatIdx >= 4);

    addIfEligible(EASTER.HARD_TO_PRESS, count >= 15);

    addIfEligible(EASTER.AI_SITE, count >= 10);
    addIfEligible(EASTER.AI_WORLD, count >= 14);

    const picked = pickRandom(pool);
    return picked || null;
  }, []);

  const handleLogoClick = useCallback(() => {
    const next = pickNextEasterMessage();
    if (!next) return;

    // mark shown + bump count
    shownSetRef.current.add(next);

    // update indices for "after 3 other" rules
    const nextIndex = shownCountRef.current;
    if (next === EASTER.NEVER_GIVE_UP) lastNeverGiveUpIndexRef.current = nextIndex;
    if (next === EASTER.YOU_ARE_GREAT) lastYouAreGreatIndexRef.current = nextIndex;

    // set forced follow-ups
    if (next === EASTER.SOBACHYE) forcedNextRef.current = EASTER.SOBACHYE_FOLLOW;
    if (next === EASTER.TOLSTOY) forcedNextRef.current = EASTER.TOLSTOY_FOLLOW;
    if (next === EASTER.HOW_LONG) forcedNextRef.current = EASTER.HOW_LONG_FOLLOW;

    shownCountRef.current = nextIndex + 1;

    showEggMessage(next);
  }, [pickNextEasterMessage, showEggMessage]);

  // ================== EASTER TOAST UI ==================
  const Toast = ({ variant }) => {
    const isDesktop = variant === "desktop";

    const base =
      "pointer-events-auto select-none " +
      "rounded-2xl border shadow-lg " +
      "bg-white/95 text-slate-900 border-slate-200 " +
      "dark:bg-slate-900/95 dark:text-slate-100 dark:border-slate-700 " +
      "backdrop-blur " +
      "transition-all duration-200 ease-out";

    const anim = eggVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.98]";

    const desktopCls =
      "hidden md:inline-flex items-center " +
      "whitespace-nowrap " +
      "px-4 py-2 text-sm font-semibold " +
      "max-w-[520px]";

    // ✅ CHANGE: mobile toast is auto-sized by content (w-fit) + centered text
    const mobileCls =
      "md:hidden " +
      "px-4 py-3 text-sm font-semibold " +
      "whitespace-normal leading-snug " +
      "text-center w-fit max-w-[90vw]";

    return (
      <div
        role="status"
        aria-live="polite"
        onClick={hideEgg}
        className={[
          base,
          anim,
          isDesktop ? desktopCls : mobileCls,
          eggVisible ? "" : "pointer-events-none",
        ].join(" ")}
      >
        <span className={isDesktop ? "truncate" : ""}>{eggText}</span>
      </div>
    );
  };

  // ✅ label/icon should show the TARGET theme (opposite of current)
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-lg px-3 py-2 shadow"
      >
        Skip to content
      </a>

      <audio ref={audioRef} preload="none" />

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/75 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="w-full">
          <div className={`${CONTAINER} py-3 flex items-center justify-between gap-4 ${TOPBAR_H}`}>
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleLogoClick}
                className="inline-flex rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950"
                aria-label="Logo easter egg"
                title="🙂"
              >
                <img
                  src="/logo.webp"
                  alt="Genndy Bogdanov"
                  className="w-9 h-9 rounded-xl object-cover transition-transform duration-200 ease-out hover:scale-[1.04] hover:rotate-1"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="36px"
                />
              </button>

              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">{t("name")}</p>
                <p className="text-xs opacity-70 truncate">{t("tagline")}</p>
              </div>
            </div>

            {/* Desktop toast: BETWEEN name and language buttons */}
            <div className="flex-1 hidden md:flex justify-center min-w-0">
              {eggText ? <Toast variant="desktop" /> : null}
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

        <nav className="border-t border-slate-200 dark:border-slate-800">
          <div className="w-full">
            <div className={`${CONTAINER} py-3`}>
              <div className="flex w-full items-center gap-2 sm:gap-3 overflow-x-hidden sm:overflow-x-auto no-scrollbar">
                <NavPill active={showAbout} onClick={() => navigate("/about")} className="flex-1 text-center sm:flex-none">
                  {t("nav_about")}
                </NavPill>

                <NavPill active={showProducts} onClick={() => navigate("/store")} className="flex-1 text-center sm:flex-none">
                  {t("nav_products")}
                </NavPill>

                <NavPill
                  active={showAudio}
                  onMouseEnter={prefetchAudiobooksOnce}
                  onFocus={prefetchAudiobooksOnce}
                  onClick={() => navigate("/audio")}
                  className="flex-1 text-center sm:flex-none"
                >
                  {t("nav_audio")}
                </NavPill>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ✅ Mobile toast: moved DOWN to center of screen, auto-sized, centered text */}
      {eggText ? (
        <div className="fixed md:hidden inset-0 z-[60] pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto translate-y-16">
            <Toast variant="mobile" />
          </div>
        </div>
      ) : null}

      <main
        id="content"
        className={`flex-1 ${CONTAINER} py-4 sm:py-8`}
        onPointerDown={swipeHandlers.onPointerDown}
        onPointerMove={swipeHandlers.onPointerMove}
        onPointerUp={swipeHandlers.onPointerUp}
        onPointerCancel={swipeHandlers.onPointerCancel}
        onClickCapture={swipeHandlers.onClickCapture}
        // Важно: разрешаем вертикальный скролл, но НЕ даём браузеру "жрать" горизонтальные жесты
        style={{ touchAction: isMobile ? "pan-y" : "auto" }}
      >
        {/* ✅ Animated tab content slider (mobile) */}
        <TabsSlider
          isMobile={isMobile}
          activeIndex={activeIndex}
          dragX={swipeHandlers.dragX}
          isDragging={swipeHandlers.isDragging}
        >
          {/* ABOUT */}
          <section hidden={!showAbout} aria-hidden={!showAbout}>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-start">
              <div className="md:col-span-2 space-y-4">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight break-words">{t("about_title")}</h1>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">{t("about_p1")}</p>
              </div>

              <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl">
                <CardTitle className="mb-2">{t("contacts")}</CardTitle>
                <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                  <p>E-mail: genndybogdanov@gmail.com</p>
                  <p>
                    <a
                      className="underline hover:text-slate-900 dark:hover:text-white break-all"
                      href="https://substack.com/@gbogdanov"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Substack
                    </a>
                  </p>
                </div>
              </Card>

              <Card className="md:col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl">
                <div className="p-5">
                  <div className="flex items-start gap-5">
                    <div className="flex-none w-28 sm:w-32 md:w-36 aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow">
                      <img
                        src="/Portrait_1.webp"
                        alt="Portrait"
                        className="w-full h-full object-contain"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                      />
                    </div>

                    <div className="min-w-0 flex-1 md:flex md:flex-col md:items-center md:text-center">
                      <h3 className="text-lg sm:text-xl font-semibold leading-snug">{t("learn_with_me")}</h3>

                      <div className="mt-3 flex flex-col gap-2 w-full max-w-[260px]">
                        <ExternalLinkChip href="https://preply.com/en/?pref=ODkzOTkyOQ==&id=1759522486.457389&ep=w1">
                          Preply
                        </ExternalLinkChip>
                        <ExternalLinkChip href="https://www.italki.com/affshare?ref=af11775706">italki</ExternalLinkChip>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* PRODUCTS */}
          <section hidden={!showProducts} aria-hidden={!showProducts}>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    aria-label={t("products_search")}
                    placeholder={t("products_search")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={[
                      "w-full pl-9 pr-10 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100",
                      // ✅ remove ALL focus outline/ring (light + dark)
                      "outline-none focus:outline-none focus-visible:outline-none",
                      "ring-0 focus:ring-0 focus-visible:ring-0",
                      "ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0",
                      "!outline-none !ring-0 !ring-offset-0",
                      "focus:!outline-none focus-visible:!outline-none",
                      "focus:!ring-0 focus-visible:!ring-0",
                      "focus:!ring-offset-0 focus-visible:!ring-offset-0",
                      "focus:shadow-none focus-visible:shadow-none !shadow-none",
                    ].join(" ")}
                  />
                  {!!query && (
                    <button
                      type="button"
                      onClick={clearQuery}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label={t("search_clear")}
                      title={t("search_clear")}
                      data-no-swipe="true"
                    >
                      <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
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

          {/* AUDIOBOOKS */}
          <section hidden={!showAudio} aria-hidden={!showAudio}>
            <div className="space-y-4 sm:space-y-6">
              {!audioBookId && (
                <>
                  <p className="text-slate-700 dark:text-slate-300">{t("audio_choose")}</p>

                  {AUDIO_BOOKS.length === 0 ? (
                    <EmptyState title={t("audio_empty")} />
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {AUDIO_BOOKS.map((book) => (
                        <AudioBookTile
                          key={book.id}
                          book={book}
                          onOpen={() => navigate(`/audio/${book.slug}`)}
                          comingSoonText={t("coming_soon")}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {audioBookId && selectedBook && (
                <>
                  <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
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
                          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-words">{selectedBook.title}</h1>

                          <p className="text-slate-600 dark:text-slate-400 break-words">
                            {selectedBook.author}
                            {selectedBook.comingSoon ? (
                              <span className="font-semibold text-slate-700 dark:text-slate-200"> {" "}({t("coming_soon")})</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="order-1 md:order-2 flex gap-3 w-full md:w-auto">
  {/* BACK */}
  <Button
    onClick={() => navigate("/audio")}
    type="button"
    data-no-swipe="true"
    className={[
      "w-1/2 md:w-auto whitespace-nowrap rounded-full",
      "border border-slate-200 bg-white text-slate-800",
      "hover:bg-slate-50 active:bg-slate-100",
      "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      "dark:hover:bg-slate-800/70 dark:active:bg-slate-800",

      // одинаковая анимация
      "transition-all duration-150 ease-out",
      "active:scale-[0.97] active:shadow-[0_0_0_4px_rgba(59,130,246,0.25)]",

      // полностью убираем ring / outline / focus-обводки
      "outline-none focus:outline-none focus-visible:outline-none",
      "ring-0 focus:ring-0 focus-visible:ring-0",
      "ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0",
      "shadow-none focus:shadow-none focus-visible:shadow-none",

      // iOS tap highlight
      "[-webkit-tap-highlight-color:transparent]",
    ].join(" ")}
  >
    ← {t("back")}
  </Button>

  {/* DOWNLOAD ALL */}
  <Button
    onClick={downloadAllAudio}
    type="button"
    data-no-swipe="true"
    disabled={!selectedBook.tracks?.length}
    title={!selectedBook.tracks?.length ? t("audio_empty") : t("download_all")}
    className={[
      "w-1/2 md:w-auto whitespace-nowrap rounded-full",
      "border border-slate-200 bg-white text-slate-800",
      "hover:bg-slate-50 active:bg-slate-100",
      "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      "dark:hover:bg-slate-800/70 dark:active:bg-slate-800",

      // одинаковая анимация
      "transition-all duration-150 ease-out",
      "active:scale-[0.97] active:shadow-[0_0_0_4px_rgba(59,130,246,0.25)]",

      // полностью убираем ring / outline / focus-обводки
      "outline-none focus:outline-none focus-visible:outline-none",
      "ring-0 focus:ring-0 focus-visible:ring-0",
      "ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0",
      "shadow-none focus:shadow-none focus-visible:shadow-none",

      // iOS tap highlight
      "[-webkit-tap-highlight-color:transparent]",

      // чтобы disabled выглядел аккуратно и одинаково везде
      "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:shadow-none",
      "flex items-center justify-center gap-2",
    ].join(" ")}
  >
    <Download className="w-4 h-4" />
    {t("download_all")}
  </Button>
</div>
</div>

                  <div className="grid md:grid-cols-3 gap-5 sm:gap-6 items-start">
                    <img
                      src={selectedBook.cover}
                      alt={selectedBook.title}
                      className="hidden md:block w-full aspect-square object-cover rounded-2xl shadow md:col-span-1"
                      decoding="async"
                      loading="eager"
                      sizes="(max-width: 1024px) 40vw, 360px"
                    />

                    <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
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
        </TabsSlider>
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className={`${CONTAINER} py-5`}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-500">© {new Date().getFullYear()} Genndy Bogdanov</div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={toggleTheme}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:scale-[0.98]",
                  "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/70",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  "dark:focus-visible:ring-blue-500/40 dark:focus-visible:ring-offset-slate-950",
                  "[-webkit-tap-highlight-color:transparent]",
                ].join(" ")}
                aria-label={nextTheme === "dark" ? t("theme_dark") : t("theme_light")}
                title={nextTheme === "dark" ? t("theme_dark") : t("theme_light")}
              >
                {/* ✅ show the icon of the TARGET theme (opposite of current) */}
                {nextTheme === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{nextTheme === "dark" ? t("theme_dark") : t("theme_light")}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      <Analytics />
    </div>
  );
}
