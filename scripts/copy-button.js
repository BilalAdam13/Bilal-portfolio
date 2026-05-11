/* =========================================================
   <copy-button> — vanilla JS custom element
   Wraps a value (typically an email or short string) and adds
   a "copy to clipboard" affordance with a "Copied!" confirmation.

   Usage:
       <copy-button value="badam@sandiego.edu" label="Copy email">
         badam@sandiego.edu
       </copy-button>

   Without JavaScript, the inner text still displays normally —
   users can manually select and copy it. The button is layered on top.
   ========================================================= */

class CopyButton extends HTMLElement {
	connectedCallback() {
		this.value = this.getAttribute("value") || this.textContent.trim();
		this.label = this.getAttribute("label") || "Copy";
		this.render();

		this.button = this.querySelector("button");
		this.feedback = this.querySelector("[data-feedback]");

		this.button.addEventListener("click", () => this.copy());
	}

	render() {
		this.innerHTML = `
			<span class="copy-button__value">${this.escape(this.value)}</span>
			<button type="button" aria-label="${this.escape(this.label)}">
				<style>
					copy-button {
						display: inline-flex;
						align-items: center;
						gap: 0.5rem;
						flex-wrap: wrap;
					}
					copy-button .copy-button__value {
						font-family: var(--font-mono, monospace);
					}
					copy-button button {
						font: inherit;
						font-family: var(--font-mono, monospace);
						font-size: 0.75rem;
						padding: 0.25rem 0.6rem;
						border: 1px solid var(--rule, #2a2a30);
						background: transparent;
						color: var(--ink-soft, #b4b4b8);
						border-radius: 999px;
						cursor: pointer;
						transition: border-color 0.15s ease, color 0.15s ease;
						line-height: 1;
					}
					copy-button button:hover,
					copy-button button:focus-visible {
						border-color: var(--accent, #39ff8a);
						color: var(--accent, #39ff8a);
					}
					copy-button [data-feedback] {
						font-family: var(--font-mono, monospace);
						font-size: 0.75rem;
						color: var(--accent, #39ff8a);
						opacity: 0;
						transition: opacity 0.2s ease;
					}
					copy-button[data-copied="true"] [data-feedback] {
						opacity: 1;
					}
				</style>
				Copy
			</button>
			<span data-feedback role="status" aria-live="polite">Copied!</span>
		`;
	}

	async copy() {
		try {
			await navigator.clipboard.writeText(this.value);
			this.showFeedback();
		} catch (error) {
			// Clipboard API might be blocked (insecure context, etc.) — try legacy fallback
			if (this.legacyCopy(this.value)) {
				this.showFeedback();
			} else {
				console.error("Clipboard copy failed:", error);
			}
		}
	}

	showFeedback() {
		this.dataset.copied = "true";
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.dataset.copied = "false";
		}, 1800);
	}

	legacyCopy(text) {
		// Fallback for older browsers or insecure contexts
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		let ok = false;
		try {
			ok = document.execCommand("copy");
		} catch {}
		document.body.removeChild(textarea);
		return ok;
	}

	escape(s) {
		return String(s).replace(/[&<>"']/g, ch => ({
			"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
		}[ch]));
	}
}

customElements.define("copy-button", CopyButton);
