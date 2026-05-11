/* =========================================================
   <theme-toggle> — vanilla JS custom element
   A button that flips between dark and light themes.
   - Reads saved preference from localStorage on load
   - Falls back to OS preference (prefers-color-scheme) if no saved choice
   - Updates the <html data-theme> attribute, which CSS responds to
   - Persists the user's choice across visits

   Site still works perfectly without this — it's a pure enhancement.
   ========================================================= */

class ThemeToggle extends HTMLElement {
	connectedCallback() {
		// Determine starting theme
		const saved = this.readStoredTheme();
		const initial = saved ?? this.systemPreference();
		this.applyTheme(initial);

		this.render();
		this.button = this.querySelector("button");
		this.button.addEventListener("click", () => this.toggle());
	}

	render() {
		this.innerHTML = `
			<button type="button" aria-label="Toggle color theme" data-theme-toggle>
				<style>
					theme-toggle {
						display: inline-block;
					}
					theme-toggle button {
						font: inherit;
						font-family: var(--font-mono, monospace);
						font-size: 0.8rem;
						padding: 0.4rem 0.8rem;
						border: 1px solid var(--rule, #2a2a30);
						border-radius: 999px;
						background: transparent;
						color: var(--ink-soft, #b4b4b8);
						cursor: pointer;
						transition: border-color 0.15s ease, color 0.15s ease;
						line-height: 1;
					}
					theme-toggle button:hover,
					theme-toggle button:focus-visible {
						border-color: var(--accent, #39ff8a);
						color: var(--accent, #39ff8a);
					}
				</style>
				<span data-theme-label>${this.currentLabel()}</span>
			</button>
		`;
	}

	toggle() {
		const next = this.currentTheme() === "dark" ? "light" : "dark";
		this.applyTheme(next);
		this.storeTheme(next);
		const label = this.querySelector("[data-theme-label]");
		if (label) label.textContent = this.currentLabel();
	}

	currentTheme() {
		return document.documentElement.dataset.theme || this.systemPreference();
	}

	currentLabel() {
		return this.currentTheme() === "dark" ? "☀ Light" : "☾ Dark";
	}

	applyTheme(theme) {
		document.documentElement.dataset.theme = theme;
	}

	systemPreference() {
		return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
	}

	readStoredTheme() {
		try {
			return localStorage.getItem("theme");
		} catch {
			return null; // localStorage might be blocked (private mode, etc.)
		}
	}

	storeTheme(theme) {
		try {
			localStorage.setItem("theme", theme);
		} catch {
			// silently ignore — theme still applies for the session
		}
	}
}

customElements.define("theme-toggle", ThemeToggle);
