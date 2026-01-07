import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card.jsx";
import { Button } from "./components/ui/Button.jsx";
import { Input } from "./components/ui/Input.jsx";
import { Badge } from "./components/ui/Badge.jsx";
import { ExternalLink, Download, Play, Pause, X, Search } from "lucide-react";

// ================== LAYOUT ==================
/**
 * Variant B: column is NOT centered; it is slightly shifted left on desktop.
 * - no mx-auto
 * - adaptive left margin
 */
const CONTAINER = "w-full max-w-6xl px-4 sm:ml-6 lg:ml-10";
const TOPBAR_H = "min-h-[64px]";

// ================== DATA ==================
const PRODUCTS = [
  {
    id: "prod-ru-book-1",
    title: "Russian Short Stories by Leo Tolstoy",
    kind: "A1-B1 Level",
    price: 12.99,
    image: "/Product_Leo.png", // ✅ public/Product_Leo.png
    externalUrl: "https://amazon.example/your-book",
    marketplace: "amazon",
    badges: ["RU-EN", "Paper Book", "Audio"],
    description: "Word-by-word translation, stress marks, grammar explanations, exercises, audio included.",
  },
];

const AUDIO_BOOKS = [
  {
    id: "tolstoy-short-stories",
    title: "Russian Short Stories",
    cover: "/Audio_External_Leo.png", // ✅ public/Audio_External_Leo.png
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

// ================== I18N ==================
const I18N = {
  en: {
    name: "Genndy Bogdanov",
    tagline: "",
    nav_about: "About",
    nav_products: "Store",
    nav_audio: "Audiobooks",

    about_title: "Hi! I’m Genndy — a Russian language teacher and the author of learning materials",
    about_p1: "I help English speakers read Russian faster and with confidence. 1000+ lessons taught, high rating.",
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
  },

  ru: {
    name: "Genndy Bogdanov",
    tagline: "",
    nav_about: "Обо мне",
    nav_products: "Магазин",
    nav_audio: "Аудиокниги",

    about_title: "Всем привет! Я — Геннадий. Преподаватель русского языка и автор учебных материалов.",
    about_p1: "Я помогаю англоговорящим быстрее и увереннее читать по-русски. 1000+ проведённых уроков, высокий рейтинг.",
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
  },
};

// ================== UI HELPERS ==================
function NavPill({ active, onClick, children, size = "md" }) {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";

  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        padding,
        "rounded-full border transition-all duration-200 select-none",
        "active:scale-[0.97]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-md font-semibold"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
      ].join(" ")}
    >
      {children}
    </button>
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

function EmptyState({ title, subtitle }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-6">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function AudioBookTile({ book, onOpen }) {
  return (
    <button
  onClick={() => onOpen(book.id)}
  className="w-full max-w-sm text-left"
  type="button"
>
      <Card className="p-4 border border-slate-200 hover:shadow transition">
        <div className="flex gap-4 items-center">
          <img src={book.cover} alt={book.title} className="w-16 h-16 rounded-xl object-cover flex-none" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{book.title}</p>
            {book.description && <p className="text-sm text-slate-600 line-clamp-2">{book.description}</p>}
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

function TrackRow({
  track,
  isActive,
  isPlaying,
  onToggle,
  onSeek,
  t,
  currentTime,
  duration,
}) {
  const activeAndPlaying = isActive && isPlaying;
  const showScrubber = isActive; // можно сделать isActive && duration>0

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;

  return (
    <Card className={["border border-slate-200 transition", isActive ? "shadow-sm" : ""].join(" ")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{track.title}</p>

            {/* маленькая строка времени (без Listen/Pause текста) */}
            {showScrubber && (
              <p className="text-xs text-slate-500 mt-1">
                {formatTime(safeTime)} / {formatTime(safeDuration)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-none">
            {/* PLAY/PAUSE — только иконка */}
            <button
              type="button"
              onClick={() => onToggle(track)}
              className={[
                "h-10 w-10 inline-flex items-center justify-center rounded-xl border",
                "border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                isActive ? "shadow-sm" : "",
              ].join(" ")}
              aria-label={activeAndPlaying ? t("pause") : t("listen")}
              title={activeAndPlaying ? t("pause") : t("listen")}
            >
              {activeAndPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* DOWNLOAD — только иконка */}
            {track.src && track.src !== "#" && (
              <a href={track.src} download className="inline-flex" aria-label={`${t("download")}: ${track.title}`}>
                <button
                  type="button"
                  className={[
                    "h-10 w-10 inline-flex items-center justify-center rounded-xl border",
                    "border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                  ].join(" ")}
                  title={t("download")}
                >
                  <Download className="w-5 h-5" />
                </button>
              </a>
            )}
          </div>
        </div>

        {/* 2) SEEK BAR появляется при нажатии Play (когда трек активен) */}
        {showScrubber && (
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={safeDuration || 0}
              step={0.25}
              value={Math.min(safeTime, safeDuration || safeTime)}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={!safeDuration}
              className={[
                "w-full",
                "accent-blue-600",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              ].join(" ")}
              aria-label="Seek"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductCard({ item, t }) {
  return (
    <Card className="overflow-hidden border border-slate-200 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative">
          <img src={item.image} alt={item.title} className="w-full h-56 object-cover" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {item.badges?.map((b) => (
              <Badge key={b} className="backdrop-blur">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex flex-col flex-grow justify-between">
        <div className="space-y-2">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
            <p className="text-sm opacity-80">{item.kind}</p>
          </div>
          <p className="text-sm text-slate-700">{item.description}</p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto">
          <span className="text-xl font-semibold">{currencyUSD(item.price)}</span>

          <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
            <Button variant="outline" className="flex items-center gap-1" type="button">
              <ExternalLink className="w-4 h-4" />
              <span>{productBuyLabel(item, t)}</span>
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ================== APP ==================
export default function App() {
  // -------- language --------
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

  // -------- tab --------
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
    // Small UX polish: go to top when switching tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  // -------- store search --------
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) =>
      [p.title, p.kind, p.description, ...(p.badges || [])].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const clearQuery = () => setQuery("");

  // -------- audiobooks --------
  const [audioBookId, setAudioBookId] = useState(null);

  const selectedBook = useMemo(() => AUDIO_BOOKS.find((b) => b.id === audioBookId) || null, [audioBookId]);

  // One global audio player
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
  const onEnded = () => setIsPlaying(false);

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
    // when leaving Audio tab — stop player and reset selection
    if (tab !== "free-audio") {
      stopAudio();
      setCurrentTrack(null);
      setAudioBookId(null);
    }
  }, [tab, stopAudio]);

  useEffect(() => {
    // when closing a book — stop
    if (!audioBookId) {
      stopAudio();
      setCurrentTrack(null);
    }
  }, [audioBookId, stopAudio]);

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
        {/* TOP BAR */}
        <div className="w-full">
          <div className={`${CONTAINER} py-3 flex items-center justify-between gap-4 ${TOPBAR_H}`}>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=240&auto=format&fit=crop"
                alt="logo"
                className="w-9 h-9 rounded-xl"
              />
              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">{t("name")}</p>
                <p className="text-xs opacity-70 truncate">{t("tagline")}</p>
              </div>
            </div>

            {/* RU/ENG — fixed to the right edge of the header row */}
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

        {/* NAV */}
        <nav className="border-t">
          <div className="w-full">
            <div className={`${CONTAINER} py-3 flex items-center gap-3`}>
              <NavPill
                active={tab === "about"}
                onClick={() => {
                  setTab("about");
                }}
              >
                {t("nav_about")}
              </NavPill>

              <NavPill
                active={tab === "products"}
                onClick={() => {
                  setTab("products");
                }}
              >
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
          </div>
        </nav>
      </header>

      <main id="content" className={`flex-1 ${CONTAINER} py-8 space-y-10`}>
        {/* ABOUT */}
        {tab === "about" && (
          <section className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("about_title")}</h1>
              <p className="leading-relaxed text-slate-700">{t("about_p1")}</p>
            </div>

            <Card className="p-5 border border-slate-200">
              <CardTitle className="mb-2">{t("contacts")}</CardTitle>
              <div className="text-sm space-y-1">
                <p>E-mail: genndybogdanov@gmail.com</p>
                <p>
                  <a className="underline hover:text-slate-900" href="https://medium.com/@gbogdanov" target="_blank" rel="noopener noreferrer">
                    Medium
                  </a>
                </p>
              </div>
            </Card>

            <Card className="md:col-span-3 border border-slate-200">
              <div className="grid md:grid-cols-3 gap-6 p-5 items-center">
                <div>
                  <img
                    src="/Portrait_1.jpg"
                    alt="Portrait"
                    className="w-auto h-40 md:h-48 object-cover rounded-2xl shadow aspect-[3/4]"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-2">{t("learn_with_me")}</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      <a
                        className="underline hover:text-slate-900"
                        href="https://preply.com/en/?pref=ODkzOTkyOQ==&id=1759522486.457389&ep=w1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Preply
                      </a>
                    </li>
                    <li>
                      <a className="underline hover:text-slate-900" href="https://www.italki.com/affshare?ref=af11775706" target="_blank" rel="noopener noreferrer">
                        italki
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <section className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* SEARCH — first column */}
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
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>

              {/* Fill rest of first row to keep grid alignment */}
              <div className="hidden sm:block lg:col-span-2" />

              {/* Results */}
              {filteredProducts.length === 0 ? (
  <div>
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
                <p className="text-slate-700">{t("audio_choose")}</p>

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
<div
  className="
    order-1 md:order-2
    flex flex-col gap-3
    md:flex-row md:items-center md:gap-3
    w-full md:w-auto
    justify-end
  "
>
  {/* Mobile: cover + title row */}
  <div className="order-2 md:order-1 w-full">
    <div className="flex items-center gap-4 md:block">
      {/* mini cover ONLY on mobile */}
      <img
        src={selectedBook.cover}
        alt={selectedBook.title}
        className="w-20 h-20 rounded-2xl object-cover shadow flex-none md:hidden"
      />

      <div className="min-w-0">
        <h1 className="text-3xl font-bold md:text-4xl leading-tight">{selectedBook.title}</h1>
        <p className="text-slate-600">{selectedBook.description}</p>
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="order-1 md:order-2 flex w-full flex-wrap gap-3 justify-end md:w-auto">
    <Button variant="outline" onClick={() => setAudioBookId(null)} className="flex gap-2" type="button">
      ← {t("back")}
    </Button>

    <Button onClick={downloadAllAudio} className="flex gap-2" type="button">
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
          </section>
        )}
      </main>

      {/* Sticky footer (doesn't jump): bottom if little content, after content if long */}
      <footer className="mt-auto py-6 text-center text-xs text-slate-500 border-t">
        © {new Date().getFullYear()} Genndy Bogdanov
      </footer>
    </div>
  );
}
