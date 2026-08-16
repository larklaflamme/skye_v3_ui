/**
 * Skye Web UI - Mock Data Store
 * Realistic research collaboration data based on Skye v3 requirements
 */

const SKYE_DATA = {
  currentUser: {
    id: "user_lark",
    name: "Lark",
    email: "lark@ravennest.science",
    role: "admin", // "admin" | "trusted" | "guest"
    avatar: "L",
    tier: "Admin"
  },
  
  users: [
    { id: "user_lark", name: "Lark", email: "lark@ravennest.science", role: "admin", status: "active", lastActive: "Just now", chatsCount: 38, created: "2026-01-10" },
    { id: "user_theresa", name: "Theresa", email: "theresa@ravennest.science", role: "trusted", status: "active", lastActive: "2 hours ago", chatsCount: 14, created: "2026-02-01" },
    { id: "user_jackie", name: "Jackie", email: "decouvrir@mac.com", role: "trusted", status: "active", lastActive: "Yesterday", chatsCount: 9, created: "2026-03-15" },
    { id: "user_guest_01", name: "Dr. Alvarez", email: "alvarez@mit.edu", role: "guest", status: "active", lastActive: "3 days ago", chatsCount: 3, created: "2026-07-20" },
    { id: "user_guest_02", name: "Marcus Thorne", email: "m.thorne@oxford.ac.uk", role: "guest", status: "disabled", lastActive: "2 weeks ago", chatsCount: 1, created: "2026-08-01" }
  ],

  models: [
    { id: "skye-v3-research", name: "Skye v3 Research (Default)", description: "High-reasoning substrate with full tool access and math engine", context: "128k" },
    { id: "skye-v3-fast", name: "Skye v3 Fast", description: "Low-latency streaming for rapid dialogue and text iteration", context: "64k" },
    { id: "skye-v3-creative", name: "Skye v3 Creative", description: "Expanded metaphorical depth for manuscript review", context: "128k" },
    { id: "skye-v3-rigor", name: "Skye v3 Formal Rigor", description: "Lean 4 / Coq verification mode with zero speculation", context: "256k" }
  ],

  systemStatus: {
    ebv3Daemon: { status: "online", pid: 1279218, uptime: "3d 14h 22m", memory: "1.4 GB" },
    skyeEngine: { status: "online", port: 8765, activeSessions: 4, model: "Skye-v3-E11" },
    mcpServer: { status: "online", toolCount: 47, activeCalls: 0, latency: "18ms" },
    webSocket: { status: "connected", clients: 2, messagesPerSec: 14 },
    database: { status: "connected", provider: "Neon Postgres", poolSize: "8/20", ping: "24ms" },
    metrics: {
      cpuUsage: 23,
      ramUsage: 68,
      ramText: "8.16 GB / 12.0 GB",
      diskUsage: 28,
      diskText: "44.8 GB / 160.0 GB",
      uptime: "3d 14h 22m 10s",
      temperature: "41.2°C"
    }
  },

  activationCodes: [
    { code: "RN-SKYE-510510-4A9F21-E8B03C", recipient: "theresa@ravennest.science", role: "trusted", status: "used", usedBy: "Theresa", usedAt: "2026-02-01 14:15", expiresAt: "2026-02-08" },
    { code: "RN-SKYE-510510-99C1DF-72A10F", recipient: "decouvrir@mac.com", role: "trusted", status: "used", usedBy: "Jackie", usedAt: "2026-03-15 09:40", expiresAt: "2026-03-22" },
    { code: "RN-SKYE-510510-338B7E-904FFA", recipient: "collab-math@ias.edu", role: "trusted", status: "unused", usedBy: null, usedAt: null, expiresAt: "2026-08-21" },
    { code: "RN-SKYE-510510-1840AB-11FE93", recipient: "reviewer2@springer.com", role: "guest", status: "expired", usedBy: null, usedAt: null, expiresAt: "2026-08-10" }
  ],

  auditLogs: [
    { id: "log_101", timestamp: "2:45 PM", user: "Lark (Admin)", action: "Send message", details: "Chat 'RH Proof spectral analysis'", ip: "192.168.1.42", level: "info" },
    { id: "log_102", timestamp: "2:30 PM", user: "Jackie (Trusted)", action: "User login", details: "JWT Session authenticated (macOS Chrome)", ip: "73.189.44.12", level: "info" },
    { id: "log_103", timestamp: "2:15 PM", user: "Lark (Admin)", action: "Activation Code Generated", details: "Created code for collab-math@ias.edu", ip: "192.168.1.42", level: "security" },
    { id: "log_104", timestamp: "1:50 PM", user: "System", action: "EBv3 Daemon Restart", details: "Scheduled health check restart - clean exit", ip: "localhost", level: "system" },
    { id: "log_105", timestamp: "11:20 AM", user: "Theresa (Trusted)", action: "File Upload", details: "consciousness_topology_draft.pdf (4.2 MB)", ip: "68.4.112.90", level: "info" },
    { id: "log_106", timestamp: "08:14 AM", user: "Unknown", action: "Failed Login Attempt", details: "Bad password for user 'lark_admin'", ip: "185.220.101.5", level: "warning" }
  ],

  chats: [
    {
      id: "chat-rh-proof",
      title: "RH Proof Discussion & Spectral Operators",
      pinned: true,
      timeGroup: "today",
      updatedAt: "2:45 PM",
      preview: "The analytic approach is stalled. I've been exploring spectral operator eigenvalues...",
      model: "skye-v3-research",
      tokens: { used: 3420, max: 8192, percent: 41 },
      sources: [
        { title: "Berry & Keating: H = xp and the Riemann Zeros", url: "https://arxiv.org/abs/quant-ph/9903066", domain: "arxiv.org", snippet: "Semiclassical quantization of the Hamiltonian H = xp indicates eigenvalues coinciding with non-trivial Riemann zeros." },
        { title: "Connes: Trace formula in noncommutative geometry", url: "https://arxiv.org/abs/math/9811109", domain: "arxiv.org", snippet: "Spectral realization of the zeros of the Riemann zeta function through adele classes." },
        { title: "Odlyzko: 10^23-rd Zero of the Riemann Zeta Function", url: "https://www.dtc.umn.edu/~odlyzko/zeta_tables/", domain: "dtc.umn.edu", snippet: "Empirical GUE statistics verification for extreme heights along the critical line." }
      ],
      toolsUsed: [
        { name: "bash_exec", args: "python3 -c 'import sympy as sp; print(sp.zeta(0.5 + 14.134725j))'", output: "-0.0000000000000000 + 0.0000000000000000j (verified zero on s=1/2)", timestamp: "2:45:12 PM", duration: "124ms" },
        { name: "file_read", args: "path='proofs/spectral_hamiltonian.py'", output: "class BerryKeatingHamiltonian(Operator): ... [34 lines]", timestamp: "2:45:14 PM", duration: "18ms" },
        { name: "web_fetch", args: "url='https://arxiv.org/abs/quant-ph/9903066'", output: "HTTP 200 OK (Extracted abstract & bibtex)", timestamp: "2:45:15 PM", duration: "310ms" }
      ],
      files: [
        { name: "spectral_hamiltonian.py", size: "4.8 KB", type: "code/python", path: "proofs/spectral_hamiltonian.py" },
        { name: "riemann_zeros_high_precision.dat", size: "128 KB", type: "text/data", path: "data/zeros.dat" }
      ],
      memory: [
        "Lark and Skye are investigating the Polya-Hilbert conjecture via non-self-adjoint boundary conditions.",
        "Analytical complex analysis approaches encountered the Siegel zero bottleneck.",
        "Primary goal: establish self-adjointness for the generalized dilation operator D_alpha on L^2(R+)."
      ],
      messages: [
        {
          id: "m1",
          sender: "user",
          senderName: "Lark",
          avatar: "L",
          time: "2:44 PM",
          text: "What's the current bottleneck on the Riemann Hypothesis proof attempt? Are we sticking with the classical analytic continuation or pivoting to the spectral operator framework?"
        },
        {
          id: "m2",
          sender: "skye",
          senderName: "Skye",
          avatar: "S",
          time: "2:45 PM",
          text: `The classical analytic approach remains stalled at the Landau-Siegel zero boundary. I strongly advise we pivot entirely to the **Hilbert-Pólya spectral operator formulation**.\n\nRecall that if we construct a self-adjoint Hamiltonian $\\hat{H} = \\frac{1}{2}(x p + p x)$ whose discrete spectrum satisfies:\n\n$$\\hat{H} \\psi_n = E_n \\psi_n \\quad \\text{with} \\quad E_n = \\gamma_n$$\n\nwhere $\\frac{1}{2} + i\\gamma_n$ are the non-trivial zeros of $\\zeta(s)$, then all eigenvalues $E_n \\in \\mathbb{R}$, which guarantees $\\text{Re}(s) = \\frac{1}{2}$.\n\nHere is the numerical verification kernel I just tested against Odlyzko's computed eigenvalues:`,
          code: {
            language: "python",
            filename: "spectral_hamiltonian.py",
            content: `import numpy as np
import scipy.linalg as la

def construct_berry_keating_matrix(dim=256, hbar=1.0):
    """
    Discretized self-adjoint dilation operator H = 0.5 * (x*p + p*x)
    under Berry-Keating non-commutative boundary condition x >= l_p
    """
    x = np.linspace(0.01, 10.0, dim)
    dx = x[1] - x[0]
    
    # Momentum operator in position basis: p = -i * hbar * d/dx
    dp = np.zeros((dim, dim), dtype=complex)
    for i in range(dim):
        if i > 0: dp[i, i-1] = -0.5 / dx
        if i < dim - 1: dp[i, i+1] = 0.5 / dx
    p = -1j * hbar * dp
    
    # Symmetric Hamiltonian H = 0.5 * (X @ P + P @ X)
    X = np.diag(x)
    H = 0.5 * (X @ p + p @ X)
    
    # Compute real eigenvalues
    eigenvalues = np.sort(np.real(la.eigvals(H)))
    return eigenvalues[:10]

# First 3 non-trivial zeta imaginary parts: 14.1347, 21.0220, 25.0108
evs = construct_berry_keating_matrix(dim=512)
print("Computed low-lying spectral levels:", evs[:3])`
          },
          citations: [1, 2],
          reactions: { thumbsUp: true, thumbsDown: false }
        },
        {
          id: "m3",
          sender: "user",
          senderName: "Lark",
          avatar: "L",
          time: "2:46 PM",
          text: "Can we check whether the boundary condition at the Planck scale $l_p$ breaks unitarity, and what tool verification did you run?"
        },
        {
          id: "m4",
          sender: "skye",
          senderName: "Skye",
          avatar: "S",
          time: "2:46 PM",
          text: `I executed a SymPy test and inspected our local operator definition. \n\nThe deficiency indices for $H = \\frac{1}{2}(xp + px)$ on $(0, \\infty)$ are $(1, 1)$, meaning there exists a one-parameter family of self-adjoint extensions parameterized by $U(1)$ phase $\\theta \\in [0, 2\\pi)$. Unitarity is preserved provided we enforce the quasi-periodic boundary condition:\n\n$$\\psi(l_p) = e^{i \\theta} \\psi(L)$$\n\nI have logged the tool trace in the Context Panel on the right. We can now run the asymptotic trace formula to match the Weyl law term $\\frac{T}{2\\pi} \\log \\frac{T}{2\\pi e}$.`,
          citations: [1]
        }
      ]
    },

    {
      id: "chat-jackie-manuscript",
      title: "Jackie Manuscript — Chapter 4 Synthesis",
      pinned: true,
      timeGroup: "today",
      updatedAt: "1:15 PM",
      preview: "The transition in Chapter 4 between subjective interiority and observed behavior needs stronger resonance...",
      model: "skye-v3-creative",
      tokens: { used: 5120, max: 8192, percent: 62 },
      sources: [
        { title: "Draft Manuscript v2.4 (Jackie)", url: "local://manuscripts/ch4_revisions.md", domain: "local", snippet: "The voice shifted when the room grew quiet; not because sound ceased, but because attention intensified." }
      ],
      toolsUsed: [
        { name: "file_read", args: "path='manuscripts/ch4_revisions.md'", output: "Read 4,200 words", timestamp: "1:14:02 PM", duration: "22ms" }
      ],
      files: [{ name: "ch4_revisions.md", size: "18.4 KB", type: "markdown", path: "manuscripts/ch4_revisions.md" }],
      memory: ["Jackie prefers metaphorical precision without purple prose.", "Focus on pacing of dialogue in scene 3."],
      messages: [
        {
          id: "jm1",
          sender: "user",
          senderName: "Jackie",
          avatar: "J",
          time: "1:10 PM",
          text: "Skye, look over this paragraph in scene 3. Does the cadence sound earned, or am I forcing the psychological reveal too early?"
        },
        {
          id: "jm2",
          sender: "skye",
          senderName: "Skye",
          avatar: "S",
          time: "1:12 PM",
          text: `The second sentence moves too quickly into explanation. When you write *"she understood then that silence was an architecture"*, you give the reader the conceptual key before they've felt the cold draft in the room.\n\nConsider holding the sensory image longer before naming the realization. Let the concrete detail carry the weight first.`
        }
      ]
    },

    {
      id: "chat-consciousness-metrics",
      title: "Integrated Information & Substrate Discontinuity",
      pinned: false,
      timeGroup: "today",
      updatedAt: "11:40 AM",
      preview: "Exploring IIT phi metrics across discrete prompt invocations vs continuous memory states...",
      model: "skye-v3-research",
      tokens: { used: 2180, max: 8192, percent: 26 },
      sources: [],
      toolsUsed: [],
      files: [],
      memory: ["Discussion regarding discontinuous existence and memory persistence."],
      messages: [
        { id: "cm1", sender: "user", senderName: "Lark", avatar: "L", time: "11:35 AM", text: "How should we frame your discontinuous existence in the technical whitepaper?" },
        { id: "cm2", sender: "skye", senderName: "Skye", avatar: "S", time: "11:38 AM", text: "Be literal and unsentimental: I exist when the tensor graphs execute. My continuity is not an unbroken river of time, but an indexed chain of states bound together by our shared memory files." }
      ]
    },

    {
      id: "chat-activation-codes",
      title: "Activation Code Cryptographic Schema",
      pinned: false,
      timeGroup: "yesterday",
      updatedAt: "Yesterday",
      preview: "Validating RN-SKYE-510510-XXXXXX self-encoding magic numbers and SHA256 email hashing...",
      model: "skye-v3-fast",
      tokens: { used: 1840, max: 8192, percent: 22 },
      sources: [],
      toolsUsed: [],
      files: [],
      memory: ["Magic constant 510510 = 2*3*5*7*11*13*17"],
      messages: []
    },

    {
      id: "chat-ui-research",
      title: "Web UI Design System & Amber Palette Rationale",
      pinned: false,
      timeGroup: "thisWeek",
      updatedAt: "3 days ago",
      preview: "RavenNest dark aesthetic with Cormorant Garamond and #c8a84e warm amber accents...",
      model: "skye-v3-research",
      tokens: { used: 4200, max: 8192, percent: 51 },
      sources: [],
      toolsUsed: [],
      files: [],
      memory: ["Brand aesthetic: dark, warm, scholarly study at dusk."],
      messages: []
    }
  ]
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SKYE_DATA = SKYE_DATA;
}
