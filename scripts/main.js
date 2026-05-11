/* =========================================================
   main.js — progressive enhancements only
   The site is fully usable without this file loading.
   ========================================================= */

// Mark the document as JS-enabled so CSS can hide no-JS notices
document.documentElement.classList.add("js");

// Highlight the current page in the nav (enhancement only — links still work)
(function markCurrentNav() {
	const here = location.pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "/") || "/";
	const links = document.querySelectorAll(".site-nav a");
	links.forEach(link => {
		const href = link.getAttribute("href") || "";
		const target = href.replace(/\/index\.html$/, "/").replace(/\/$/, "/") || "/";
		// Match exact path, or root for index
		if (here.endsWith(target) || (target === "/" && (here === "/" || here.endsWith("/index.html")))) {
			link.setAttribute("aria-current", "page");
		}
	});
})();

/* =========================================================
   Contact form — fetch-based submission enhancement.
   If JS is disabled, the form falls back to a normal POST
   submission to Formspree's endpoint (set via the action attribute).
   ========================================================= */
(function enhanceContactForm() {
	const form = document.querySelector("[data-contact-form]");
	if (!form) return;

	const statusEl = form.querySelector("[data-form-status]");
	const submitBtn = form.querySelector("button[type='submit']");

	form.addEventListener("submit", async (event) => {
		// Only intercept if we have a real Formspree action (not the placeholder)
		const action = form.getAttribute("action") || "";
		if (!action || action.includes("YOUR_FORMSPREE_ID")) {
			// Let the browser handle it (no JS interception)
			return;
		}

		event.preventDefault();

		const formData = new FormData(form);
		setStatus("Sending…", "pending");
		submitBtn.disabled = true;

		try {
			const response = await fetch(action, {
				method: "POST",
				body: formData,
				headers: { "Accept": "application/json" }
			});

			if (response.ok) {
				setStatus("Thanks — your message was sent.", "success");
				form.reset();
			} else {
				const data = await response.json().catch(() => ({}));
				const message = data.errors?.map(e => e.message).join(", ")
					?? "Something went wrong sending the message.";
				setStatus(message, "error");
			}
		} catch (error) {
			console.error("Form submission failed:", error);
			setStatus("Network error — please try again or email me directly.", "error");
		} finally {
			submitBtn.disabled = false;
		}
	});

	function setStatus(message, state) {
		if (!statusEl) return;
		statusEl.textContent = message;
		statusEl.dataset.state = state;
	}
})();
