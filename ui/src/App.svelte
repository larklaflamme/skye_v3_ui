<script>
  import './lib/styles/app.css';
  import { onMount } from 'svelte';
  import { activeTheme, setTheme } from './lib/stores/themeStore.js';
  import { isSidebarOpen, toggleSidebar, isContextOpen, toggleContext, createNewThread, loadThreads } from './lib/stores/chatStore.js';
  import { isAuthenticated, fetchCurrentUser } from './lib/stores/userStore.js';
  import { initNotifications } from './lib/services/notificationService.js';

  // Components
  import TelemetryHud from './lib/components/header/TelemetryHud.svelte';
  import NavBar from './lib/components/header/NavBar.svelte';
  import ChatSidebar from './lib/components/chat/ChatSidebar.svelte';
  import ChatStream from './lib/components/chat/ChatStream.svelte';
  import ChatInput from './lib/components/chat/ChatInput.svelte';
  import ContextPanel from './lib/components/chat/ContextPanel.svelte';
  import ThoughtGraphCanvas from './lib/components/graph/ThoughtGraphCanvas.svelte';
  import AdminDeck from './lib/components/admin/AdminDeck.svelte';
  import WebSocketStream from './lib/components/telemetry/WebSocketStream.svelte';
  import SignupModal from './lib/components/modals/SignupModal.svelte';
  import LoginModal from './lib/components/modals/LoginModal.svelte';
  import ShortcutsModal from './lib/components/modals/ShortcutsModal.svelte';

  let activeTab = 'console';
  let isSignupOpen = false;
  let isLoginOpen = false;
  let isShortcutsOpen = false;

  onMount(() => {
    setTheme($activeTheme);
    initNotifications();

    // Initialize stores from API
    fetchCurrentUser();
    loadThreads();

    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        toggleContext();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewThread();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        isShortcutsOpen = !isShortcutsOpen;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div class="flex flex-col h-screen w-screen bg-[var(--bg-primary,#1a1a1c)] text-[var(--text-primary,#e8e6e3)] overflow-hidden" style="padding-left: 25pt; padding-right: 25pt; padding-bottom: 25pt; box-sizing: border-box;">
  
  <TelemetryHud />

  <NavBar 
    {activeTab}
    onTabChange={(tab) => activeTab = tab}
    onOpenShortcuts={() => isShortcutsOpen = true}
    onOpenSignup={() => isSignupOpen = true}
    onOpenLogin={() => isLoginOpen = true}
    isSidebarOpen={$isSidebarOpen}
    onToggleSidebar={toggleSidebar}
    isAuthenticated={$isAuthenticated}
  />

  <main class="flex-1 flex overflow-hidden relative">
    
    {#if activeTab === 'console'}
      <div class="flex-1 flex overflow-hidden pt-[10pt]" style="gap: 10pt;">
        {#if $isSidebarOpen}
          <ChatSidebar />
        {/if}

        <div class="flex-1 flex flex-col overflow-hidden bg-[#1e1e24] border border-[#2e2e38] rounded-xl shadow-md">
          <ChatStream />
          <ChatInput />
        </div>

        {#if $isContextOpen}
          <ContextPanel />
        {/if}
      </div>
    {/if}

    {#if activeTab === 'graph'}
      <div class="flex-1 flex overflow-hidden pt-[10pt]">
        <ThoughtGraphCanvas onJumpToChat={() => activeTab = 'console'} />
      </div>
    {/if}

    {#if activeTab === 'admin'}
      <div class="flex-1 flex overflow-hidden pt-[10pt]">
        <AdminDeck />
      </div>
    {/if}

    {#if activeTab === 'socket'}
      <div class="flex-1 flex overflow-hidden pt-[10pt]">
        <WebSocketStream />
      </div>
    {/if}

  </main>

  <SignupModal isOpen={isSignupOpen} onClose={() => isSignupOpen = false} onSwitchToLogin={() => isLoginOpen = true} />
  <LoginModal isOpen={isLoginOpen} onClose={() => isLoginOpen = false} onSwitchToSignup={() => isSignupOpen = true} />
  <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => isShortcutsOpen = false} />

</div>
