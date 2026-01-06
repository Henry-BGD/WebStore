import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card.jsx";
import { Button } from "./components/ui/Button.jsx";
import { Input } from "./components/ui/Input.jsx";
import { Badge } from "./components/ui/Badge.jsx";
import { ExternalLink, Download, Play, Pause } from "lucide-react";

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
    description:
      "Word-by-word translation, stress marks, grammar explanations, exercises, audio included.",
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
    about_p1:
      "I help English speakers read Russian faster and with confidence. 1000+ lessons taught, high rating.",
    contacts: "Contacts",
    learn_with_me: "Learn Russian with me on:",

    products_search: "Search by title or description…",
    buy_amazon: "Buy on Amazon",
    buy_etsy: "Buy on Etsy",
    buy_generic: "Buy",

    audio_choose: "Choose a book to listen to or download",
    back: "Back",
    download_all: "Download all",
    listen: "Listen",
    pause: "Pause",
    download: "Download",
  },

  ru: {
    name: "Genndy Bogdanov",
    nav_about: "Обо мне",
    nav_products: "Магазин",
    nav_audio: "Аудиокниги",

    about_title: "Всем привет! Я — Геннадий. Преподаватель русского языка и автор учебных материалов.",
    about_p1:
      "Я помогаю англоговорящим быстрее и увереннее читать по-русски. 1000+ проведённых уроков, высокий рейтинг.",
    contacts: "Контакты",
    learn_with_me: "Учи русский язык со мной на платформах:",

    products_search: "Поиск по названию или описанию…",
    buy_amazon: "Купить на Amazon",
    buy_etsy: "Купить на Etsy",
    buy_generic: "Купить",

    audio_choose: "Выберите книгу, чтобы послушать или загрузить материалы",
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

        // base
        "rounded-full border transition-all duration-200 select-none",
        "active:scale-[0.97]",

        // accessibility
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",

        // states
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

function AudioBookTile({ book, onOpen }) {
  return (
    <button onClick={() => onOpen(book.id)} className="w-full text-left" type="button">
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

function TrackRow({ track, isActive, isPlaying, onToggle, t }) {
  const activeAndPlaying = isActive && isPlaying;

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{track.title}</p>
        </div>

        <div className="flex items-center gap-2 flex-none">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(track)}
            className="flex items-center gap-2"
            type="button"
          >
            {activeAndPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {activeAndPlaying ? t("pause") : t("listen")}
          </Button>

          {track.src && track.src !== "#" && (
            <a href={track.src} download className="inline-flex" aria-label={`${t("download")}: ${track.title}`}>
              <Button size="sm" className="flex items-center gap-2" type="button">
                <Download className="w-4 h-4" />
                {t("download")}
              </Button>
            </a>
          )}
        </div>
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

  const [tab, setTab] = useState("about");
  const [query, setQuery] = useState("");
  const [audioBookId, setAudioBookId] = useState(null);

  // One global audio player
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) =>
      [p.title, p.kind, p.description, ...(p.badges || [])].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const selectedBook = useMemo(() => AUDIO_BOOKS.find((b) => b.id === audioBookId) || null, [audioBookId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
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

  return (
    <div className="min-h-screen">
      <audio ref={audioRef} preload="none" />

           <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
  {/* TOP BAR */}
  <div className="w-full">
    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
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
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-3 justify-center md:justify-start">
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
    </div>
  </nav>
</header>

<main className="flex-1 w-full py-8 text-left">
  <div className="max-w-7xl mx-auto px-6 space-y-10">
    {/* ABOUT */}
    {tab === "about" && (
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("about_title")}
          </h1>
          <p className="leading-relaxed text-slate-700">
            {t("about_p1")}
          </p>
        </div>

        <Card className="p-5 border border-slate-200">
          <CardTitle className="mb-2">{t("contacts")}</CardTitle>
          <div className="text-sm space-y-1">
            <p>E-mail: genndybogdanov@gmail.com</p>
            <p>
              <a
                className="underline hover:text-slate-900"
                href="https://medium.com/@gbogdanov"
                target="_blank"
                rel="noopener noreferrer"
              >
                Medium
              </a>
            </p>
            <p>
              <a
                className="underline hover:text-slate-900"
                href="https://substack.com/@gbogdanov"
                target="_blank"
                rel="noopener noreferrer"
              >
                Substack
              </a>
            </p>
          </div>
        </Card>
      </section>
    )}

    {/* PRODUCTS */}
    {tab === "products" && (
      <section className="space-y-6">
        <div className="w-full max-w-md">
          <Input
            placeholder={t("products_search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} item={p} t={t} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-sm text-slate-500">No results.</p>
        )}
      </section>
    )}

    {/* AUDIO */}
    {tab === "free-audio" && (
      <section className="space-y-6">
        {!audioBookId && (
          <>
            <p className="text-slate-700">{t("audio_choose")}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {AUDIO_BOOKS.map((book) => (
                <AudioBookTile
                  key={book.id}
                  book={book}
                  onOpen={setAudioBookId}
                />
              ))}
            </div>
          </>
        )}

        {audioBookId && selectedBook && (
          <>
            {/* остальной код аудиоплеера — без изменений */}
          </>
        )}
      </section>
    )}
  </div>
</main>



      <footer className="py-6 text-center text-xs text-slate-500 border-t">
        © {new Date().getFullYear()} Genndy Bogdanov
      </footer>
    </div>
  );
}
