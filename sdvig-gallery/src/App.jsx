import { useRef, useState } from 'react';
import { artworks, artUrl, categories } from './artworks.js';
import { ArtworkCard, ArtworkDialog, BookmarkIcon } from './Artwork.jsx';
import { useFavorites } from './useFavorites.js';

const plural = new Intl.PluralRules('ru');
const workWords = { one: 'работа', few: 'работы', many: 'работ', other: 'работы' };

function workCount(count) {
  return `${count} ${workWords[plural.select(count)]}`;
}

function searchText(value) {
  return value.toLowerCase().replaceAll('ё', 'е').trim();
}

function Wordmark() {
  return <a className="wordmark" href="#top" aria-label="Сдвиг — в начало">сдвиг<span>.</span></a>;
}

function Header({ favoriteCount, onlyFavorites, onFavorites, onCollection }) {
  return (
    <header className="site-header" id="top">
      <div className="header-inner shell">
        <Wordmark />
        <nav aria-label="Основная навигация">
          <a href="#exhibition">Выставка</a>
          <a href="#collection" onClick={onCollection}>Коллекция</a>
          <a href="#about">О галерее</a>
        </nav>
        <button className="favorites-button" type="button" aria-pressed={onlyFavorites} onClick={onFavorites}>
          <BookmarkIcon />
          <span>Избранное</span>
          <span className="favorites-count">{favoriteCount}</span>
        </button>
      </div>
    </header>
  );
}

function Exhibition({ onCollection, onOpenArtwork }) {
  return (
    <section id="exhibition" className="exhibition" aria-labelledby="exhibition-title">
      <div className="exhibition__copy">
        <p className="eyebrow exhibition__kicker">Цифровая выставка</p>
        <h1 id="exhibition-title">Материя<br /><em>тишины</em></h1>
        <p className="exhibition__description">Девять работ о том, как свет меняет форму, цвет и фактуру.</p>
        <a className="exhibition__link" href="#collection" onClick={onCollection}>Смотреть коллекцию</a>
      </div>
      <figure className="exhibition__visual">
        <img
          src={artUrl('hero')}
          srcSet={`${artUrl('hero-small')} 768w, ${artUrl('hero')} 1536w`}
          sizes="(max-width: 760px) 100vw, 57vw"
          width="1536"
          height="1024"
          alt="Инсталляция из бордовой ткани в бетонном зале"
          fetchPriority="high"
        />
        <figcaption>
          <button type="button" onClick={(event) => onOpenArtwork(artworks[0], event.currentTarget)}>
            Бордовый рельеф <span>·</span> Фрагмент инсталляции
          </button>
        </figcaption>
      </figure>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="about__inner shell">
        <div>
          <p className="eyebrow">О галерее</p>
          <h2 id="about-title">Сдвиг<span>.</span></h2>
        </div>
        <div className="about__copy">
          <p>«Сдвиг» — онлайн-галерея современного искусства. Здесь встречаются фотография, живопись и объекты, и каждую выставку можно смотреть в своём темпе.</p>
          <p>В «Материи тишины» стекло окрашивает тень, фарфор удерживает свет, а рябь на воде почти растворяется в тумане.</p>
        </div>
      </div>
    </section>
  );
}

export function App() {
  const { favorites, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState(null);
  const collectionRef = useRef(null);
  const collectionTitleRef = useRef(null);
  const artworkTriggerRef = useRef(null);

  const queryWords = searchText(query).split(/\s+/).filter(Boolean);
  const savedWorks = artworks.filter((work) => favorites.includes(work.id));
  const catalogue = onlyFavorites ? savedWorks : artworks;
  const visibleWorks = catalogue.filter((work) => {
    const searchable = searchText([work.title, work.artist, work.medium, work.category, work.year].join(' '));
    return (!category || work.category === category) && queryWords.every((word) => searchable.includes(word));
  });

  function resetFilters() {
    setQuery('');
    setCategory('');
  }

  function showCollection() {
    setOnlyFavorites(false);
    resetFilters();
  }

  function switchFavorites() {
    setOnlyFavorites((current) => !current);
    resetFilters();
    requestAnimationFrame(() => {
      collectionTitleRef.current?.focus({ preventScroll: true });
      collectionRef.current?.scrollIntoView({ block: 'start' });
    });
  }

  function openArtwork(artwork, trigger) {
    artworkTriggerRef.current = trigger;
    setActiveArtwork(artwork);
  }

  function closeArtwork() {
    setActiveArtwork(null);
    requestAnimationFrame(() => {
      const trigger = artworkTriggerRef.current;
      (trigger?.isConnected ? trigger : collectionTitleRef.current)?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <a className="skip-link" href="#main">К содержанию</a>
      <Header favoriteCount={savedWorks.length} onlyFavorites={onlyFavorites} onFavorites={switchFavorites} onCollection={showCollection} />
      <main id="main" tabIndex="-1">
        <Exhibition onCollection={showCollection} onOpenArtwork={openArtwork} />
        <section className="collection shell" id="collection" ref={collectionRef} aria-labelledby="collection-title">
          <div className="collection__heading">
            <div className="collection__title">
              <h2 id="collection-title" ref={collectionTitleRef} tabIndex="-1">
                {onlyFavorites ? 'Избранное' : 'Коллекция'}
              </h2>
              <span className="collection__count" role="status">{workCount(visibleWorks.length)}</span>
            </div>
            <div className="search">
              <label className="visually-hidden" htmlFor="catalogue-search">Поиск по коллекции</label>
              <span className="search-icon" aria-hidden="true" />
              <input
                id="catalogue-search"
                type="search"
                placeholder="Название или художник"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="filters" role="group" aria-label="Фильтр по виду искусства">
            {['', ...categories].map((option) => (
              <button key={option} type="button" aria-pressed={category === option} onClick={() => setCategory(option)}>
                {option || 'Все работы'}
              </button>
            ))}
          </div>
          {visibleWorks.length > 0 ? (
            <div className="collection__grid">
              {visibleWorks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  saved={favorites.includes(artwork.id)}
                  onToggle={toggleFavorite}
                  onOpen={openArtwork}
                />
              ))}
            </div>
          ) : (
            <div className="collection__empty">
              {onlyFavorites && savedWorks.length === 0 ? (
                <>
                  <h3>Здесь будут ваши работы</h3>
                  <p>Нажмите на закладку рядом с работой, чтобы её сохранить.</p>
                  <button type="button" onClick={showCollection}>Вернуться в коллекцию</button>
                </>
              ) : (
                <>
                  <h3>Работы не найдены</h3>
                  <p>Измените запрос или выберите другой вид искусства.</p>
                  <button type="button" onClick={resetFilters}>Сбросить фильтры</button>
                </>
              )}
            </div>
          )}
        </section>
        <About />
      </main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <Wordmark />
          <a href="#top">К началу страницы</a>
        </div>
      </footer>
      {activeArtwork && (
        <ArtworkDialog
          artwork={activeArtwork}
          saved={favorites.includes(activeArtwork.id)}
          onToggle={toggleFavorite}
          onClose={closeArtwork}
        />
      )}
    </>
  );
}
