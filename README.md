<h1 align="center">Randrianarivo Herinirina Luc Arson</h1>
<p align="center"><b>Lead Developer · Full-stack JavaScript</b><br>
Antananarivo, MG · UTC+3 — <i>Open to work</i></p>

<p align="center">
  <a href="https://lucasrandrianarivo.github.io/LucasRandrianarivo/"><b>→ Voir le portfolio animé</b></a> ·
  <a href="https://www.linkedin.com/in/herinirina-luc-arson">LinkedIn</a> ·
  <a href="mailto:herinirinalucarsonrandrianariv@gmail.com">Email</a>
</p>

---

Développeur full-stack, je conçois et je livre des produits **de bout en bout**, de la base de
données à l'interface. 6 ans passés à construire du **SaaS B2B** aux côtés de SupplyOS
(logistique & e-commerce) m'ont rendu autonome, rapide et adaptable.

- 🧱 **Backend** — Node.js · NestJS · Directus · PostgreSQL · **architecture hexagonale** · tests unit + e2e
- 🎛️ **Frontend** — React · Next.js · TypeScript · React Native · design system maison
- 🤖 **Développement agentique** — Claude Code, skills & sub-agents custom, CLAUDE.md, MCP servers
- 🔌 **Intégrations** — 8 transporteurs, 6 marketplaces, Stripe, DocuSign, Make, Xano
- 🏗️ **Aujourd'hui** — Lead de la refonte **Supply OS V3** ([supplyos.com](https://supplyos.com))

## Ce dépôt

Le portfolio / CV interactif : une page statique **HTML · CSS · JavaScript vanille**, sans
framework ni dépendance, avec un bouton qui génère le CV en **PDF A4 (2 pages)** directement
depuis le navigateur.

```
index.html            page unique (site + document CV imprimable)
assets/css/style.css  design system, animations, thème clair/sombre
assets/css/cv.css     document CV A4 — aperçu écran + feuille d'impression
assets/js/main.js     preloader, split-text, scroll reveal, canvas, export PDF
assets/img/           déposer portrait.jpg ici
```

**En local** — aucun build : ouvrir `index.html`, ou servir le dossier
(`python3 -m http.server 8080`) puis aller sur `http://localhost:8080`.

**Publication** — `Settings → Pages → Source : Deploy from a branch`, branche `main`, dossier `/ (root)`.

**Export PDF** — bouton « Générer mon CV en PDF » → aperçu A4 → « Enregistrer en PDF »
(marges : *Aucune*, cocher *Graphiques d'arrière-plan*).

## Autres projets

**[DevCard](https://github.com/LucasRandrianarivo/devcard)** — React · Vite, sans backend.
Deux outils dans une même app : une carte de stats GitHub exportable en PNG, et un
générateur de CV multilingue (contenu stocké par langue, quatre sections types,
trois templates, réglages de mise en page avec compteur de feuilles, export PDF vectoriel).
