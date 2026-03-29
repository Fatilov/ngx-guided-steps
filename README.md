# ngx-guided-steps

[![npm version](https://img.shields.io/npm/v/ngx-guided-steps.svg)](https://www.npmjs.com/package/ngx-guided-steps)
[![license](https://img.shields.io/npm/l/ngx-guided-steps.svg)](https://github.com/fatilov/ngx-guided-steps/blob/master/LICENSE.md)
[![Angular](https://img.shields.io/badge/Angular-18%2B-dd0031.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-pure-3178c6.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()

> Bibliotheque Angular 18+ de tutoriels interactifs. TypeScript pur, zero dependance jQuery.
> Overlays SVG, fleches animees, support mobile complet, accessibilite WCAG.

Inspiree de [EnjoyHint](https://github.com/xbsoftware/enjoyhint), reconstruite from scratch avec des composants standalone Angular.

**[Demo en ligne](https://ngx-guided-steps.vercel.app/)** | **[Changelog](https://github.com/fatilov/ngx-guided-steps/releases)**

---

## Table des matieres

1. [Prerequis](#prerequis)
2. [Installation](#installation)
3. [Demarrage rapide](#demarrage-rapide)
4. [Configuration globale](#configuration-globale)
5. [Configuration dynamique (setConfig)](#configuration-dynamique-setconfig)
6. [Definir les etapes](#definir-les-etapes)
7. [Types d'evenements](#types-devenements)
8. [Navigation clavier](#navigation-clavier)
9. [Auto-avance (countdown)](#auto-avance-countdown)
10. [Personnalisation des boutons](#personnalisation-des-boutons)
11. [Formes de decoupe (rect / circle)](#formes-de-decoupe)
12. [Navigation cross-routes](#navigation-cross-routes)
13. [Support des modals](#support-des-modals)
14. [Attente d'elements (waitForSelector)](#attente-delements-waitforselector)
15. [Callbacks et Observables](#callbacks-et-observables)
16. [API programmatique](#api-programmatique)
17. [Internationalisation (i18n)](#internationalisation-i18n)
18. [Themes (light / dark)](#themes)
19. [CSS Custom Properties](#css-custom-properties)
20. [Accessibilite (WCAG)](#accessibilite-wcag)
21. [Exemples complets](#exemples-complets)
22. [Publication npm](#publication-npm)
23. [Reference API](#reference-api)
24. [License](#license)

---

## Prerequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20+ |
| Angular | 18+ |
| RxJS | 7+ |

---

## Installation

### Depuis npm

```bash
npm install ngx-guided-steps
```

### Depuis GitHub (developpement)

```bash
git clone https://github.com/fatilov/ngx-guided-steps.git
cd ngx-guided-steps
npm install --legacy-peer-deps
npm run build:lib    # Build de la bibliotheque
npm run build        # Build de l'app demo
npm test             # Tests unitaires (Jest)
```

---

## Demarrage rapide

### Etape 1 : Installer le package

```bash
npm install ngx-guided-steps
```

### Etape 2 : Configurer le provider (optionnel)

Creez ou modifiez votre fichier `app.config.ts` :

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideGuidedSteps } from 'ngx-guided-steps';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration optionnelle - les valeurs par defaut fonctionnent deja
    provideGuidedSteps({
      showProgress: true,       // Affiche "1 / 5" sur chaque etape
      keyboardNav: true,        // Navigation avec fleches (defaut: true)
    }),
  ],
};
```

> **Note :** Sans `provideGuidedSteps()`, la bibliotheque utilise les valeurs par defaut. Le service est `providedIn: 'root'`, donc aucun provider supplementaire n'est requis pour le cas simple.

### Etape 3 : Injecter le service et lancer un tour

```typescript
// src/app/app.component.ts
import { Component, inject } from '@angular/core';
import { GuidedStepsService, GuidedStep } from 'ngx-guided-steps';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <header id="header">Mon Application</header>
    <nav id="nav">Navigation</nav>
    <main id="content">Contenu</main>
    <button (click)="startTour()">Lancer le tutoriel</button>
  `,
})
export class AppComponent {
  private hint = inject(GuidedStepsService);

  startTour(): void {
    const steps: GuidedStep[] = [
      {
        selector: '#header',
        description: '<b>Bienvenue !</b><br>Voici le header de l\'application.',
        eventType: 'next',
      },
      {
        selector: '#nav',
        description: 'La barre de navigation vous permet d\'acceder aux differentes sections.',
        eventType: 'next',
      },
      {
        selector: '#content',
        description: 'Le contenu principal s\'affiche ici. C\'est termine !',
        eventType: 'next',
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => console.log('Tour demarre'),
      onEnd: () => console.log('Tour termine'),
      onSkip: () => console.log('Tour passe'),
    });
  }
}
```

**C'est tout !** L'overlay SVG, les fleches, les boutons et les animations sont geres automatiquement.

---

## Configuration globale

La configuration globale se fait via `provideGuidedSteps()` ou le token `GUIDED_STEPS_CONFIG` :

```typescript
// Methode 1 : provideGuidedSteps (recommande)
provideGuidedSteps({
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 2000,
  animationTime: 600,
  showProgress: true,
  theme: 'light',
  keyboardNav: true,
  backdropDismiss: false,
  labels: {
    next: 'Suivant',
    prev: 'Precedent',
    skip: 'Passer',
    close: 'Fermer',
  },
})

// Methode 2 : Injection token directe
import { GUIDED_STEPS_CONFIG } from 'ngx-guided-steps';

providers: [
  {
    provide: GUIDED_STEPS_CONFIG,
    useValue: { showProgress: true, theme: 'dark' }
  }
]
```

### Options de configuration

| Option | Type | Defaut | Description |
|--------|------|--------|-------------|
| `backgroundColor` | `string` | `'rgba(0,0,0,0.6)'` | Couleur du fond de l'overlay |
| `zIndex` | `number` | `1010` | Z-index de base de l'overlay |
| `animationTime` | `number` | `800` | Duree d'animation en ms |
| `showProgress` | `boolean` | `false` | Affiche l'indicateur de progression (ex: "2 / 5") |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme visuel (light pour overlay sombre, dark pour overlay clair) |
| `keyboardNav` | `boolean` | `true` | Active la navigation par fleches gauche/droite |
| `backdropDismiss` | `boolean` | `false` | Permet de fermer le tour en cliquant sur l'overlay |
| `labels` | `GuidedStepsLabels` | voir [i18n](#internationalisation-i18n) | Textes personnalisables |

---

## Configuration dynamique (setConfig)

`setConfig()` permet de modifier la configuration **en cours de tour** (theme, labels, progress...). Les changements sont appliques immediatement a l'overlay :

```typescript
// Changer le theme et les labels a mi-parcours
this.hint.setConfig({
  theme: 'dark',
  backgroundColor: 'rgba(255,255,255,0.85)',
  showProgress: true,
  labels: {
    next: 'Next',
    prev: 'Previous',
    skip: 'Skip',
    progress: '{{current}} of {{total}}',
  },
});
```

### Cas d'usage typiques

**Changer de langue dynamiquement :**

```typescript
{
  selector: '#lang-switch',
  description: 'Labels switched to <b>English</b>.',
  onBeforeStart: () => {
    this.hint.setConfig({
      showProgress: true,
      labels: { next: 'Next', prev: 'Previous', skip: 'Skip', progress: '{{current}} of {{total}}' },
    });
  },
}
```

**Basculer le theme en cours de tour :**

```typescript
{
  selector: '#dark-section',
  description: 'Dark theme activé.',
  onBeforeStart: () => {
    this.hint.setConfig({
      theme: 'dark',
      backgroundColor: 'rgba(255,255,255,0.85)',
    });
  },
}
```

> **Note :** `setConfig()` fusionne les overrides avec la config globale fournie via `provideGuidedSteps()`. Chaque appel repart de la config de base.

---

## Definir les etapes

Chaque etape est un objet `GuidedStep`. Seuls `selector` et `description` sont requis :

```typescript
const steps: GuidedStep[] = [
  {
    selector: '#mon-element',           // Selecteur CSS de l'element a mettre en valeur
    description: 'Texte <b>HTML</b>',   // Description affichee (supporte le HTML)
    eventType: 'next',                  // Comment passer a l'etape suivante
  },
];
```

### Toutes les proprietes d'une etape

| Propriete | Type | Defaut | Description |
|-----------|------|--------|-------------|
| `selector` | `string` | **requis** | Selecteur CSS de l'element cible |
| `description` | `string` | **requis** | Contenu HTML du hint |
| `shape` | `'rect' \| 'circle'` | `'rect'` | Forme de la decoupe |
| `radius` | `number` | auto | Rayon du cercle ou border-radius du rectangle |
| `margin` | `number` | `10` | Marge autour de l'element en px |
| `eventType` | `string` | `'next'` | Type d'evenement pour avancer (voir section dediee) |
| `eventSelector` | `string` | - | Selecteur alternatif pour l'evenement click |
| `key` | `string` | - | Nom de la touche pour `eventType: 'key'` |
| `showNext` | `boolean` | depend | Afficher le bouton Suivant |
| `showPrev` | `boolean` | depend | Afficher le bouton Precedent |
| `showSkip` | `boolean` | `true` | Afficher le bouton Passer |
| `timeout` | `number` | - | Delai en ms avant d'afficher cette etape |
| `scrollAnimationSpeed` | `number` | `250` | Vitesse du scroll en ms |
| `autoAdvance` | `number` | - | Avance automatiquement apres N ms (avec countdown) |
| `arrowColor` | `string` | `'white'` | Couleur de la fleche (CSS) |
| `nextButton` | `StepButtonConfig` | - | Config du bouton Suivant |
| `prevButton` | `StepButtonConfig` | - | Config du bouton Precedent |
| `skipButton` | `StepButtonConfig` | - | Config du bouton Passer |
| `route` | `string` | - | Route Angular vers laquelle naviguer avant cette etape |
| `waitForSelector` | `boolean \| number` | - | Attend que l'element apparaisse (true = 10s, nombre = ms) |
| `top/bottom/left/right` | `number` | `0` | Ajustements de la decoupe |
| `onBeforeStart` | `() => void \| Promise<void>` | - | Callback avant le debut de l'etape (supporte async) |
| `onNext` | `() => void` | - | Callback quand Suivant est clique |
| `onPrev` | `() => void` | - | Callback quand Precedent est clique |
| `onSkip` | `() => void` | - | Callback quand Passer est clique |

---

## Types d'evenements

L'option `eventType` definit comment l'utilisateur passe a l'etape suivante :

### `'next'` (defaut)

L'utilisateur clique sur le bouton **Suivant** :

```typescript
{
  selector: '#element',
  description: 'Cliquez sur Suivant pour continuer.',
  eventType: 'next',
}
```

### `'click'`

L'utilisateur **clique sur l'element** mis en valeur :

```typescript
{
  selector: '#bouton-action',
  description: 'Cliquez sur ce bouton pour continuer.',
  eventType: 'click',
  showNext: false, // Cache le bouton Suivant
}
```

Pour ecouter le clic sur un autre element :

```typescript
{
  selector: '#zone-info',
  description: 'Cliquez sur le bouton a droite.',
  eventType: 'click',
  eventSelector: '#autre-bouton', // Le clic est ecoute ici
  showNext: false,
}
```

### `'key'`

L'utilisateur appuie sur une **touche specifique** :

```typescript
{
  selector: '#champ-recherche',
  description: 'Appuyez sur <b>Entree</b> pour valider.',
  eventType: 'key',
  key: 'Enter',     // Nom de la touche (KeyboardEvent.key)
  showNext: false,
}
```

### `'custom'`

Avance uniquement par appel programmatique via `trigger()` ou `next()` :

```typescript
{
  selector: '#zone-attente',
  description: 'Attendez le chargement...',
  eventType: 'custom',
  showNext: false,
}

// Plus tard, dans le code :
this.hint.trigger('myEvent'); // Avance si l'etape courante est "custom"
// ou
this.hint.next(); // Avance toujours
```

### `'auto'`

Simule un clic sur l'element et avance **immediatement** :

```typescript
{
  selector: '#bouton-auto',
  description: '', // Pas affiche car l'etape est instantanee
  eventType: 'auto',
}
```

---

## Navigation clavier

Par defaut, la navigation clavier est activee (`keyboardNav: true`) :

| Touche | Action |
|--------|--------|
| `→` (fleche droite) | Etape suivante |
| `←` (fleche gauche) | Etape precedente |
| `Escape` | Fermer le tour (toujours actif) |
| `Tab` / `Shift+Tab` | Cycle entre les boutons (focus trap) |

Pour desactiver les fleches :

```typescript
provideGuidedSteps({ keyboardNav: false })
```

---

## Auto-avance (countdown)

Ajoutez `autoAdvance` a une etape pour qu'elle avance automatiquement apres un delai. Un compteur a rebours s'affiche :

```typescript
{
  selector: '#element',
  description: 'Cette etape avance automatiquement dans 5 secondes.',
  eventType: 'next',
  autoAdvance: 5000,  // 5 secondes
}
```

Le countdown est **annule** si l'utilisateur interagit manuellement (clic sur Suivant, Precedent, Passer, ou navigation clavier).

---

## Personnalisation des boutons

### Texte et classe CSS par etape

```typescript
{
  selector: '#element',
  description: 'Boutons personnalises.',
  eventType: 'next',
  nextButton: { text: 'Continuer >>', className: 'mon-btn-next' },
  prevButton: { text: '<< Retour', className: 'mon-btn-prev' },
  skipButton: { text: 'Quitter', className: 'mon-btn-skip' },
}
```

### Visibilite des boutons

```typescript
{
  selector: '#element',
  description: 'Sans bouton Passer.',
  eventType: 'next',
  showSkip: false,   // Cache le bouton Passer
  showPrev: true,    // Force l'affichage de Precedent
}
```

Par defaut :
- **Next** : visible si `eventType === 'next'`
- **Prev** : visible sauf sur la premiere etape
- **Skip** : toujours visible

---

## Formes de decoupe

### Rectangle (defaut)

```typescript
{
  selector: '#card',
  description: 'Decoupe rectangulaire.',
  shape: 'rect',
  margin: 20,     // Marge autour de l'element
  radius: 10,     // Border-radius de la decoupe
}
```

### Cercle

```typescript
{
  selector: '#avatar',
  description: 'Decoupe circulaire.',
  shape: 'circle',
  radius: 40,     // Rayon du cercle (auto si omis)
}
```

### Ajustement des offsets

```typescript
{
  selector: '#element',
  description: 'Decoupe decalee.',
  top: -10,       // Decale la decoupe vers le haut
  left: -15,
  right: -15,
  bottom: -10,
}
```

---

## Callbacks et Observables

### Callbacks globaux (sur `run()`)

```typescript
this.hint.run({
  onStart: () => console.log('Tour demarre'),
  onEnd: () => console.log('Tour termine (derniere etape passee)'),
  onSkip: () => console.log('Tour passe par l\'utilisateur'),
  onNext: () => console.log('Transition vers l\'etape suivante'),
});
```

### Callbacks par etape

```typescript
{
  selector: '#element',
  description: 'Etape avec callbacks.',
  onBeforeStart: () => console.log('Avant affichage de cette etape'),
  onNext: () => console.log('Suivant clique sur cette etape'),
  onPrev: () => console.log('Precedent clique sur cette etape'),
  onSkip: () => console.log('Passer clique sur cette etape'),
}
```

### Observables RxJS

```typescript
import { GuidedStepsService } from 'ngx-guided-steps';

export class AppComponent implements OnDestroy {
  private hint = inject(GuidedStepsService);
  private subs: Subscription[] = [];

  constructor() {
    this.subs.push(
      this.hint.onStepChange.subscribe(({ index, step }) => {
        console.log(`Etape ${index + 1}: ${step.selector}`);
      }),
      this.hint.onEnd.subscribe(() => {
        console.log('Tour termine');
      }),
      this.hint.onSkip.subscribe(() => {
        console.log('Tour passe');
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
```

---

## API programmatique

### Methodes du service

```typescript
const hint = inject(GuidedStepsService);

// Configurer les etapes
hint.setSteps(steps);

// Verifier que tous les selecteurs existent dans le DOM
const missing = hint.validateSteps();
if (missing.length > 0) {
  console.warn('Selecteurs manquants:', missing);
}

// Lancer le tour
hint.run({ onEnd: () => console.log('Fini') });

// Navigation programmatique
hint.next();                    // Etape suivante
hint.prev();                    // Etape precedente
hint.trigger('next');           // Equivalent a next()
hint.trigger('skip');           // Equivalent a skip
hint.trigger('customEvent');    // Avance si etape courante est "custom"

// Controle avance
hint.reRun(2);                  // Relance depuis l'etape 2
hint.setCurrentStep(3);         // Change l'index sans executer
hint.getCurrentStep();          // Retourne l'index courant
hint.isRunning;                 // true si le tour est actif
hint.stop();                    // Arrete et supprime l'overlay
hint.resume();                  // Reprend le tour depuis l'etape courante
```

---

## Internationalisation (i18n)

Tous les textes de l'interface sont configurables via `labels` :

```typescript
provideGuidedSteps({
  labels: {
    next: 'Suivant',
    prev: 'Precedent',
    skip: 'Passer',
    close: 'Fermer le tutoriel',
    progress: 'Etape {{current}} sur {{total}}',
    stepLabel: 'Etape {{current}} sur {{total}}',
    stepAnnouncement: 'Etape {{current}} sur {{total}} : {{description}}',
  },
})
```

### Variables disponibles dans les templates

| Variable | Description |
|----------|-------------|
| `{{current}}` | Numero de l'etape courante (commence a 1) |
| `{{total}}` | Nombre total d'etapes |
| `{{description}}` | Texte brut de la description (HTML supprime) |

### Labels par defaut

| Label | Defaut |
|-------|--------|
| `next` | `'Next'` |
| `prev` | `'Previous'` |
| `skip` | `'Skip'` |
| `close` | `'Close tutorial'` |
| `progress` | `'{{current}} / {{total}}'` |
| `stepLabel` | `'Step {{current}} of {{total}}'` |
| `stepAnnouncement` | `'Step {{current}} of {{total}}: {{description}}'` |

---

## Themes

### Light (defaut)

Pour les overlays sombres. Boutons et textes clairs :

```typescript
provideGuidedSteps({
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  theme: 'light',
})
```

### Dark

Pour les overlays clairs. Boutons et textes sombres :

```typescript
provideGuidedSteps({
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  theme: 'dark',
})
```

Le theme dark inverse automatiquement :
- Couleur des boutons (`--ngs-btn-color: #333`)
- Couleur du texte (`--ngs-label-color: #222`)
- Couleur du bouton fermer (`--ngs-close-btn-color: #555`)
- Fond des labels oversized (`--ngs-oversized-bg: #e8e8e8`)
- Couleur du focus outline (`#333` au lieu de `white`)

---

## CSS Custom Properties

Personnalisez l'apparence via des variables CSS sur le composant `ngs-overlay` :

```css
/* Dans votre styles.css ou styles.scss global */
ngs-overlay {
  --ngs-btn-color: #6c63ff;
  --ngs-btn-hover-color: white;
  --ngs-label-color: #f0f0f0;
  --ngs-label-font-size: 18px;
  --ngs-label-font-family: 'Inter', sans-serif;
  --ngs-close-btn-color: #6c63ff;
  --ngs-oversized-bg: #1a1a2e;
}
```

### Liste des variables

| Variable | Defaut (light) | Defaut (dark) | Description |
|----------|---------------|---------------|-------------|
| `--ngs-btn-color` | `rgb(30, 205, 151)` | `#333` | Bordure et texte des boutons |
| `--ngs-btn-hover-color` | `white` | `white` | Texte des boutons au hover |
| `--ngs-label-color` | `white` | `#222` | Couleur du texte du label |
| `--ngs-label-font-size` | `22px` | `22px` | Taille de police du label |
| `--ngs-label-font-family` | `'Segoe UI', Arial, sans-serif` | idem | Police du label |
| `--ngs-close-btn-color` | `rgba(33, 224, 163, 1)` | `#555` | Bordure du bouton fermer |
| `--ngs-oversized-bg` | `#272A26` | `#e8e8e8` | Fond du label quand l'element est tres grand |

---

## Accessibilite (WCAG)

La bibliotheque inclut nativement :

- **`role="dialog"`** et **`aria-modal="true"`** sur l'overlay
- **`aria-label`** dynamique sur le dialog (configurable via `labels.stepLabel`)
- **`aria-live="polite"`** pour les annonces de changement d'etape aux lecteurs d'ecran
- **Focus trap** : `Tab` / `Shift+Tab` restent dans l'overlay
- **`Escape`** pour fermer le tour
- **`:focus-visible`** avec outline visible sur tous les boutons
- **`<button type="button">`** semantiques (pas de `<div>`)
- **`.ngs-sr-only`** pour le contenu reserve aux lecteurs d'ecran

---

## Exemples complets

### Tour basique avec progression

```typescript
startTour(): void {
  this.hint.setSteps([
    { selector: '#header', description: 'Le header.', eventType: 'next' },
    { selector: '#nav', description: 'La navigation.', eventType: 'next', showPrev: true },
    { selector: '#footer', description: 'Le footer.', eventType: 'next', showPrev: true },
  ]);
  this.hint.run({
    onEnd: () => this.markTourCompleted(),
  });
}
```

### Tour interactif avec click et key

```typescript
const steps: GuidedStep[] = [
  {
    selector: '#search-input',
    description: 'Tapez votre recherche ici.',
    eventType: 'next',
  },
  {
    selector: '#search-btn',
    description: 'Cliquez sur <b>Rechercher</b>.',
    eventType: 'click',
    showNext: false,
  },
  {
    selector: '#result-input',
    description: 'Appuyez sur <b>Entree</b> pour valider.',
    eventType: 'key',
    key: 'Enter',
    showNext: false,
  },
];
```

### Tour avec auto-avance et couleurs

```typescript
const steps: GuidedStep[] = [
  {
    selector: '#step1',
    description: 'Avance auto dans 3s.',
    autoAdvance: 3000,
    arrowColor: '#ff6b6b',
  },
  {
    selector: '#step2',
    description: 'Decoupe circulaire.',
    shape: 'circle',
    arrowColor: '#ffa726',
  },
  {
    selector: '#step3',
    description: 'Avec timeout.',
    timeout: 500,
    onBeforeStart: () => console.log('Chargement...'),
    onNext: () => console.log('Etape validee !'),
  },
];
```

### Configuration complete en francais

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideGuidedSteps } from 'ngx-guided-steps';

export const appConfig: ApplicationConfig = {
  providers: [
    provideGuidedSteps({
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      showProgress: true,
      keyboardNav: true,
      backdropDismiss: false,
      labels: {
        next: 'Suivant',
        prev: 'Precedent',
        skip: 'Passer',
        close: 'Fermer le tutoriel',
        progress: 'Etape {{current}} sur {{total}}',
        stepLabel: 'Etape {{current}} sur {{total}}',
        stepAnnouncement: 'Etape {{current}} sur {{total}} : {{description}}',
      },
    }),
  ],
};
```

---

## Navigation cross-routes

ngx-guided-steps peut naviguer entre les routes Angular pendant un tour. Chaque étape peut spécifier une route cible :

### Etape 1 : Fournir le Router

```typescript
// app.config.ts
import { Router } from '@angular/router';
import { provideGuidedSteps, GUIDED_STEPS_ROUTER } from 'ngx-guided-steps';

export const appConfig: ApplicationConfig = {
  providers: [
    provideGuidedSteps({ showProgress: true }),
    { provide: GUIDED_STEPS_ROUTER, useExisting: Router },
  ],
};
```

### Etape 2 : Utiliser `route` dans les étapes

```typescript
const steps: GuidedStep[] = [
  {
    selector: '#dashboard-header',
    description: 'Bienvenue sur le tableau de bord.',
    route: '/dashboard',        // Navigue vers /dashboard avant d'afficher
    waitForSelector: true,      // Attend que l'élément apparaisse
  },
  {
    selector: '#settings-form',
    description: 'Configurez vos paramètres ici.',
    route: '/settings',
    waitForSelector: 3000,      // Attend max 3 secondes
  },
  {
    selector: '#home-hero',
    description: 'De retour sur l\'accueil !',
    route: '/',
    waitForSelector: true,
  },
];
```

---

## Support des modals

Pour cibler des éléments dans des modals (Material Dialog, CDK Overlay, etc.), utilisez `waitForSelector` combiné avec `onBeforeStart` :

```typescript
const steps: GuidedStep[] = [
  {
    selector: '#open-dialog-btn',
    description: 'Cliquez pour ouvrir le formulaire.',
    eventType: 'click',
    showNext: false,
  },
  {
    selector: '.mat-dialog-container #form-field',
    description: 'Remplissez ce champ dans le modal.',
    waitForSelector: true,   // Attend que le modal soit rendu
    eventType: 'next',
  },
];
```

### Avec `onBeforeStart` asynchrone

Pour ouvrir un modal programmatiquement avant l'étape :

```typescript
{
  selector: '.cdk-overlay-container .dialog-content',
  description: 'Voici le contenu du modal.',
  waitForSelector: 5000,
  onBeforeStart: async () => {
    // Ouvre le modal et attend qu'il soit prêt
    const dialogRef = this.dialog.open(MyDialogComponent);
    await firstValueFrom(dialogRef.afterOpened());
  },
}
```

---

## Attente d'éléments (waitForSelector)

Par défaut, si un élément n'existe pas dans le DOM, le tour s'arrête. `waitForSelector` active un mécanisme de polling :

| Valeur | Comportement |
|--------|-------------|
| `false` ou omis | Échec immédiat si absent (comportement par défaut) |
| `true` | Poll toutes les 200ms pendant max 10 secondes |
| `number` (ex: `5000`) | Poll toutes les 200ms pendant max N millisecondes |

```typescript
{
  selector: '#element-dynamique',
  description: 'Cet élément est chargé en lazy.',
  waitForSelector: true,      // Attend jusqu'à 10s
}

{
  selector: '#element-lent',
  description: 'Cet élément met du temps à charger.',
  waitForSelector: 15000,     // Attend jusqu'à 15s
}
```

Le polling est automatiquement annulé si le tour est stoppé (`stop()`) ou si l'utilisateur appuie sur Échap.

---

## Publication npm

La bibliotheque est publiee automatiquement sur npm via GitHub Actions lors de la creation d'une release.

### Prerequis

1. Creez un token npm : [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) (type "Automation")
2. Ajoutez le secret `NPM_TOKEN` dans votre repo GitHub : **Settings > Secrets > Actions**

### Publier une nouvelle version

1. Mettez a jour la version dans `projects/ngx-guided-steps/package.json`
2. Commitez et poussez sur `master`
3. Creez une release GitHub :
   ```bash
   gh release create v1.1.0 --title "v1.1.0" --notes "Voir CHANGELOG.md"
   ```
4. Le workflow `.github/workflows/publish.yml` se declenche automatiquement :
   - Installe les dependances
   - Lance les tests
   - Build la bibliotheque
   - Publie sur npm avec `--access public`

### Publication manuelle

```bash
npm run build:lib
cd dist/ngx-guided-steps
npm publish --access public
```

---

## Reference API

### GuidedStepsService

| Methode | Description |
|---------|-------------|
| `setConfig(overrides)` | Override la config pour le prochain tour ou en cours de tour |
| `setSteps(steps)` | Definit les etapes du tour |
| `validateSteps(): string[]` | Retourne les selecteurs absents du DOM |
| `run(events?)` | Demarre le tour depuis le debut |
| `stop()` | Arrete et supprime l'overlay |
| `next()` | Etape suivante |
| `prev()` | Etape precedente |
| `resume()` | Reprend depuis l'etape courante |
| `reRun(stepIndex)` | Relance depuis une etape specifique |
| `trigger(eventName)` | Declenche un evenement (avance les etapes `custom`) |
| `setCurrentStep(index)` | Change l'index sans executer |
| `getCurrentStep(): number` | Retourne l'index courant |
| `isRunning: boolean` | `true` si le tour est actif |

### Observables

| Observable | Type emis | Description |
|------------|-----------|-------------|
| `onStepChange` | `{ index: number, step: GuidedStep }` | A chaque changement d'etape |
| `onEnd` | `void` | Quand le tour se termine normalement |
| `onSkip` | `void` | Quand l'utilisateur passe le tour |

### Exports publics

```typescript
import {
  // Service principal
  GuidedStepsService,
  GuidedStepsEvents,

  // Modeles
  GuidedStep,
  StepButtonConfig,
  GuidedStepsConfig,
  GuidedStepsLabels,
  GuidedStepsTheme,

  // Configuration
  GUIDED_STEPS_CONFIG,
  GUIDED_STEPS_ROUTER,
  provideGuidedSteps,

  // Composant (usage avance)
  GuidedStepsOverlayComponent,

  // Service de positionnement (usage avance)
  PositionService,
} from 'ngx-guided-steps';
```

---

## License

MIT - [Voir LICENSE](https://github.com/fatilov/ngx-guided-steps/blob/master/LICENSE)
