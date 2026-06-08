import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Instagram,
  Linkedin,
  Mail,
  Maximize2,
  Menu,
  Send,
  X,
} from 'lucide-react';
import { categories, featuredPrints, profile, projects } from './portfolioData.js';
import './styles.css';

const findCategory = (slug) => categories.find((category) => category.slug === slug);
const findProject = (slug) => projects.find((project) => project.slug === slug);

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
    <div className="site-shell">
      <Header route={route} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
      <main>
        {route.name === 'home' && <Home navigate={navigate} />}
        {route.name === 'about' && <About />}
        {route.name === 'contact' && <Contact />}
        {route.name === 'category' && <CategoryPage slug={route.slug} navigate={navigate} />}
        {route.name === 'project' && <ProjectPage slug={route.slug} navigate={navigate} />}
      </main>
      <CursorWash />
    </div>
  );
}

function Header({ route, menuOpen, setMenuOpen, navigate }) {
  const navItems = [
    { label: 'about', route: { name: 'about' } },
    { label: 'contact', route: { name: 'contact' } },
  ];

  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate({ name: 'home' })} aria-label="go home">
        <span>nguyen minh hang</span>
        <span>nora wilde</span>
      </button>
      <nav className="desktop-nav" aria-label="primary">
        {categories.slice(0, 7).map((category) => (
          <button
            key={category.slug}
            className={route.slug === category.slug ? 'is-active' : ''}
            onClick={() => navigate({ name: 'category', slug: category.slug })}
          >
            {category.title}
          </button>
        ))}
        {navItems.map((item) => (
          <button key={item.label} onClick={() => navigate(item.route)}>
            {item.label}
          </button>
        ))}
      </nav>
      <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="toggle menu">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        {[...categories, ...navItems].map((item) => (
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

function Home({ navigate }) {
  return (
    <section className="home-stage">
      <div className="home-intro">
        <p>fashion & costume / creative direction / visual storytelling</p>
        <h1>nora wilde</h1>
      </div>
      <ScatteredWall navigate={navigate} />
      <div className="home-footer-note">
        <span>drag the prints</span>
        <span>hover to reveal</span>
        <span>click to enter</span>
      </div>
    </section>
  );
}

function ScatteredWall({ navigate }) {
  return (
    <div className="scattered-wall" aria-label="interactive portfolio categories">
      {featuredPrints.map((print, index) => (
        <DraggablePrint key={print.id} print={print} index={index} navigate={navigate} />
      ))}
    </div>
  );
}

function DraggablePrint({ print, index, navigate }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState(null);
  const movedRef = useRef(false);

  const beginDrag = (event) => {
    event.preventDefault();
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

  const endDrag = () => {
    setDragging(false);
    setStart(null);
  };

  const open = () => {
    if (movedRef.current) {
      window.setTimeout(() => {
        movedRef.current = false;
      }, 0);
      return;
    }
    navigate(print.projectSlug ? { name: 'project', slug: print.projectSlug } : { name: 'category', slug: print.categorySlug });
  };

  return (
    <button
      className={`print-card print-${index + 1} ${dragging ? 'dragging' : ''}`}
      style={{
        '--x': `${print.x + offset.x}px`,
        '--y': `${print.y + offset.y}px`,
        '--r': `${print.rotate}deg`,
        '--w': `${print.width}px`,
        '--z': print.z,
      }}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={open}
    >
      <img src={print.image} alt="" draggable="false" />
      <span className="print-title">
        {print.title}
        <ArrowUpRight size={18} />
      </span>
    </button>
  );
}

function About() {
  return (
    <section className="page about-page">
      <PageLabel eyebrow="about" title="an interdisciplinary fashion creative shaped by craft, culture and friction." />
      <div className="about-grid">
        <figure className="portrait-frame">
          <img src="/assets/nora-portrait.svg" alt="Nora Wilde portrait collage" />
          <figcaption>hanoi, vietnam / fashion, film, theatre, cultural production</figcaption>
        </figure>
        <div className="about-copy">
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryPage({ slug, navigate }) {
  const category = findCategory(slug) || categories[0];
  const categoryProjects = projects.filter((project) => project.category === category.slug);

  return (
    <section className="page category-page">
      <PageLabel eyebrow="projects" title={category.title} />
      <div className="category-layout">
        <aside className="category-note">
          <p>{category.description}</p>
          <span>{categoryProjects.length || 'open'} entries</span>
        </aside>
        <div className="project-mosaic">
          {categoryProjects.map((project, index) => (
            <button
              key={project.slug}
              className={`project-tile tile-${index + 1}`}
              onClick={() => navigate({ name: 'project', slug: project.slug })}
            >
              <img src={project.cover} alt="" />
              <span>
                <strong>{project.title}</strong>
                <em>{project.year}</em>
              </span>
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

  return (
    <section className="project-page">
      <button className="back-button" onClick={() => navigate({ name: 'category', slug: project.category })}>
        <ArrowLeft size={18} />
        back to {findCategory(project.category)?.title}
      </button>
      <div className="project-reader">
        <aside className="project-sticky">
          <p>{project.year}</p>
          <h1>{project.title}</h1>
          <h2>{project.subtitle}</h2>
        </aside>
        <article className="project-body">
          <p className="project-description">{project.description}</p>
          <HorizontalGallery project={project} setLightbox={setLightbox} />
          <Credits credits={project.credits} />
        </article>
      </div>
      {lightbox && <Lightbox image={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}

function HorizontalGallery({ project, setLightbox }) {
  return (
    <section className="gallery-section">
      <div className="section-heading">
        <span>portfolio pages</span>
        <span>scroll sideways</span>
      </div>
      <div className="horizontal-gallery">
        {project.gallery.map((image, index) => (
          <button key={`${project.slug}-${index}`} className="gallery-item" onClick={() => setLightbox(image)}>
            <img src={image} alt="" />
            <span>
              <Maximize2 size={15} />
            </span>
          </button>
        ))}
      </div>
      {project.videoTitle && (
        <div className="film-strip">
          <span>{project.videoTitle}</span>
          <div />
        </div>
      )}
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
    <section className="page contact-page">
      <PageLabel eyebrow="contact" title="for commissions, collaborations and soft chaos with intention." />
      <div className="contact-grid">
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>name</span>
            <input type="text" placeholder="your name" />
          </label>
          <label>
            <span>email</span>
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            <span>message</span>
            <textarea placeholder="tell nora about the project" rows="6" />
          </label>
          <button type="submit">
            <Send size={18} />
            send
          </button>
        </form>
        <div className="contact-card">
          <a href="mailto:nguyenminhhang.norawilde@gmail.com">
            <Mail size={18} />
            nguyenminhhang.norawilde@gmail.com
          </a>
          <a href="#" aria-label="instagram">
            <Instagram size={18} />
            instagram
          </a>
          <a href="#" aria-label="linkedin">
            <Linkedin size={18} />
            linkedin
          </a>
          <a href="/assets/nora-wilde-cv-placeholder.pdf" download>
            <Download size={18} />
            download cv
          </a>
        </div>
      </div>
    </section>
  );
}

function Lightbox({ image, onClose }) {
  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button aria-label="close full screen image">
        <X size={24} />
      </button>
      <img src={image} alt="" />
    </div>
  );
}

function PageLabel({ eyebrow, title }) {
  return (
    <div className="page-label">
      <p>{eyebrow}</p>
      <h1>{title}</h1>
    </div>
  );
}

function CursorWash() {
  const style = useMemo(() => ({ '--delay': `${Math.random() * 2}s` }), []);
  return <div className="cursor-wash" style={style} />;
}

createRoot(document.getElementById('root')).render(<App />);
