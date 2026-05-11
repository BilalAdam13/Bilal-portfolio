/* =========================================================
   <weather-card> — vanilla JS custom element
   Fetches current weather from Open-Meteo (no API key needed)
   Handles loading state, error state, and renders the result.

   Usage:
       <weather-card city="San Diego" lat="32.7157" lon="-117.1611"></weather-card>
   ========================================================= */

class WeatherCard extends HTMLElement {
	static observedAttributes = ["city", "lat", "lon"];

	constructor() {
		super();
		// defaults — overridable via attributes
		this.city = "San Diego";
		this.lat = 32.7157;
		this.lon = -117.1611;
	}

	connectedCallback() {
		// pick up attribute overrides
		if (this.hasAttribute("city")) this.city = this.getAttribute("city");
		if (this.hasAttribute("lat"))  this.lat  = parseFloat(this.getAttribute("lat"));
		if (this.hasAttribute("lon"))  this.lon  = parseFloat(this.getAttribute("lon"));

		this.render();
		this.button = this.querySelector("[data-refresh]");
		this.tempEl = this.querySelector("[data-temp]");
		this.descEl = this.querySelector("[data-desc]");
		this.metaEl = this.querySelector("[data-meta]");
		this.statusEl = this.querySelector("[data-status]");
		this.updatedEl = this.querySelector("[data-updated]");

		this.button.addEventListener("click", () => this.loadWeather());
		this.loadWeather();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === "city") this.city = newValue;
		if (name === "lat")  this.lat  = parseFloat(newValue);
		if (name === "lon")  this.lon  = parseFloat(newValue);
		// re-fetch if we're already mounted
		if (this.isConnected && this.tempEl) this.loadWeather();
	}

	render() {
		this.innerHTML = `
			<article class="weather" aria-labelledby="weather-title">
				<style>
					.weather {
						display: grid;
						gap: 1rem;
						padding: clamp(1.25rem, 4vw, 2rem);
						background: var(--bg-elevated, white);
						border: 1px solid var(--rule, #ddd);
						border-radius: var(--radius, 0.75rem);
						box-shadow: var(--shadow-2, none);
					}
					.weather__head {
						display: flex;
						justify-content: space-between;
						align-items: baseline;
						gap: 1rem;
						flex-wrap: wrap;
					}
					.weather h3 {
						margin: 0;
						font-family: var(--font-display, serif);
						font-size: clamp(1.15rem, 3vw, 1.5rem);
					}
					.weather__badge {
						font-family: var(--font-mono, monospace);
						font-size: 0.75rem;
						text-transform: uppercase;
						letter-spacing: 0.1em;
						color: var(--accent, #b8430f);
					}
					.weather__main {
						display: grid;
						grid-template-columns: auto 1fr;
						gap: 1.25rem;
						align-items: center;
						padding-block: 0.5rem;
					}
					.weather__temp {
						font-family: var(--font-display, serif);
						font-size: clamp(3rem, 10vw, 5rem);
						line-height: 1;
						letter-spacing: -0.04em;
						color: var(--ink, #1a1612);
					}
					.weather__desc {
						font-size: 1.1rem;
						color: var(--ink-soft, #4a4239);
						margin: 0;
					}
					.weather__meta {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
						gap: 0.75rem 1.25rem;
						padding-block-start: 1rem;
						border-block-start: 1px solid var(--rule, #ddd);
						font-size: 0.9rem;
						color: var(--ink-soft, #4a4239);
					}
					.weather__meta dt {
						font-family: var(--font-mono, monospace);
						font-size: 0.7rem;
						text-transform: uppercase;
						letter-spacing: 0.1em;
						color: var(--ink-muted, #7a7065);
						margin-block-end: 0.15rem;
					}
					.weather__meta dd {
						margin: 0;
						font-weight: 500;
					}
					.weather__foot {
						display: flex;
						justify-content: space-between;
						align-items: center;
						gap: 1rem;
						flex-wrap: wrap;
						padding-block-start: 0.5rem;
					}
					.weather button {
						font: inherit;
						font-weight: 600;
						padding: 0.5rem 1rem;
						background: var(--ink, #1a1612);
						color: var(--bg, white);
						border: 0;
						border-radius: 999px;
						cursor: pointer;
					}
					.weather button:hover,
					.weather button:focus-visible {
						background: var(--accent, #b8430f);
					}
					.weather button[aria-busy="true"] {
						opacity: 0.6;
						cursor: wait;
					}
					.weather__status {
						font-size: 0.85rem;
						color: var(--ink-muted, #7a7065);
						font-family: var(--font-mono, monospace);
					}
					.weather[data-state="loading"] .weather__temp,
					.weather[data-state="loading"] .weather__desc {
						opacity: 0.4;
					}
					.weather[data-state="error"] {
						border-color: #c0392b;
					}
				</style>

				<header class="weather__head">
					<h3 id="weather-title">Weather in ${this.city}</h3>
					<span class="weather__badge">Open-Meteo</span>
				</header>

				<div class="weather__main">
					<div class="weather__temp" data-temp aria-live="polite">—</div>
					<p class="weather__desc" data-desc>Loading current conditions…</p>
				</div>

				<dl class="weather__meta" data-meta>
					<div><dt>Feels like</dt><dd>—</dd></div>
					<div><dt>Humidity</dt><dd>—</dd></div>
					<div><dt>Wind</dt><dd>—</dd></div>
					<div><dt>Updated</dt><dd data-updated>—</dd></div>
				</dl>

				<footer class="weather__foot">
					<button type="button" data-refresh>Refresh</button>
					<span class="weather__status" data-status role="status">Ready.</span>
				</footer>
			</article>
		`;
	}

	async loadWeather() {
		this.setState("loading");
		this.statusEl.textContent = "Fetching…";

		const url = new URL("https://api.open-meteo.com/v1/forecast");
		url.searchParams.set("latitude", this.lat);
		url.searchParams.set("longitude", this.lon);
		url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code");
		url.searchParams.set("temperature_unit", "fahrenheit");
		url.searchParams.set("wind_speed_unit", "mph");
		url.searchParams.set("timezone", "auto");

		try {
			const response = await fetch(url.toString(), {
				headers: { "Accept": "application/json" }
			});

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			const data = await response.json();
			const c = data.current;

			if (!c || typeof c.temperature_2m !== "number") {
				throw new Error("Unexpected response shape");
			}

			this.tempEl.textContent = `${Math.round(c.temperature_2m)}°`;
			this.descEl.textContent = WeatherCard.describeWeather(c.weather_code);

			this.updateMeta({
				"Feels like": `${Math.round(c.apparent_temperature)}°F`,
				"Humidity": `${c.relative_humidity_2m}%`,
				"Wind": `${Math.round(c.wind_speed_10m)} mph`,
				"Updated": WeatherCard.formatTime(c.time)
			});

			this.statusEl.textContent = "Live from Open-Meteo.";
			this.setState("ready");
		} catch (error) {
			console.error("Weather fetch failed:", error);
			this.tempEl.textContent = "—";
			this.descEl.textContent = "Could not load weather right now.";
			this.statusEl.textContent = "Error — try again.";
			this.setState("error");
		}
	}

	updateMeta(values) {
		const dds = this.metaEl.querySelectorAll("dd");
		const labels = ["Feels like", "Humidity", "Wind", "Updated"];
		labels.forEach((label, i) => {
			if (dds[i]) dds[i].textContent = values[label] ?? "—";
		});
	}

	setState(state) {
		this.querySelector(".weather").dataset.state = state;
		const isLoading = state === "loading";
		this.button.disabled = isLoading;
		this.button.setAttribute("aria-busy", String(isLoading));
		this.button.textContent = isLoading ? "Loading…" : "Refresh";
	}

	/* Map WMO weather codes to human-readable descriptions.
	   Reference: https://open-meteo.com/en/docs */
	static describeWeather(code) {
		const map = {
			0:  "Clear sky",
			1:  "Mainly clear",
			2:  "Partly cloudy",
			3:  "Overcast",
			45: "Foggy",
			48: "Depositing rime fog",
			51: "Light drizzle",
			53: "Moderate drizzle",
			55: "Dense drizzle",
			61: "Light rain",
			63: "Moderate rain",
			65: "Heavy rain",
			71: "Light snow",
			73: "Moderate snow",
			75: "Heavy snow",
			80: "Rain showers",
			81: "Moderate rain showers",
			82: "Violent rain showers",
			95: "Thunderstorm",
			96: "Thunderstorm with hail",
			99: "Thunderstorm with heavy hail"
		};
		return map[code] ?? "Conditions unknown";
	}

	static formatTime(isoString) {
		try {
			const d = new Date(isoString);
			return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
		} catch {
			return "—";
		}
	}
}

customElements.define("weather-card", WeatherCard);
