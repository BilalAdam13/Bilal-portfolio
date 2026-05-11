/* =========================================================
   <github-stats> — vanilla JS custom element
   Fetches public GitHub profile stats from api.github.com.
   Same architecture as <weather-card>: real REST API, JSON parsing,
   loading state, error state, defensive shape checking.

   Usage:
       <github-stats user="BilalAdam13"></github-stats>

   API: https://docs.github.com/en/rest/users/users (no auth required for public data)
   ========================================================= */

class GithubStats extends HTMLElement {
	static observedAttributes = ["user"];

	constructor() {
		super();
		this.user = "BilalAdam13";
	}

	connectedCallback() {
		if (this.hasAttribute("user")) this.user = this.getAttribute("user");

		this.render();
		this.statusEl = this.querySelector("[data-status]");
		this.gridEl = this.querySelector("[data-stats-grid]");
		this.avatarEl = this.querySelector("[data-avatar]");
		this.bioEl = this.querySelector("[data-bio]");
		this.nameEl = this.querySelector("[data-name]");
		this.profileLink = this.querySelector("[data-profile-link]");

		this.loadStats();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === "user") this.user = newValue;
		if (this.isConnected && this.gridEl) this.loadStats();
	}

	render() {
		this.innerHTML = `
			<article class="gh-stats" aria-labelledby="gh-title">
				<style>
					.gh-stats {
						display: grid;
						gap: 1.25rem;
						padding: clamp(1.25rem, 4vw, 2rem);
						background: var(--bg-elevated, white);
						border: 1px solid var(--rule, #2a2a30);
						border-radius: var(--radius, 0.75rem);
						box-shadow: var(--shadow-2, none);
					}
					.gh-stats__head {
						display: flex;
						gap: 1rem;
						align-items: center;
						flex-wrap: wrap;
					}
					.gh-stats__avatar {
						width: 3.5rem;
						height: 3.5rem;
						border-radius: 50%;
						background: var(--bg-sunken, #08080a);
						border: 1px solid var(--rule, #2a2a30);
						object-fit: cover;
					}
					.gh-stats__title {
						display: grid;
						gap: 0.15rem;
						flex: 1 1 12rem;
					}
					.gh-stats h3 {
						margin: 0;
						font-family: var(--font-display, serif);
						font-size: clamp(1.15rem, 3vw, 1.4rem);
					}
					.gh-stats__handle {
						font-family: var(--font-mono, monospace);
						font-size: 0.85rem;
						color: var(--ink-muted, #7a7a82);
					}
					.gh-stats__handle a {
						color: inherit;
						text-decoration: none;
					}
					.gh-stats__handle a:hover {
						color: var(--accent, #39ff8a);
					}
					.gh-stats__badge {
						font-family: var(--font-mono, monospace);
						font-size: 0.7rem;
						text-transform: uppercase;
						letter-spacing: 0.1em;
						color: var(--accent, #39ff8a);
					}
					.gh-stats__bio {
						color: var(--ink-soft, #b4b4b8);
						font-size: 0.95rem;
						margin: 0;
						max-inline-size: none;
					}
					.gh-stats__grid {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
						gap: 0.75rem 1.25rem;
						padding-block-start: 1rem;
						border-block-start: 1px solid var(--rule, #2a2a30);
					}
					.gh-stats__grid dt {
						font-family: var(--font-mono, monospace);
						font-size: 0.7rem;
						text-transform: uppercase;
						letter-spacing: 0.1em;
						color: var(--ink-muted, #7a7a82);
						margin-block-end: 0.2rem;
					}
					.gh-stats__grid dd {
						margin: 0;
						font-family: var(--font-display, serif);
						font-size: clamp(1.4rem, 3vw, 1.75rem);
						color: var(--ink, #e8e8ea);
						line-height: 1;
					}
					.gh-stats__status {
						font-family: var(--font-mono, monospace);
						font-size: 0.8rem;
						color: var(--ink-muted, #7a7a82);
					}
					.gh-stats[data-state="loading"] .gh-stats__grid dd {
						opacity: 0.4;
					}
					.gh-stats[data-state="error"] {
						border-color: #ff5555;
					}
				</style>

				<header class="gh-stats__head">
					<img class="gh-stats__avatar" data-avatar alt="" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'/>">
					<div class="gh-stats__title">
						<h3 id="gh-title" data-name>GitHub stats</h3>
						<span class="gh-stats__handle">
							<a data-profile-link href="https://github.com/${this.escape(this.user)}" rel="noopener">@${this.escape(this.user)}</a>
						</span>
					</div>
					<span class="gh-stats__badge">GitHub API</span>
				</header>

				<p class="gh-stats__bio" data-bio>Loading profile…</p>

				<dl class="gh-stats__grid" data-stats-grid>
					<div><dt>Public repos</dt><dd>—</dd></div>
					<div><dt>Followers</dt><dd>—</dd></div>
					<div><dt>Following</dt><dd>—</dd></div>
					<div><dt>On GitHub since</dt><dd>—</dd></div>
				</dl>

				<p class="gh-stats__status" data-status role="status">Ready.</p>
			</article>
		`;
	}

	async loadStats() {
		this.setState("loading");
		this.statusEl.textContent = "Fetching…";

		try {
			const response = await fetch(`https://api.github.com/users/${encodeURIComponent(this.user)}`, {
				headers: { "Accept": "application/vnd.github+json" }
			});

			if (response.status === 404) {
				throw new Error("GitHub user not found");
			}
			if (response.status === 403) {
				throw new Error("Rate limited — try again in a minute");
			}
			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			const data = await response.json();

			if (typeof data.public_repos !== "number") {
				throw new Error("Unexpected response shape");
			}

			if (data.avatar_url) {
				this.avatarEl.src = data.avatar_url;
				this.avatarEl.alt = `${data.login}'s avatar`;
			}
			if (data.name)  this.nameEl.textContent = data.name;
			this.bioEl.textContent = data.bio || "No bio set.";

			const since = data.created_at ? new Date(data.created_at).getFullYear() : "—";

			this.updateGrid({
				"Public repos": data.public_repos,
				"Followers":    data.followers,
				"Following":    data.following,
				"On GitHub since": since
			});

			this.statusEl.textContent = "Live from api.github.com.";
			this.setState("ready");
		} catch (error) {
			console.error("GitHub stats fetch failed:", error);
			this.bioEl.textContent = "Could not load GitHub stats right now.";
			this.statusEl.textContent = `Error: ${error.message}`;
			this.setState("error");
		}
	}

	updateGrid(values) {
		const dds = this.gridEl.querySelectorAll("dd");
		const order = ["Public repos", "Followers", "Following", "On GitHub since"];
		order.forEach((key, i) => {
			if (dds[i]) dds[i].textContent = values[key] ?? "—";
		});
	}

	setState(state) {
		this.querySelector(".gh-stats").dataset.state = state;
	}

	escape(s) {
		return String(s).replace(/[&<>"']/g, ch => ({
			"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
		}[ch]));
	}
}

customElements.define("github-stats", GithubStats);
