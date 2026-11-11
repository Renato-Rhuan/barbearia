/* =========================================================
   MÁFIA BARBER — site responsivo (desktop + mobile)
   Animações: GSAP + ScrollTrigger
   ========================================================= */

const WHATSAPP_NUMERO = '5511987654321';
const WHATSAPP_MSG = 'Olá! Gostaria de agendar um horário na MÁFIA BARBER. Quais são os horários disponíveis para esta semana?';

/* Pré-seleciona o serviço e rola até o formulário */
function prefillService(nome) {
  const select = document.getElementById('servico-select');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.includes(nome) || select.options[i].text.includes(nome)) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
}

/* Divide um texto em palavras mascaradas (preserva spans internos) */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) { frag.append(part); return; }
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const word = document.createElement('span');
          word.className = 'word';
          word.textContent = part;
          mask.append(word);
          frag.append(mask);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        walk(child);
      }
    });
  };
  walk(el);
  return el.querySelectorAll('.word');
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Funcionalidades que não dependem do GSAP ---------- */

  // Links de WhatsApp com a mensagem pronta
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(WHATSAPP_MSG)}`;
  });

  // Data mínima = hoje
  const data = document.getElementById('data');
  if (data) data.min = new Date().toISOString().split('T')[0];

  // Formulário
  const form = document.getElementById('booking-form');
  const feedback = document.getElementById('form-success-feedback');
  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.reset();
      feedback.classList.remove('hidden');
      if (window.gsap) {
        gsap.fromTo(feedback, { autoAlpha: 0, y: 16, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' });
      }
      setTimeout(() => feedback.classList.add('hidden'), 7000);
    });
  }

  // Garante a reprodução do vídeo no mobile
  const video = document.querySelector('.hero-video');
  if (video) { video.muted = true; video.play().catch(() => {}); }

  if (!window.gsap || !window.ScrollTrigger) return; // sem GSAP o site continua visível
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Link ativo no menu (desktop e mobile) ---------- */
  ['hero', 'servicos', 'experiencia-video', 'depoimentos', 'contato'].forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const links = document.querySelectorAll(`.nav-link[href="#${id}"]`);
    ScrollTrigger.create({
      trigger: section, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => links.forEach((l) => l.classList.toggle('is-active', self.isActive))
    });
  });

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {

    /* ========== 1. ENTRADA DO HERO ========== */
    const words = splitWords(document.querySelector('[data-hero="title"]'));

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-video', { scale: 1.25, duration: 2.6, ease: 'power2.out' }, 0)
      .from('.site-header', { yPercent: -100, duration: 0.8 }, 0.1)
      .from('[data-hero="badge"]', { autoAlpha: 0, y: 20, duration: 0.7 }, 0.4)
      .from(words, { yPercent: 115, duration: 1, stagger: 0.08 }, 0.55)
      .from('[data-hero="text"]', { autoAlpha: 0, y: 24, duration: 0.8 }, 1.1)
      .from('[data-hero="cta"]', { autoAlpha: 0, y: 24, scale: 0.94, duration: 0.7, ease: 'back.out(1.8)' }, 1.35)
      .from('[data-hero="image"]', { autoAlpha: 0, y: 40, scale: 0.96, duration: 1 }, 1.45)
      .from('[data-hero="card"]', { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.12 }, 1.7)
      .from('.bottom-nav', { yPercent: 100, duration: 0.8 }, 1.4)
      .from('.floating-wa', { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(2)' }, 2.2);

    /* ========== 2. PARALLAX ========== */
    gsap.to('.hero-video', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.fromTo('[data-hero="image"] .parallax-img',
      { yPercent: -8, scale: 1.15 },
      { yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '[data-hero="image"]', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ========== 3. BARRA DE PROGRESSO ========== */
    gsap.to('#scroll-progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });

    /* ========== 4. REVELAÇÕES AO ROLAR (em lote, com stagger por linha) ========== */
    gsap.set('[data-reveal]', { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
        stagger: 0.12, overwrite: true, clearProps: 'transform'
      })
    });

    // Linha dourada dos títulos
    gsap.utils.toArray('.title-line').forEach((line) => {
      gsap.from(line, {
        scaleX: 0, duration: 1, ease: 'power3.inOut',
        scrollTrigger: { trigger: line, start: 'top 90%', once: true }
      });
    });

    /* ========== 5. IMAGEM DO CLUBE ========== */
    gsap.from('.club-image', {
      clipPath: 'inset(0 100% 0 0 round 8px)', duration: 1.4, ease: 'power4.inOut',
      scrollTrigger: { trigger: '.club-image', start: 'top 85%', once: true }
    });
    gsap.fromTo('.club-image img',
      { scale: 1.3, yPercent: -6 },
      { scale: 1.05, yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.club-image', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ========== 6. CONTADORES ========== */
    gsap.utils.toArray('.counter').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const state = { v: 0 };
      gsap.to(state, {
        v: target, duration: 2, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { el.textContent = prefix + state.v + suffix; },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    /* ========== 7. ESTRELAS ========== */
    gsap.utils.toArray('.stars').forEach((group) => {
      gsap.from(group.children, {
        scale: 0, rotate: -45, duration: 0.5, stagger: 0.08, ease: 'back.out(3)',
        scrollTrigger: { trigger: group, start: 'top 92%', once: true }
      });
    });

    /* ========== 8. BOTÕES: micro-interação ========== */
    document.querySelectorAll('.btn-gold').forEach((btn) => {
      btn.addEventListener('pointerenter', () => gsap.to(btn, { y: -2, duration: 0.25, ease: 'power2.out' }));
      btn.addEventListener('pointerleave', () => gsap.to(btn, { y: 0, duration: 0.25, ease: 'power2.out' }));
    });

    /* ========== 9. HEADER: esconde ao descer, volta ao subir ========== */
    const header = document.querySelector('.site-header');
    if (header) {
      const hide = gsap.to(header, { yPercent: -100, duration: 0.35, ease: 'power2.out', paused: true });
      ScrollTrigger.create({
        start: 120, end: 'max',
        onUpdate: (self) => (self.direction === 1 ? hide.play() : hide.reverse())
      });
    }
  });
});
