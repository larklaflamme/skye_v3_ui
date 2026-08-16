<script>
  import './lib/styles/themes.css';
  import { activeTheme, THEMES, setTheme } from './lib/stores/themeStore.js';
  import Proto1Carbon from './prototypes/Proto1Carbon.svelte';
  import Proto2Packages from './prototypes/Proto2Packages.svelte';
  import Proto3Flowbite from './prototypes/Proto3Flowbite.svelte';
  import Proto4Svar from './prototypes/Proto4Svar.svelte';
  import Proto5PureSvelte from './prototypes/Proto5PureSvelte.svelte';

  // Active prototype index: 1 to 5
  let currentPrototype = 1;

  const PROTOTYPES = [
    { id: 1, name: '1. Svelte + IBM Carbon', component: Proto1Carbon, tag: 'carbon-components-svelte', badge: 'Enterprise UI' },
    { id: 2, name: '2. Svelte + Packages', component: Proto2Packages, tag: 'svelte-packages + lucide', badge: 'Community Stack' },
    { id: 3, name: '3. Svelte + Flowbite', component: Proto3Flowbite, tag: 'flowbite-svelte', badge: 'Tailwind UI' },
    { id: 4, name: '4. Svelte + SVAR', component: Proto4Svar, tag: '@svar-ui / wx-svelte-core', badge: 'Core Widgets' },
    { id: 5, name: '5. Svelte Only', component: Proto5PureSvelte, tag: 'Pure Svelte 5 (Zero Ext Libs)', badge: 'Ultra-Light' }
  ];

  function selectPrototype(id) {
    currentPrototype = id;
  }
</script>

<div class="skye-master-container">
  
  <!-- Master Prototype Switcher Navigation Header -->
  <header class="proto-switcher-header">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="color:var(--accent); font-weight:700; font-family:var(--font-serif); font-size:1.15rem;">RavenNest</span>
      <span style="color:var(--text-muted);">|</span>
      <span style="font-weight:600; color:var(--text-primary);">Skye v3 Svelte Prototypes</span>
    </div>

    <!-- Prototype Switcher Pills -->
    <div style="display:flex; align-items:center; gap:6px;">
      {#each PROTOTYPES as p}
        <button 
          class="proto-pill-link {currentPrototype === p.id ? 'active' : ''}"
          on:click={() => selectPrototype(p.id)}
          title="{p.tag}"
        >
          <span>{p.name}</span>
        </button>
      {/each}
    </div>

    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
        {PROTOTYPES.find(p => p.id === currentPrototype)?.tag}
      </span>
    </div>
  </header>

  <!-- Prototype Content -->
  <div class="prototype-render-area">
    {#if currentPrototype === 1}
      <Proto1Carbon />
    {:else if currentPrototype === 2}
      <Proto2Packages />
    {:else if currentPrototype === 3}
      <Proto3Flowbite />
    {:else if currentPrototype === 4}
      <Proto4Svar />
    {:else if currentPrototype === 5}
      <Proto5PureSvelte />
    {/if}
  </div>

</div>

<style>
  .skye-master-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: var(--bg-primary);
    overflow: hidden;
  }

  .prototype-render-area {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }
</style>
