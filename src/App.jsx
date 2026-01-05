import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card.jsx";
import { Button } from "./components/ui/Button.jsx";
import { Input } from "./components/ui/Input.jsx";
import { Badge } from "./components/ui/Badge.jsx";
import { ExternalLink, Download, Play, Pause } from "lucide-react";

/* ================== DATA ================== */

const PRODUCTS = [
  {
    id: "prod-ru-book-1",
    title: "Russian Short Stories by Leo Tolstoy",
    kind: "A1–B1 Level",
    price: 12.99,
    image: "/Product_Leo.png",
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

/* ================== I18N ================== */

const I18N = {
  en: {
    name: "Genndy Bogdanov",
    nav_about: "About",
    nav_products: "Store",
    nav_audio: "Audiobooks",
    about_title: "Hi! I’m Genndy — a Russian language teacher and the author of learning materials",
    about_p1: "I help English speakers read Russian faster and with confidence.",
    contacts: "Contacts",
    learn_with_me: "Learn Russian with me on:",
    products_search: "Search by title or description…",
    buy_amazon: "Buy on Amazon",
    audio_choose: "Choose a book to listen to or download",
    back: "Back",
    download_all: "Download all",
  },
  ru: {
    name: "Genndy Bogdanov",
    nav_about: "Обо мне",
    nav_products: "Магазин",
    nav_audio: "Аудиокниги",
    about_title: "Всем привет! Я — Геннадий.",
    about_p1: "Помогаю уверенно читать по-русски.",
    contacts: "Контакты",
    learn_with_me: "Учи русский со мной:",
    products_search: "Поиск по названию или описанию…",
    buy_amazon: "Купить на Amazon",
    audio_choose: "Выберите книгу",
    back: "Назад",
    download_all: "Скачать всё",
  },
};

/* ================== HELPERS ================== */

function NavPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full border transition ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function AudioBookTile({ book, onOpen }) {
  return (
    <button onClick={() => onOpen(book.id)} className="block w-full text-left">
      <Card className="p-5 border border-slate-200 hover:shadow-md w-full">
        <div className="flex gap-4 items-center">
          <img src={book.cover} alt={book.title} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <p className="font-semibold">{book.title}</p>
            <p className="text-sm text-slate-600">{book.description}</p>
          </div>
        </div>
      </Card>
    </button>
  );
}

/* ================== APP ================== */

export default function App() {
  const [lang, setLang] = useState("en");
  const t = (k) => I18N[lang][k] || k;

  const [tab, setTab] = useState("about");
  const [query, setQuery] = useState("");
  const [audioBookId, setAudioBookId] = useState(null);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return PRODUCTS.filter((p) =>
      [p.title, p.kind, p.description].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const selectedBook = AUDIO_BOOKS.find((b) => b.id === audioBookId);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
          <div className="font-semibold">{t("name")}</div>
          <div className="flex gap-2">
            <NavPill active={lang === "ru"} onClick={() => setLang("ru")}>RU</NavPill>
            <NavPill active={lang === "en"} onClick={() => setLang("en")}>EN</NavPill>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-3">
          <NavPill active={tab === "about"} onClick={() => setTab("about")}>{t("nav_about")}</NavPill>
          <NavPill active={tab === "products"} onClick={() => setTab("products")}>{t("nav_products")}</NavPill>
          <NavPill active={tab === "audio"} onClick={() => setTab("audio")}>{t("nav_audio")}</NavPill>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* ABOUT */}
        {tab === "about" && (
          <>
            <h1 className="text-3xl font-bold">{t("about_title")}</h1>
            <p>{t("about_p1")}</p>

            <Card className="p-6 grid md:grid-cols-3 gap-6">
              <img
                src="/Portrait_1.jpg"
                alt="Portrait"
                className="h-48 rounded-xl object-cover"
              />
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">{t("learn_with_me")}</h3>
                <ul className="space-y-1">
                  <li><a className="underline" href="#">Preply</a></li>
                  <li><a className="underline" href="#">italki</a></li>
                </ul>
              </div>
            </Card>
          </>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("products_search")}
              className="w-full max-w-md"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <Card key={p.id} className="border p-4">
                  <img src={p.image} className="h-40 w-full object-cover mb-3" />
                  <p className="font-semibold">{p.title}</p>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* AUDIO */}
        {tab === "audio" && !audioBookId && (
          <>
            <p>{t("audio_choose")}</p>
            <div className="grid lg:grid-cols-2 gap-6">
              {AUDIO_BOOKS.map((b) => (
                <AudioBookTile key={b.id} book={b} onOpen={setAudioBookId} />
              ))}
            </div>
          </>
        )}

        {tab === "audio" && audioBookId && selectedBook && (
          <>
            <Button onClick={() => setAudioBookId(null)}>← {t("back")}</Button>
            <h1 className="text-3xl font-bold">{selectedBook.title}</h1>
            <img src={selectedBook.cover} className="w-48 rounded-xl" />
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Genndy Bogdanov
      </footer>
    </div>
  );
}
