(function () {
  const $ = (id) => document.getElementById(id);
  const simulatorView = $("simulatorView");
  const pageView = $("pageView");
  const navItems = document.querySelectorAll("[data-view]");

  const pageDefinitions = {
    history: {
      title: "Run history",
      eyebrow: "Workspace / 02",
      heading: "Run history",
      description: "Review the latest tournament results and inspect any match from the simulator.",
      render: () => {
        if (!matches.length) return "<div class=\"card insight\"><strong>No tournament runs yet</strong><p class=\"hero p\">Run a tournament to create match history.</p></div>";
        return `<div class="card"><div class="card-header"><h2>Latest tournament matches</h2><span>${matches.length} matches</span></div><div class="strategy-list">${matches.map((match, index) => `<div class="strategy-item"><div class="strategy-meta\"><strong>${index + 1}. ${escapeHtml(match.a.name)} × ${escapeHtml(match.b.name)}</strong><small>${match.aTotal} points — ${match.bTotal} points · ${match.aMoves.length} rounds</small></div><span class="avg">${match.aMoves.filter((move, i) => move === match.bMoves[i]).length} mirrored rounds</span></div>`).join("")}</div></div>`;
      }
    },
    setups: {
      title: "Saved setups",
      eyebrow: "Workspace / 03",
      heading: "Current setup",
      description: "Your simulator settings are ready to reuse. Adjust the controls on the simulator whenever you want to explore a new scenario.",
      render: () => `<div class="grid bottom-grid"><div class="card insight"><div class="insight-title"><div><strong>Match configuration</strong><br><span>Active values from the simulator</span></div></div><div class="strategy-list"><div class="strategy-item"><div class="strategy-meta"><strong>Rounds per match</strong><small>Longer runs emphasize repeated behavior</small></div><span class="score">${$("rounds").value}</span></div><div class="strategy-item"><div class="strategy-meta"><strong>Noise probability</strong><small>Accidental defection chance per turn</small></div><span class="score">${$("noise").value}%</span></div><div class="strategy-item"><div class="strategy-meta"><strong>Strategies in roster</strong><small>Built-in and custom strategies</small></div><span class="score">${strategies.length}</span></div></div></div><div class="card insight"><div class="insight-title"><div><strong>Roster included</strong><br><span>Strategies participating in the next run</span></div></div><div class="strategy-list">${strategies.map(strategy => `<div class="strategy-item"><div class="strategy-meta"><strong><i class="dot" style="display:inline-block;background:${strategy.color};margin-right:7px"></i>${escapeHtml(strategy.name)}</strong><small>${escapeHtml(strategy.description)}</small></div></div>`).join("")}</div></div></div>`
    },
    learn: {
      title: "How it works",
      eyebrow: "Learn / 01",
      heading: "How the simulator works",
      description: "Every strategy plays every other strategy in a round-robin tournament. The result is a practical view of how cooperation performs under pressure.",
      render: () => `<div class="grid bottom-grid"><div class="card insight"><div class="insight-title"><div><strong>Each match</strong><br><span>Repeated decisions create consequences</span></div></div><div class="strategy-list"><div class="strategy-item"><div class="strategy-meta"><strong>1. Choose a move</strong><small>Each strategy chooses cooperate or defect based on its rule.</small></div></div><div class="strategy-item"><div class="strategy-meta"><strong>2. Apply noise</strong><small>The configured mutation probability can turn a move into an accidental defection.</small></div></div><div class="strategy-item"><div class="strategy-meta"><strong>3. Award points</strong><small>Both moves are scored using the standard Prisoner's Dilemma matrix.</small></div></div></div></div><div class="card insight"><div class="insight-title"><div><strong>Strategy ideas</strong><br><span>Use custom strategies to test hypotheses</span></div></div><div class="strategy-list"><div class="strategy-item"><div class="strategy-meta"><strong>Reciprocity</strong><small>Tit-for-Tat rewards cooperation and responds to betrayal.</small></div></div><div class="strategy-item"><div class="strategy-meta"><strong>Forgiveness</strong><small>Noise makes strict retaliation fragile over long matches.</small></div></div><div class="strategy-item"><div class="strategy-meta"><strong>Exploitation</strong><small>Always Defect can win against naive cooperation, but performs poorly against itself.</small></div></div></div></div></div>`
    },
    payoffs: {
      title: "Payoff matrix",
      eyebrow: "Learn / 02",
      heading: "Payoff matrix",
      description: "The score for each round depends on both players' simultaneous choices.",
      render: () => `<div class="card"><div class="card-header"><h2>Standard Prisoner's Dilemma rewards</h2><span>Row player / column player</span></div><div style="padding:18px;overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;text-align:center"><thead><tr><th style="padding:13px;color:var(--muted)"></th><th style="padding:13px;color:var(--green)">Opponent cooperates</th><th style="padding:13px;color:var(--red)">Opponent defects</th></tr></thead><tbody><tr><th style="padding:17px;text-align:left;color:var(--green)">You cooperate</th><td style="padding:17px;border:1px solid var(--line);color:var(--green);font-weight:700">3 / 3</td><td style="padding:17px;border:1px solid var(--line);color:var(--yellow);font-weight:700">0 / 5</td></tr><tr><th style="padding:17px;text-align:left;color:var(--red)">You defect</th><td style="padding:17px;border:1px solid var(--line);color:var(--yellow);font-weight:700">5 / 0</td><td style="padding:17px;border:1px solid var(--line);color:var(--red);font-weight:700">1 / 1</td></tr></tbody></table></div></div>`
    }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function showPage(view) {
    if (view === "simulator") {
      simulatorView.hidden = false;
      pageView.hidden = true;
    } else {
      const page = pageDefinitions[view];
      if (!page) return;
      simulatorView.hidden = true;
      pageView.hidden = false;
      pageView.innerHTML = `<div class="hero"><div><div class="eyebrow">${page.eyebrow}</div><h1>${page.heading}</h1><p>${page.description}</p></div></div>${page.render()}`;
    }
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  }

  navItems.forEach((item) => item.addEventListener("click", () => showPage(item.dataset.view)));

  $("toolSearch").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (!simulatorView.hidden) {
      document.querySelectorAll(".strategy-item").forEach((item) => {
        item.hidden = query && !item.textContent.toLowerCase().includes(query);
      });
    }
  });

  $("exportResults").addEventListener("click", () => {
    const rows = [["Strategy A", "Strategy B", "Score A", "Score B", "Rounds"]];
    matches.forEach((match) => rows.push([match.a.name, match.b.name, match.aTotal, match.bTotal, match.aMoves.length]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "dilemma-lab-results.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Results exported");
  });
})();
