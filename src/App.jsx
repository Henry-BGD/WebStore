import React, { useMemo, useState } from "react";
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
    image:
      "/Product_Leo.png",
    externalUrl: "https://amazon.example/your-book",
    marketplace: "amazon", // <- for automatic label
    badges: ["RU-EN", "Paper Book", "Audio"],
    description: "Word-by-word translation, stress marks, grammar explanations, exersices, audio included.",
  },
];

const AUDIO_BOOKS = [
  {
    id: "tolstoy-short-stories",
    title: "Russian Short Stories",
    cover: "/Audio_External_Leo.png",
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
    // Header / nav
    name: "Genndy Bogdanov",
    tagline: "",
    nav_about: "About",
    nav_products: "Products",
    nav_audio: "Audiobooks",

    // About
    about_title:
      "Hi! I’m Genndy — a Russian language teacher and the author of learning materials",
    about_p1:
      "I help English speakers read Russian faster and with confidence. 1000+ lessons taught, high rating.",
    //about_b1: "1000+ lessons taught, high rating.",
    //about_b2: "Materials for levels A0–C2.",
    contacts: "Contacts",
    learn_with_me: "Learn Russian with me on:",

    // Products
    products_title: "My products",
    products_search: "Search by title, format, description…",
    buy_amazon: "Buy on Amazon",
    buy_etsy: "Buy on Etsy",
    buy_generic: "Buy",

    // Audio list
    //audio_title: "Audiobooks",
    audio_choose: "Choose a book to listen or download",
    back: "Back",
    download_all: "Download all",
    //listen: "Listen",
    listen: "",
    //pause: "Pause",
    pause: "",
    //download: "Download",
    download: "",
  },

  ru: {
    // Header / nav
    name: "Genndy Bogdanov",
    //tagline: "Учитель русского языка",
    nav_about: "Обо мне",
    nav_products: "Перейти к товарам",
    nav_audio: "Аудиокниги",

    // About
    about_title: "Всем привет! Я — Геннадий. Преподаватель русского языка и автор учебных материалов.",
    about_p1:
      "Я помогаю англоговорящим быстрее и увереннее читать по-русски. 1000+ проведённых уроков, высокий рейтинг.",
    //about_b1: "1000+ проведённых уроков, высокий рейтинг.",
    //about_b2: "Материалы для уровней A0–C2.",
    contacts: "Контакты",
    learn_with_me: "Учи русский язык со мной на платформах:",

    // Products
    products_title: "Мои товары",
    products_search: "Поиск по названию, формату, описанию…",
    buy_amazon: "Купить на Amazon",
    buy_etsy: "Купить на Etsy",
    buy_generic: "Купить",

    // Audio list
    //audio_title: "Аудиокниги",
    audio_choose: "Выберите книгу, чтобы послушать или загрузить материалы.",
    back: "Назад",
    download_all: "Скачать всё",
    //listen: "Слушать",
    //pause: "Пауза",
    //download: "Скачать",
    listen: "",
    pause: "",
    download: "",
  },
};

// ================== UI HELPERS ==================
function NavPill({ active, onClick, children, size = "md" }) {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  return (
    <button
      onClick={onClick}
      className={
        `${padding} rounded-full border transition ` +
        (active
          ? "bg-white shadow border-slate-300"
          : "bg-white/60 hover:bg-white border-slate-200")
      }
      type="button"
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
          <img
            src={book.cover}
            alt={book.title}
            className="w-16 h-16 rounded-xl object-cover flex-none"
          />
          <div className="min-w-0">
            <p className="font-semibold truncate">{book.title}</p>
            {book.description && (
              <p className="text-sm text-slate-600 line-clamp-2">{book.description}</p>
            )}
          </div>
        </div>
      </Card>
    </button>
  );
}

function TrackRow({ track, activeId, isPlaying, onToggle, t }) {
  const active = activeId === track.id && isPlaying;

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
            {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {active ? t("pause") : t("listen")}
          </Button>

          {track.src && track.src !== "#" && (
            <a href={track.src} download className="inline-flex">
              <Button size="sm" className="flex items-center gap-2" type="button">
                <Download className="w-4 h-4" />
                {t("download")}
              </Button>
            </a>
          )}
        </div>

        <audio id={`audio-${track.id}`} src={track.src} preload="none" />
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

        {/* Bottom bar pinned */}
        <div className="flex items-center justify-between pt-4 mt-auto">
          <span className="text-xl font-semibold">{currencyUSD(item.price)}</span>
          <Button
            variant="outline"
            onClick={() => window.open(item.externalUrl, "_blank")}
            className="flex items-center gap-1"
            type="button"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{productBuyLabel(item, t)}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ================== APP ==================
export default function App() {
  // language: auto-detect, fallback EN
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

  const [lang, setLang] = useState(detectLanguage());
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
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) =>
      [p.title, p.kind, p.description, ...(p.badges || [])].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const selectedBook = useMemo(() => AUDIO_BOOKS.find((b) => b.id === audioBookId) || null, [audioBookId]);

  function toggleTrack(track) {
    const el = document.getElementById(`audio-${track.id}`);
    if (!el) return;

    // pause all others
    AUDIO_BOOKS.forEach((b) =>
      b.tracks.forEach((tr) => {
        const other = document.getElementById(`audio-${tr.id}`);
        if (other && tr.id !== track.id) other.pause();
      })
    );

    if (currentTrackId === track.id && isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play();
      setCurrentTrackId(track.id);
      setIsPlaying(true);
    }
  }

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
        {/* top row */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
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

          {/* language pills (NavButton style) */}
          <div className="flex items-center gap-2 shrink-0">
            <NavPill size="sm" active={lang === "ru"} onClick={() => switchLang("ru")}>
              RU
            </NavPill>
            <NavPill size="sm" active={lang === "en"} onClick={() => switchLang("en")}>
              ENG
            </NavPill>
          </div>
        </div>

        {/* nav row */}
        <nav className="border-t">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 md:justify-between">
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center">
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

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* ABOUT */}
        {tab === "about" && (
          <section className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("about_title")}</h1>
              <p className="leading-relaxed text-slate-700">{t("about_p1")}</p>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>{t("about_b1")}</li>
                <li>{t("about_b2")}</li>
              </ul>
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

            <Card className="md:col-span-3 border border-slate-200">
              <div className="grid md:grid-cols-3 gap-6 p-5 items-center">
                <div>
                  <img
                    src="/Portrait_1.jpg"
                    alt="Portrait"
                    className="w-auto h-40 md:h-48 mx-auto object-cover rounded-2xl shadow aspect-[3/4]"
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
                      <a
                        className="underline hover:text-slate-900"
                        href="https://www.italki.com/affshare?ref=af11775706"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-2xl font-bold">{t("products_title")}</h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("products_search")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full md:w-80"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} item={p} t={t} />
              ))}
            </div>
          </section>
        )}

        {/* AUDIO */}
        {tab === "free-audio" && (
          <section className="space-y-6">
            {!audioBookId && (
              <>
                <h2 className="text-2xl font-bold">{t("audio_title")}</h2>
                <p className="text-slate-700">{t("audio_choose")}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  {AUDIO_BOOKS.map((book) => (
                    <AudioBookTile key={book.id} book={book} onOpen={setAudioBookId} />
                  ))}
                </div>
              </>
            )}

            {audioBookId && selectedBook && (
              <>
                {/* Mobile: buttons on top, title under; Desktop: title left, buttons right */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="order-1 flex w-full flex-wrap gap-3 justify-end md:order-2 md:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setAudioBookId(null)}
                      className="flex gap-2"
                      type="button"
                    >
                      ← {t("back")}
                    </Button>

                    <Button onClick={downloadAllAudio} className="flex gap-2" type="button">
                      <Download className="w-4 h-4" />
                      {t("download_all")}
                    </Button>
                  </div>

                  <div className="order-2 w-full md:order-1 md:max-w-[60%]">
                    <h1 className="text-3xl font-bold md:text-4xl">{selectedBook.title}</h1>
                    <p className="text-slate-600">{selectedBook.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <img
                    src={selectedBook.cover}
                    alt={selectedBook.title}
                    className="w-full aspect-square object-cover rounded-2xl shadow md:col-span-1"
                  />

                  <div className="md:col-span-2 space-y-3">
                    {selectedBook.tracks.map((tr) => (
                      <TrackRow
                        key={tr.id}
                        track={tr}
                        activeId={currentTrackId}
                        isPlaying={isPlaying}
                        onToggle={toggleTrack}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t">
        © {new Date().getFullYear()} Genndy Bogdanov
      </footer>
    </div>
  );
}
