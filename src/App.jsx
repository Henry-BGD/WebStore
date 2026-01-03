import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card.jsx'
import { Button } from './components/ui/Button.jsx'
import { Input } from './components/ui/Input.jsx'
import { Badge } from './components/ui/Badge.jsx'
import { ShoppingCart, ExternalLink, Download, Play, Pause, BookOpen, FileText, Youtube } from 'lucide-react'

// ======== Флаги видимости разделов ========
const SHOW = {
  youtube: false,  // ← скрыть блок YouTube
  freePdf: false,  // ← скрыть вкладку/секцию PDF
}

// ======== Демо-данные (замените на реальные) ========
const PRODUCTS = [
  {
    id: 'prod-ru-book-1',
    title: 'Билингвальная книга: Толстой — рассказы с ударениями',
    kind: 'Книга (PDF + аудио)',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    externalUrl: 'https://amazon.example/your-book',
    marketplaceLabel: 'Купить на Amazon',
    digitalSku: 'sku_tolstoy_lite',
    badges: ['RU-EN', 'PDF', 'Аудио'],
    description: 'Параллельный перевод, грамматика, упражнения, аудио к каждому рассказу.',
  },
  {
  id: 'prod-tee-samurai-black',
  title: 'Футболка: Самурай (чёрная)',
  kind: 'Футболка, heavy cotton',
  price: 24.99,
  image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop', // мокап
  externalUrl: 'https://www.etsy.com/listing/4397031433/japanese-samurai-warrior-t-shirt?ref=shop_home_feat_1&sr_prefetch=1&pf_from=shop_home&frs=1&logging_key=30998bb728bf6cac3d5447a9971f816214b7e253%3A4397031433',
  // ссылка на Etsy
  marketplaceLabel: 'Купить на Etsy',
  digitalSku: 'tee_samurai_black_g5000', // опционально, для учёта
  badges: ['Unisex', 'Heavy Cotton', 'S–XL'],
  description: 'Минималистичный принт самурая. Плотная хлопковая футболка на каждый день.',
}
]

const AUDIO_BOOKS = [
  {
    id: "tolstoy-short-stories",
    title: "Russian Short Stories by Leo Tolstoy",
    cover: "/covers/tolstoy.jpg", // положи картинку в public/covers/tolstoy.jpg
    description: "Короткие рассказы с параллельным текстом и озвучкой.",
    tracks: [
      { id: "kostochka", title: "Косточка (The Pit)", src: "/audio/kostochka.mp3" },
      { id: "kotenok", title: "Котёнок (The Kitten)", src: "/audio/kotenok.mp3" },
      { id: "slivy", title: "Сливы (Plums)", src: "/audio/slivy.mp3" },
    ],
  },
  // добавишь вторую книгу — просто копируешь объект и меняешь поля
];

const LINKS = {
  medium: [
    { title: 'You’ll Never Learn a Language If You Ignore These Two Rules', url: 'https://medium.com/@gbogdanov/youll-never-learn-a-language-if-you-ignore-these-two-rules-0aa781eeb677?sk=2789a563a9f9197bd3a4353a773fa77b' },
    { title: 'Why You’re Learning Vocabulary Wrong — and How to Fix It', url: 'https://medium.com/@gbogdanov/why-youre-learning-vocabulary-wrong-and-how-to-fix-it-b577fbc9e37e?sk=482b7b51eaae50c26f8f3d898440c756' },
    { title: 'Think English Is Enough? Here’s Why You’re Wrong', url: 'https://medium.com/@gbogdanov/if-you-know-only-one-language-you-have-a-big-problem-8831ea01df4d?sk=639842a8abba91591bff52a7c890eaee' },
  ],
  youtube: [], // ← пусто, чтобы карточка не рендерилась
}

// ======== Утилиты / мини-компоненты ========
function NavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-5 py-2.5 rounded-full text-sm border transition " +
        (active
          ? "bg-white shadow border-slate-300"
          : "bg-white/60 hover:bg-white border-slate-200")
      }
    >
      {children}
    </button>
  );
}

function currency(n) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD' }).format(n)
  } catch {
    return `$${n}`
  }
}

function handleCheckout(url) {
  if (!url || url === '#') {
    alert('Скоро здесь будет ссылка на внешнюю витрину (Amazon/Gumroad/и т.п.).')
    return
  }
  window.open(url, '_blank')
}

function AudioTracks({ cover, tracks, zipUrl }) {
  const [current, setCurrent] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        {cover && <img src={cover} alt="cover" className="w-full h-56 object-cover rounded-2xl shadow" />}
        {zipUrl && zipUrl !== '#' && (
          <Button onClick={() => (window.location.href = zipUrl)} className="mt-4 w-full flex gap-2">
            <Download className="w-4 h-4" /> Скачать все главы (ZIP)
          </Button>
        )}
      </div>
      <div className="md:col-span-2 space-y-3">
        {tracks.map((t) => (
          <Card key={t.id} className="border border-slate-200">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById(`audio-${t.id}`)
                    if (!el) return
                    if (current?.id === t.id && isPlaying) {
                      setIsPlaying(false); el.pause()
                    } else {
                      tracks.forEach(x => {
                        const other = document.getElementById(`audio-${x.id}`)
                        if (other && x.id !== t.id) other.pause()
                      })
                      setCurrent(t); setIsPlaying(true); el.play()
                    }
                  }}
                >
                  {current?.id === t.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="truncate">
                  <p className="font-medium truncate">{t.title}</p>
                  {t.src && t.src !== '#' && (
                    <a href={t.src} download className="text-sm underline opacity-80 hover:opacity-100">
                      Скачать MP3
                    </a>
                  )}
                </div>
              </div>
              <audio id={`audio-${t.id}`} src={t.src} preload="none" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ProductCard({ item }) {
  return (
    <Card className="overflow-hidden border border-slate-200 flex flex-col">
      {/* Изображение */}
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

      {/* Контент */}
      <CardContent className="p-4 flex flex-col flex-grow justify-between">
        <div className="space-y-2">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
            <p className="text-sm opacity-80">{item.kind}</p>
          </div>
          <p className="text-sm text-slate-700">{item.description}</p>
        </div>

        {/* Нижняя панель */}
        <div className="flex items-center justify-between pt-4 mt-auto">
          <span className="text-xl font-semibold">{currency(item.price)}</span>
          <Button
            variant="outline"
            onClick={() => window.open(item.externalUrl, '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{item.marketplaceLabel ?? 'Купить'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FreeCard({ entry }) {
  if (entry.type === 'audio') {
    return (
      <Card className="p-6 space-y-3 border border-slate-200">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-semibold text-lg">{entry.title}</h3>
        </div>
        <p className="text-sm opacity-90">{entry.description}</p>
        <AudioTracks cover={entry.cover} tracks={entry.tracks} zipUrl={entry.zipUrl} />
      </Card>
    )
  }
  if (entry.type === 'pdf') {
    return (
      <Card className="p-6 space-y-3 border border-slate-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold text-lg">{entry.title}</h3>
        </div>
        <p className="text-sm opacity-90">{entry.description}</p>
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <img src={entry.thumb} alt={entry.title} className="w-full h-56 object-cover rounded-2xl shadow" />
          <div className="space-y-3">
            {entry.fileUrl && entry.fileUrl !== '#' && (
              <>
                <Button variant="outline" onClick={() => window.open(entry.fileUrl, '_blank')}>Открыть PDF</Button>
                <Button onClick={() => (window.location.href = entry.fileUrl)} className="flex gap-2">
                  <Download className="w-4 h-4" /> Скачать PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }
  return null
}

function LinksSection() {
  const hasMedium = (LINKS.medium?.length ?? 0) > 0
  const hasYoutube = SHOW.youtube && (LINKS.youtube?.length ?? 0) > 0
  if (!hasMedium && !hasYoutube) return null

  return (
    <div className={`grid gap-6 ${hasMedium && hasYoutube ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
      {hasMedium && (
        <Card className="p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Статьи на Medium</h3>
          </div>
          <ul className="space-y-2 list-disc list-inside">
            {LINKS.medium.map((l) => (
              <li key={l.url}>
                <a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.title}</a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {hasYoutube && (
        <Card className="p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="w-5 h-5" />
            <h3 className="font-semibold">YouTube канал</h3>
          </div>
          <ul className="space-y-2 list-disc list-inside">
            {LINKS.youtube.map((l) => (
              <li key={l.url}>
                <a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.title}</a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function AudioBookTile({ book, onOpen }) {
  return (
    <button
      onClick={() => onOpen(book.id)}
      className="w-full text-left"
    >
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

function TrackRow({ track, activeId, isPlaying, onToggle }) {
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
          >
            {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {active ? "Пауза" : "Слушать"}
          </Button>

          {track.src && (
            <a href={track.src} download className="inline-flex">
              <Button size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Скачать
              </Button>
            </a>
          )}
        </div>

        <audio id={`audio-${track.id}`} src={track.src} preload="none" />
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [tab, setTab] = useState('about')
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PRODUCTS
    return PRODUCTS.filter((p) =>
      [p.title, p.kind, p.description, ...(p.badges || [])].join(' ').toLowerCase().includes(q)
    )
  }, [query])

const [audioBookId, setAudioBookId] = useState(null);
const [currentTrackId, setCurrentTrackId] = useState(null);
const [isPlaying, setIsPlaying] = useState(false);

  const selectedBook = useMemo(
  () => AUDIO_BOOKS.find((b) => b.id === audioBookId) || null,
  [audioBookId]
);

function toggleTrack(track) {
  const el = document.getElementById(`audio-${track.id}`);
  if (!el) return;

  // стопим все остальные
  AUDIO_BOOKS.forEach((b) =>
    b.tracks.forEach((t) => {
      const other = document.getElementById(`audio-${t.id}`);
      if (other && t.id !== track.id) other.pause();
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

  return (
    <div className="min-h-screen">
      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
        {/* Верхняя полоса: логотип и подпись */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=240&auto=format&fit=crop"
              alt="logo"
              className="w-9 h-9 rounded-xl"
            />
            <div>
              <p className="font-semibold leading-tight">Genndy Bogdanov</p>
              <p className="text-xs opacity-70">
                Учитель русского языка
              </p>
            </div>
          </div>
        </div>

        {/* НИЖНЯЯ полоса: единая панель навигации */}
        <nav className="border-t">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 md:justify-between">
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center">
              <NavButton active={tab === "about"} onClick={() => setTab("about")}>
                Обо мне
              </NavButton>
              <NavButton active={tab === "products"} onClick={() => setTab("products")}>
                Перейти к товарам
              </NavButton>
              {SHOW.freePdf && (
                <NavButton active={tab === "free-pdf"} onClick={() => setTab("free-pdf")}>
                  Бесплатные материалы (PDF)
                </NavButton>
              )}
              <NavButton active={tab === "free-audio"} onClick={() => setTab("free-audio")}>
                Аудиокниги
              </NavButton>
              <NavButton active={tab === "links"} onClick={() => setTab("links")}>
                Ссылки
              </NavButton>
              <NavButton active={tab === "free-audio"} onClick={() => { setTab("free-audio"); setAudioBookId(null); }}>
              Аудиокниги
              </NavButton>
            </div>
          </div>
        </nav>
      </header>

      {/* Контент */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {tab === 'about' && (
          <section className="grid md:grid-cols-3 gap-8 items-start">
            {/* Левая колонка */}
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Всем привет, дорогие друзья! Я — Геннадий. Преподаватель русского языкие и автор книнг и учебных материалов.
              </h1>
              <p className="leading-relaxed text-slate-700">
                Я помогаю англоговорящим быстрее и увереннее читать по-русски: делаю билингвальные книги с аудио, объясняю грамматику простым языком и создаю курсы с практическими заданиями.
                На этой странице — мои платные продукты и бесплатные материалы.
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>1000+ проведённых уроков, высокий рейтинг.</li>
                <li>Материалы для всех уровней A0–C2.</li>
              </ul>
            </div>

            {/* Правая колонка: контакты */}
            <Card className="p-5 border border-slate-200">
              <CardTitle className="mb-2">Контакты</CardTitle>
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

            {/* Низ: фото + ссылки на платформы */}
            <Card className="md:col-span-3 border border-slate-200">
              <div className="grid md:grid-cols-3 gap-6 p-5 items-center">
                <div>
                  <img
                    src="/Portrait_1.jpg"
                    alt="Henry — преподаватель русского"
                     className="w-auto h-40 md:h-48 mx-auto object-cover rounded-2xl shadow aspect-[3/4]"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-2">
                    Учи русский язык со мной на платформах:
                  </h3>
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

        {tab === 'products' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-2xl font-bold">Мои товары</h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Поиск по названию, формату, описанию…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full md:w-80"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => <ProductCard key={p.id} item={p} />)}
            </div>
          </section>
        )}

        {/* PDF — по флагу */}
        {SHOW.freePdf && tab === 'free-pdf' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Бесплатные материалы (PDF)</h2>
            <p className="text-slate-700">
              Здесь собраны все бесплатные PDF-файлы: грамматика, шпаргалки, памятки и мини-книги.
            </p>
            <div className="space-y-6">
              {FREE_STUFF.filter((x) => x.type === 'pdf').map((x) => (
                <FreeCard key={x.id} entry={x} />
              ))}
            </div>
          </section>
        )}

        {/* Аудио */}
{tab === "free-audio" && (
  <section className="space-y-6">
    {!audioBookId && (
      <>
        <h2 className="text-2xl font-bold">Аудиокниги</h2>
        <p className="text-slate-700">
          Выберите книгу — откроется список глав с прослушиванием и скачиванием.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {AUDIO_BOOKS.map((book) => (
            <AudioBookTile key={book.id} book={book} onOpen={setAudioBookId} />
          ))}
        </div>
      </>
    )}

    {audioBookId && selectedBook && (
      <>
        <div className="flex items-start justify-between gap-4 mb-6">
  {/* Заголовок */}
  <div>
    <h1 className="text-3xl font-bold">
      Russian Short Stories by Leo Tolstoy
    </h1>
    <p className="text-slate-600">
      Короткие рассказы с параллельным текстом и озвучкой.
    </p>
  </div>

  {/* Кнопки справа */}
  <div className="flex gap-3 shrink-0">
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="flex gap-2"
    >
      ← Назад
    </Button>

    <Button
      onClick={downloadAllAudio}
      className="flex gap-2"
    >
      ⬇ Скачать всё
    </Button>
  </div>
</div>

        function downloadAllAudio() {
  const files = [
    '/audio/kostochka.mp3',
    '/audio/kotenok.mp3',
    '/audio/slivy.mp3',
  ]

  files.forEach((url) => {
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })
}

        <div className="grid md:grid-cols-3 gap-6 items-start">
          <img
            src={selectedBook.cover}
            alt={selectedBook.title}
            className="w-full aspect-square object-cover rounded-2xl shadow md:col-span-1"
          />

          <div className="md:col-span-2 space-y-3">
            {selectedBook.tracks.map((t) => (
              <TrackRow
                key={t.id}
                track={t}
                activeId={currentTrackId}
                isPlaying={isPlaying}
                onToggle={toggleTrack}
              />
            ))}
          </div>
        </div>
      </>
    )}
  </section>
)}

        {tab === 'links' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Ссылки на статьи и видео</h2>
            <LinksSection />
          </section>
        )}
      </main>

      {/* Подвал — минимализм */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t">
        © {new Date().getFullYear()} Henry Bogdanov
      </footer>
    </div>
  )
}
