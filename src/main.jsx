import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, ArrowUpRight, Download, Facebook, Instagram, Linkedin, Menu, X, Youtube } from 'lucide-react';
import { categories, featuredPrints, profile, projects } from './portfolioData.js';
import './styles.css';

const visibleCategorySlugs = ['fashion-costume', 'creative-direction', 'research', 'visual-art'];
const findCategory = (slug) => categories.find((category) => category.slug === slug);
const findProject = (slug) => projects.find((project) => project.slug === slug);
const projectsForCategory = (slug) => projects.filter((project) => project.category === slug);
const imageSrc = (image) => (typeof image === 'string' ? image : image?.src);

function youtubeEmbedUrl(url) {
  if (!url) return '';
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  const id = shortMatch?.[1] || watchMatch?.[1];
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : '';
}

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { name: 'home' };
  if (hash === 'about') return { name: 'about' };
  if (hash === 'contact') return { name: 'contact' };
  if (hash.startsWith('project/')) return { name: 'project', slug: hash.replace('project/', '') };
  if (findCategory(hash)) return { name: 'category', slug: hash };
  return { name: 'home' };
}

function routeToHash(nextRoute) {
  if (nextRoute.name === 'home') return '#/';
  if (nextRoute.name === 'about' || nextRoute.name === 'contact') return `#/${nextRoute.name}`;
  if (nextRoute.name === 'project') return `#/project/${nextRoute.slug}`;
  if (nextRoute.name === 'category') return `#/${nextRoute.slug}`;
  return '#/';
}

function App() {
  const [route, setRoute] = useState(() => parseHash());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => setRoute(parseHash());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const navigate = (nextRoute) => {
    setRoute(nextRoute);
    setMenuOpen(false);
    if (window.location.hash !== routeToHash(nextRoute)) {
      window.history.pushState(null, '', routeToHash(nextRoute));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`site-shell route-${route.name}`}>
      <Header route={route} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
      <main>
        {route.name === 'home' && <Home navigate={navigate} />}
        {route.name === 'about' && <About />}
        {route.name === 'contact' && <Contact />}
        {route.name === 'category' && <CategoryPage slug={route.slug} navigate={navigate} />}
        {route.name === 'project' && <ProjectPage slug={route.slug} navigate={navigate} />}
      </main>
    </div>
  );
}

function Header({ route, menuOpen, setMenuOpen, navigate }) {
  const navCategories = visibleCategorySlugs.map(findCategory).filter(Boolean);
  const navItems = [
    { label: 'about', route: { name: 'about' } },
    { label: 'contact', route: { name: 'contact' } },
  ];

  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate({ name: 'home' })} aria-label="go home">
        <img src="/assets/real/home/logo-new.png" alt="nguyen minh hang nora wilde" />
        <span>nguyen minh hang</span>
      </button>
      <nav className="desktop-nav" aria-label="primary">
        {navCategories.map((category) => (
          <NavCategoryItem key={category.slug} category={category} route={route} navigate={navigate} />
        ))}
        {navItems.map((item) => (
          <button key={item.label} className={route.name === item.route.name ? 'is-active' : ''} onClick={() => navigate(item.route)}>
            {item.label}
          </button>
        ))}
      </nav>
      <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="toggle menu">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        {[...navCategories, ...navItems].map((item) => (
          <button
            key={item.slug || item.label}
            onClick={() => navigate(item.route || { name: 'category', slug: item.slug })}
          >
            {item.title || item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function NavCategoryItem({ category, route, navigate }) {
  const categoryProjects = projectsForCategory(category.slug);
  const activeProject = route.name === 'project' ? findProject(route.slug) : null;
  const isActive = route.slug === category.slug || activeProject?.category === category.slug;

  return (
    <div className="nav-category">
      <button
        className={isActive ? 'is-active' : ''}
        onClick={() => navigate({ name: 'category', slug: category.slug })}
      >
        {category.title}
      </button>
      <div className="nav-project-menu">
        {categoryProjects.length ? (
          categoryProjects.map((project) => (
            <button key={project.slug} onClick={() => navigate({ name: 'project', slug: project.slug })}>
              {project.title}
            </button>
          ))
        ) : (
          <span>projects coming soon</span>
        )}
      </div>
    </div>
  );
}

function Home({ navigate }) {
  const [statementLightbox, setStatementLightbox] = useState(null);

  return (
    <section className="home-stage">
      <ScatteredWall navigate={navigate} openStatement={setStatementLightbox} />
      <p className="home-footer-note">interdisciplinary fashion creative</p>
      {statementLightbox && (
        <Lightbox
          images={[statementLightbox.image]}
          index={0}
          title={statementLightbox.title}
          setIndex={() => {}}
          onClose={() => setStatementLightbox(null)}
        />
      )}
    </section>
  );
}

function ScatteredWall({ navigate, openStatement }) {
  const [selectedPrintId, setSelectedPrintId] = useState(null);
  const [zoomedPrint, setZoomedPrint] = useState(null);

  const selectPrint = (id) => {
    setSelectedPrintId(id);
    setZoomedPrint((current) => (current?.id && current.id !== id ? null : current));
  };

  return (
    <div className="scattered-wall" aria-label="interactive portfolio categories">
      {featuredPrints.filter((print) => !print.hidden).map((print, index) => (
        <DraggablePrint
          key={print.id}
          print={print}
          index={index}
          isSelected={selectedPrintId === print.id}
          isZoomed={zoomedPrint?.id === print.id}
          zoomScale={zoomedPrint?.id === print.id ? zoomedPrint.scale : 2}
          navigate={navigate}
          setSelectedPrintId={selectPrint}
          setZoomedPrint={setZoomedPrint}
          openStatement={openStatement}
        />
      ))}
    </div>
  );
}

function DraggablePrint({ print, index, isSelected, isZoomed, zoomScale, navigate, setSelectedPrintId, setZoomedPrint, openStatement }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState(null);
  const buttonRef = useRef(null);
  const movedRef = useRef(false);

  const beginDrag = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    movedRef.current = false;
    setStart({
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    });
  };

  const moveDrag = (event) => {
    if (!dragging || !start) return;
    const nextOffset = {
      x: start.offsetX + event.clientX - start.x,
      y: start.offsetY + event.clientY - start.y,
    };
    if (Math.abs(nextOffset.x - start.offsetX) + Math.abs(nextOffset.y - start.offsetY) > 14) {
      movedRef.current = true;
    }
    setOffset(nextOffset);
  };

  const endDrag = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
    setStart(null);
  };

  const resetMovedFlag = () => {
    if (movedRef.current) {
      window.setTimeout(() => {
        movedRef.current = false;
      }, 0);
      return true;
    }
    return false;
  };

  const zoomPrint = (event) => {
    event?.preventDefault();
    if (resetMovedFlag()) {
      return;
    }
    setSelectedPrintId(print.id);
    setZoomedPrint((current) => {
      if (current?.id === print.id) {
        return null;
      }
      const bounds = buttonRef.current?.getBoundingClientRect();
      const baseWidth = Math.max(bounds?.width || print.width, 1);
      const baseHeight = Math.max(bounds?.height || print.width, 1);
      const fitScale = Math.min(
        (window.innerWidth * 0.78) / baseWidth,
        (window.innerHeight * 0.68) / baseHeight,
        3.8
      );
      return { id: print.id, scale: Math.max(fitScale, 1.18) };
    });
  };

  const selectPrint = () => {
    if (resetMovedFlag()) {
      return;
    }
    setSelectedPrintId(print.id);
  };

  const navigateFromTitle = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (print.route) {
      navigate(print.route);
      return;
    }
    if (print.projectSlug) {
      navigate({ name: 'project', slug: print.projectSlug });
      return;
    }
    if (print.categorySlug) {
      navigate({ name: 'category', slug: print.categorySlug });
      return;
    }
    setSelectedPrintId(print.id);
    openStatement?.({ image: print.image, title: print.title });
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      navigateFromTitle(event);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`print-card print-${index + 1} ${isSelected ? 'is-selected' : ''} ${isZoomed ? 'is-zoomed' : ''} ${dragging ? 'dragging' : ''}`}
      style={{
        '--x': `${print.x + offset.x}px`,
        '--y': `${print.y + offset.y}px`,
        '--r': `${print.rotate}deg`,
        '--w': `${print.width}px`,
        '--zoom-scale': zoomScale,
        '--z': print.z,
      }}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={selectPrint}
      onDoubleClick={zoomPrint}
    >
      <img src={print.image} alt="" draggable="false" decoding="async" />
      <span
        className="print-title"
        role="link"
        tabIndex={isSelected ? 0 : -1}
        onClick={navigateFromTitle}
        onDoubleClick={(event) => event.stopPropagation()}
        onKeyDown={handleTitleKeyDown}
      >
        {print.title}
        <ArrowUpRight size={18} />
      </span>
    </button>
  );
}

function About() {
  return (
    <section className="page about-page mock-page">
      <div className="about-grid">
        <div className="about-copy">
          <h1>about</h1>
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <figure className="portrait-frame">
          <img src="/assets/real/minhhang.png" alt="Nora Wilde portrait" loading="lazy" decoding="async" />
        </figure>
      </div>
      <div className="about-band" aria-hidden="true">
        {['/assets/real/img-1734.png', '/assets/real/img-2340.png', '/assets/real/img-9027.png'].map((image) => (
          <img key={image} src={image} alt="" loading="lazy" decoding="async" />
        ))}
      </div>
    </section>
  );
}

function CategoryPage({ slug, navigate }) {
  const category = findCategory(slug) || categories[0];
  const categoryPrint = featuredPrints.find((print) => print.categorySlug === category.slug);
  const categoryProjects = projectsForCategory(category.slug);
  const standbyProjects = categoryProjects.length
    ? categoryProjects
    : [
        {
          slug: `${category.slug}-standby-1`,
          title: category.title,
          year: 'standby',
          cover: categoryPrint?.image || '/assets/real/portrait-transparent.png',
          isStandby: true,
        },
        {
          slug: `${category.slug}-standby-2`,
          title: category.title,
          year: 'standby',
          cover: '/assets/real/of-us-and-arts.png',
          isStandby: true,
        },
        {
          slug: `${category.slug}-standby-3`,
          title: category.title,
          year: 'standby',
          cover: '/assets/real/vase-transparent.png',
          isStandby: true,
        },
      ];
  const description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae arcu at nisi luctus posuere. Suspendisse potenti, sed tempor justo non massa interdum, in gravida sem facilisis.';

  return (
    <section className="page category-page">
      <PageLabel title={category.title} />
      <p className="category-description">{description}</p>
      <div className="category-layout">
        <div className="project-mosaic">
          {standbyProjects.map((project, index) => (
            <button
              key={project.slug}
              className={`project-tile tile-${index + 1} ${project.isStandby ? 'is-standby' : ''}`}
              onClick={() => {
                if (!project.isStandby) navigate({ name: 'project', slug: project.slug });
              }}
            >
              <img src={project.cover} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectPage({ slug, navigate }) {
  const project = findProject(slug) || projects[0];
  const [lightbox, setLightbox] = useState(null);
  const portfolioImages = project.gallery || [];
  const photoshootImages = project.photoshoot || [];
  const portfolioLabel = project.category === 'visual-art' ? 'visual art' : 'portfolio pages';

  return (
    <section className="project-page">
      <button className="back-button" onClick={() => navigate({ name: 'category', slug: project.category })}>
        <ArrowLeft size={18} />
        back to {findCategory(project.category)?.title}
      </button>
      <div className="project-reader">
        <header className="project-header-block">
          <p>{project.year}</p>
          <h1>{project.title}</h1>
          <h2>{project.subtitle}</h2>
          <p className="project-description">{project.description}</p>
        </header>
        <article className="project-body">
          <ImageGallery images={portfolioImages} imageInfo={project.imageInfo} label={portfolioLabel} title={project.title} setLightbox={setLightbox} />
          <ImageGallery images={photoshootImages} label="photoshoot" title={`${project.title} photoshoot`} setLightbox={setLightbox} />
          <FilmSection project={project} />
          <Credits credits={project.credits} />
        </article>
      </div>
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          imageInfo={lightbox.imageInfo}
          title={lightbox.title}
          setIndex={(index) => setLightbox({ ...lightbox, index })}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}

function ImageGallery({ images, imageInfo, label, title, setLightbox }) {
  if (!images?.length) return null;
  const sectionClass = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <section className={`gallery-section gallery-${sectionClass}`}>
      {label === 'photoshoot' && <h3>{label}</h3>}
      <div className="horizontal-gallery">
        {images.map((image, index) => (
          <button
            key={`${label}-${imageSrc(image)}-${index}`}
            className={`gallery-item ${imageInfo?.[index] ? 'has-caption' : ''}`}
            onClick={() => setLightbox({ images, imageInfo, index, title })}
          >
            <img src={imageSrc(image)} alt="" loading="lazy" decoding="async" />
            {imageInfo?.[index] && (
              <span className="gallery-caption">
                <strong>{imageInfo[index].title}</strong>
                <em>{imageInfo[index].meta}</em>
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function FilmSection({ project }) {
  const [playing, setPlaying] = useState(false);
  if (!project.filmUrl) return null;
  const filmUrl = project.filmUrl;
  const embedUrl = youtubeEmbedUrl(filmUrl);
  const thumbnail = project.filmThumbnail || project.cover || project.gallery?.[0];

  return (
    <section className="film-section">
      <h3>{project.videoTitle || 'fashion film'}</h3>
      <div className="film-player">
        <button type="button" className="film-frame" onClick={() => (embedUrl ? setPlaying(true) : window.open(filmUrl, '_blank', 'noopener'))}>
          {playing && embedUrl ? (
            <iframe src={embedUrl} title={`${project.title} film`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <>
              {thumbnail && <img src={thumbnail} alt="" loading="lazy" decoding="async" />}
              <span className="film-play">play</span>
              <span className="film-controls" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </>
          )}
        </button>
        <div className="film-copy film-copy-link-only">
          <a href={filmUrl} target="_blank" rel="noreferrer">watch on youtube</a>
        </div>
      </div>
    </section>
  );
}

function Credits({ credits }) {
  if (!credits?.length) return null;

  return (
    <section className="credits">
      <h3>project credit</h3>
      <dl>
        {credits.map(([role, value]) => (
          <React.Fragment key={role}>
            <dt>{role}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
}

function Contact() {
  return (
    <section className="page contact-page mock-page">
      <h1 className="contact-title">contact</h1>
      <form className="contact-form" action="mailto:xnorawilde@gmail.com" method="post" encType="text/plain">
        <p className="contact-label">email</p>
        <div className="contact-input-row">
          <label>
            <input name="name" type="text" placeholder="Name" />
          </label>
          <label>
            <input name="email" type="email" placeholder="Email Address" />
          </label>
        </div>
        <label>
          <textarea name="message" aria-label="message" placeholder="Message" rows="6" />
        </label>
        <button type="submit">submit</button>
      </form>
      <div className="contact-lower">
        <div className="contact-card social-card">
          <p>follow</p>
          <div className="social-row">
            <a href="https://www.instagram.com/ailenalein?igsh=bWV3bHRtMXo5OWIz&utm_source=qr" target="_blank" rel="noreferrer" aria-label="instagram">
              <Instagram size={34} />
            </a>
            <a href="https://www.facebook.com/xnorawilde?" target="_blank" rel="noreferrer" aria-label="facebook">
              <Facebook size={34} />
            </a>
            <a href="https://www.linkedin.com/in/hằng-nguyễn-213874316?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noreferrer" aria-label="linkedin">
              <Linkedin size={34} />
            </a>
            <a href="https://youtube.com/@norawilde173?si=2VXX32pGI1B3fY15" target="_blank" rel="noreferrer" aria-label="youtube">
              <Youtube size={34} />
            </a>
          </div>
        </div>
        <div className="contact-card cv-card">
          <p>cv</p>
          <a href="/assets/nora-wilde-cv.pdf" download>
            <Download size={18} />
            download
          </a>
        </div>
      </div>
    </section>
  );
}

function Lightbox({ images, index, imageInfo, title, setIndex, onClose }) {
  const image = images[index];
  const info = imageInfo?.[index];
  const previous = (event) => {
    event.stopPropagation();
    setIndex((index - 1 + images.length) % images.length);
  };
  const next = (event) => {
    event.stopPropagation();
    setIndex((index + 1) % images.length);
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button aria-label="close full screen image">
        <X size={24} />
      </button>
      {images.length > 1 && (
        <button className="lightbox-nav lightbox-prev" aria-label="previous image" onClick={previous}>
          <ArrowLeft size={22} />
        </button>
      )}
      <figure onClick={(event) => event.stopPropagation()}>
        <img src={imageSrc(image)} alt="" />
        <figcaption>
          <strong>{info?.title || title}</strong>
          {info?.meta && <span>{info.meta}</span>}
          <em>{index + 1} / {images.length}</em>
        </figcaption>
      </figure>
      {images.length > 1 && (
        <button className="lightbox-nav lightbox-next" aria-label="next image" onClick={next}>
          <ArrowRight size={22} />
        </button>
      )}
    </div>
  );
}

function PageLabel({ eyebrow, title }) {
  return (
    <div className="page-label">
      {eyebrow && <p>{eyebrow}</p>}
      <h1>{title}</h1>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
