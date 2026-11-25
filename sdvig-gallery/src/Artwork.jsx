import { useEffect, useRef } from 'react';
import { artUrl } from './artworks.js';

export function BookmarkIcon() {
  return <span className="bookmark-icon" aria-hidden="true" />;
}

function FavoriteButton({ artwork, saved, onToggle, withLabel = false }) {
  const action = saved ? 'Убрать из избранного' : 'В избранное';
  const label = saved
    ? `Убрать «${artwork.title}» из избранного`
    : `Добавить «${artwork.title}» в избранное`;

  return (
    <button
      type="button"
      className={withLabel ? 'dialog-save' : 'art-card__save'}
      onClick={() => onToggle(artwork.id)}
      aria-pressed={saved}
      aria-label={label}
      title={label}
    >
      <BookmarkIcon />
      {withLabel && action}
    </button>
  );
}

export function ArtworkCard({ artwork, saved, onToggle, onOpen }) {
  return (
    <article className="art-card">
      <div className="art-card__figure">
        <button
          type="button"
          className="art-card__open"
          aria-label={`Открыть «${artwork.title}»`}
          onClick={(event) => onOpen(artwork, event.currentTarget)}
        >
          <img
            src={artUrl(artwork.id)}
            alt={artwork.alt}
            style={{ objectPosition: artwork.imagePosition }}
            width="512"
            height="512"
            loading="lazy"
          />
        </button>
        <FavoriteButton artwork={artwork} saved={saved} onToggle={onToggle} />
      </div>
      <div className="art-card__details">
        <p className="eyebrow">{artwork.medium} · {artwork.year}</p>
        <h3>
          <button type="button" onClick={(event) => onOpen(artwork, event.currentTarget)}>
            {artwork.title}
          </button>
        </h3>
        <p className="art-card__artist">{artwork.artist}</p>
      </div>
    </article>
  );
}

export function ArtworkDialog({ artwork, saved, onToggle, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="art-dialog"
      aria-labelledby="art-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="art-dialog__layout">
        <button type="button" className="close-button" aria-label="Закрыть карточку" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
        <img src={artUrl(artwork.id)} alt={artwork.alt} width="512" height="512" />
        <div className="art-dialog__body">
          <p className="eyebrow">{artwork.category} · {artwork.year}</p>
          <h2 id="art-dialog-title">{artwork.title}</h2>
          <p className="art-dialog__credit">{artwork.artist} · {artwork.medium}</p>
          <p>{artwork.description}</p>
          <FavoriteButton artwork={artwork} saved={saved} onToggle={onToggle} withLabel />
        </div>
      </div>
    </dialog>
  );
}
