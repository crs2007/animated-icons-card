/**
 * Animated Icons Card v2026.03.24.0
 * A wrapper card for Home Assistant that adds CSS icon animations to any inner card.
 * Works with Mushroom, Tile, Entity, and any card that renders <ha-icon>.
 *
 * Features:
 * - Visual editor with dropdowns (no YAML needed)
 * - Auto-detect animation by entity domain
 * - Manual override: pick animation type, speed, trigger state
 * - Works with MDI, hass-hue-icons, custom-brand-icons
 * - Zero dependency on card-mod
 *
 * Install: copy to /config/www/animated-icons-card.js
 * Add resource: /local/animated-icons-card.js (JavaScript Module)
 *
 * Usage:
 *   type: custom:animated-icons-card
 *   card:
 *     type: custom:mushroom-light-card
 *     entity: light.living_room
 *   # Optional overrides (auto-detect works without these):
 *   animation: glow          # spin|glow|pulse|wiggle|ping|bounce|breathe|slide|roam|heat|alert|none
 *   speed: medium            # slow|medium|fast
 *   trigger_state: 'on'      # state that activates animation (default: auto by domain)
 *   trigger_entity: sensor.x # optional: use a different entity for trigger evaluation
 */

const CARD_VERSION = '2026.03.24.1';
const CARD_NAME = 'animated-icons-card';
const EDITOR_NAME = 'animated-icons-card-editor';

// ═══════════════════════════════════════════════════════════
// ANIMATION DEFINITIONS
// ═══════════════════════════════════════════════════════════

const ANIMATIONS = {
  spin: {
    label: 'Spin (rotation)',
    keyframes: `@keyframes aic-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
    speeds: { slow: '3s linear', medium: '1.5s linear', fast: '0.6s linear' },
    timing: 'infinite',
  },
  glow: {
    label: 'Glow (warm pulse)',
    keyframes: `@keyframes aic-glow { 0%, 100% { filter: drop-shadow(0 0 2px rgba(255,180,50,0.4)); } 50% { filter: drop-shadow(0 0 10px rgba(255,180,50,0.9)); } }`,
    speeds: { slow: '4s ease-in-out', medium: '2.5s ease-in-out', fast: '1.5s ease-in-out' },
    timing: 'infinite',
  },
  'glow-color': {
    label: 'Glow (entity color)',
    keyframes: `@keyframes aic-glow-color { 0%, 100% { filter: drop-shadow(0 0 3px var(--aic-color, rgba(255,180,50,0.5))); } 50% { filter: drop-shadow(0 0 12px var(--aic-color, rgba(255,180,50,0.9))); } }`,
    speeds: { slow: '4s ease-in-out', medium: '2.5s ease-in-out', fast: '1.5s ease-in-out' },
    timing: 'infinite',
  },
  pulse: {
    label: 'Pulse (scale throb)',
    keyframes: `@keyframes aic-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }`,
    speeds: { slow: '4s ease-in-out', medium: '3s ease-in-out', fast: '1.5s ease-in-out' },
    timing: 'infinite',
  },
  wiggle: {
    label: 'Wiggle (shake)',
    keyframes: `@keyframes aic-wiggle { 0%,100% { transform:rotate(0) } 20% { transform:rotate(-12deg) } 40% { transform:rotate(10deg) } 60% { transform:rotate(-8deg) } 80% { transform:rotate(5deg) } }`,
    speeds: { slow: '1.2s ease-in-out', medium: '0.8s ease-in-out', fast: '0.5s ease-in-out' },
    timing: 'infinite',
  },
  ping: {
    label: 'Ping (radar pulse)',
    keyframes: `@keyframes aic-ping { 0% { transform:scale(1); opacity:1; } 50% { transform:scale(1.15); opacity:0.55; } 100% { transform:scale(1); opacity:1; } }`,
    speeds: { slow: '2.5s ease-in-out', medium: '1.5s ease-in-out', fast: '0.8s ease-in-out' },
    timing: 'infinite',
  },
  bounce: {
    label: 'Bounce (music)',
    keyframes: `@keyframes aic-bounce { 0%,100% { transform:translateY(0); } 25% { transform:translateY(-4px); } 75% { transform:translateY(2px); } }`,
    speeds: { slow: '2s ease-in-out', medium: '1.2s ease-in-out', fast: '0.7s ease-in-out' },
    timing: 'infinite',
  },
  breathe: {
    label: 'Breathe (scale + hue)',
    keyframes: `@keyframes aic-breathe { 0%,100% { transform:scale(1); filter:hue-rotate(0deg); } 50% { transform:scale(1.06); filter:hue-rotate(15deg); } }`,
    speeds: { slow: '5s ease-in-out', medium: '3.5s ease-in-out', fast: '2s ease-in-out' },
    timing: 'infinite',
  },
  slide: {
    label: 'Slide (vertical)',
    keyframes: `@keyframes aic-slide { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }`,
    speeds: { slow: '2s ease-in-out', medium: '1.2s ease-in-out', fast: '0.7s ease-in-out' },
    timing: 'infinite',
  },
  roam: {
    label: 'Roam (wander)',
    keyframes: `@keyframes aic-roam { 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(3px,-2px) rotate(4deg)} 50%{transform:translate(-2px,2px) rotate(-3deg)} 75%{transform:translate(2px,3px) rotate(2deg)} }`,
    speeds: { slow: '3.5s ease-in-out', medium: '2s ease-in-out', fast: '1.2s ease-in-out' },
    timing: 'infinite',
  },
  heat: {
    label: 'Heat (blue ripple)',
    keyframes: `@keyframes aic-heat { 0%,100% { filter:drop-shadow(0 0 3px rgba(0,150,255,0.5)); transform:scale(1); } 50% { filter:drop-shadow(0 0 12px rgba(0,180,255,0.9)); transform:scale(1.04); } }`,
    speeds: { slow: '3.5s ease-in-out', medium: '2.2s ease-in-out', fast: '1.2s ease-in-out' },
    timing: 'infinite',
  },
  alert: {
    label: 'Alert (urgent flash)',
    keyframes: `@keyframes aic-alert { 0%,100% { opacity:1; } 50% { opacity:0.25; } }`,
    speeds: { slow: '1.2s ease-in-out', medium: '0.7s ease-in-out', fast: '0.4s ease-in-out' },
    timing: 'infinite',
  },
};

// Domain -> default animation + trigger states
const DOMAIN_DEFAULTS = {
  fan:                   { animation: 'spin',    speed: 'medium', states: ['on'] },
  light:                 { animation: 'glow',    speed: 'medium', states: ['on'] },
  switch:                { animation: 'pulse',   speed: 'medium', states: ['on'] },
  input_boolean:         { animation: 'pulse',   speed: 'medium', states: ['on'] },
  lock:                  { animation: 'wiggle',  speed: 'medium', states: ['unlocked', 'locking', 'unlocking'] },
  cover:                 { animation: 'slide',   speed: 'medium', states: ['opening', 'closing'] },
  binary_sensor:         { animation: 'ping',    speed: 'medium', states: ['on'] },
  media_player:          { animation: 'bounce',  speed: 'medium', states: ['playing', 'paused', 'on', 'idle'] },
  climate:               { animation: 'breathe', speed: 'slow',   states: ['heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only'] },
  vacuum:                { animation: 'roam',    speed: 'medium', states: ['cleaning', 'returning'] },
  water_heater:          { animation: 'heat',    speed: 'medium', states: ['on', 'electric', 'gas', 'eco'] },
  alarm_control_panel:   { animation: 'alert',   speed: 'fast',   states: ['triggered', 'pending'] },
  humidifier:            { animation: 'breathe', speed: 'medium', states: ['on'] },
  remote:                { animation: 'pulse',   speed: 'slow',   states: ['on'] },
  automation:            { animation: 'pulse',   speed: 'slow',   states: ['on'] },
  script:                { animation: 'pulse',   speed: 'fast',   states: ['on'] },
  timer:                 { animation: 'pulse',   speed: 'medium', states: ['active'] },
};

// Fan speed -> spin speed override
function getFanSpinSpeed(hass, entityId) {
  if (!hass || !entityId) return 'medium';
  const stateObj = hass.states[entityId];
  if (!stateObj) return 'medium';
  const pct = stateObj.attributes.percentage || 0;
  if (pct <= 33) return 'slow';
  if (pct <= 66) return 'medium';
  return 'fast';
}

// Get RGB color from light entity for glow-color animation
function getLightColor(hass, entityId) {
  if (!hass || !entityId) return null;
  const stateObj = hass.states[entityId];
  if (!stateObj || !stateObj.attributes.rgb_color) return null;
  const [r, g, b] = stateObj.attributes.rgb_color;
  return `rgba(${r},${g},${b},0.8)`;
}

// ═══════════════════════════════════════════════════════════
// MAIN CARD
// ═══════════════════════════════════════════════════════════

class AnimatedIconsCard extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._card = null;
    this._styleEl = null;
    this._rendered = false;
  }

  static getConfigElement() {
    return document.createElement(EDITOR_NAME);
  }

  static getStubConfig() {
    return {
      type: `custom:${CARD_NAME}`,
      animation: 'auto',
      speed: 'medium',
      card: { type: 'custom:mushroom-entity-card', entity: '' },
    };
  }

  setConfig(config) {
    if (!config.card) {
      throw new Error('You must define an inner card configuration.');
    }
    this._config = {
      animation: 'auto',
      speed: 'medium',
      trigger_state: '',
      trigger_entity: '',
      ...config,
    };
    this._rendered = false;
    if (this._hass) {
      this._buildCard();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._buildCard();
    }
    if (this._card) {
      this._card.hass = hass;
    }
    this._updateAnimation();
  }

  _buildCard() {
    if (!this._hass || !this._config.card) return;

    // Clear previous
    while (this.firstChild) this.removeChild(this.firstChild);

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('aic-wrapper');
    this.appendChild(wrapper);

    // Inject global keyframes style (once)
    if (!this._styleEl) {
      this._styleEl = document.createElement('style');
      this._styleEl.id = 'aic-keyframes';
      let css = '';
      for (const [, def] of Object.entries(ANIMATIONS)) {
        css += def.keyframes + '\n';
      }
      this._styleEl.textContent = css;
    }
    wrapper.appendChild(this._styleEl);

    // Create inner card using HA's card helper
    const cardConfig = { ...this._config.card };
    this._card = this._createCard(cardConfig);
    this._card.hass = this._hass;
    wrapper.appendChild(this._card);

    this._rendered = true;
  }

  _createCard(config) {
    const el = document.createElement('hui-error-card');

    // Use HA's built-in card creation helpers
    const helpers = window.loadCardHelpers ? window.loadCardHelpers() : null;
    if (helpers && helpers.then) {
      helpers.then((h) => {
        const card = h.createCardElement(config);
        card.hass = this._hass;
        if (el.parentElement) {
          el.parentElement.replaceChild(card, el);
        }
        this._card = card;
        // Re-apply animation after card replaces placeholder
        setTimeout(() => this._updateAnimation(), 100);
      });
    } else {
      // Fallback: try manual creation
      try {
        const tag = config.type.startsWith('custom:')
          ? config.type.substring(7)
          : `hui-${config.type}-card`;
        const card = document.createElement(tag);
        card.setConfig(config);
        card.hass = this._hass;
        return card;
      } catch (e) {
        el.setConfig({ type: 'error', error: e.message, origConfig: config });
      }
    }

    return el;
  }

  _getEntity() {
    const triggerEntity = this._config.trigger_entity;
    if (triggerEntity) return triggerEntity;
    // Try to find entity from inner card config
    const innerConfig = this._config.card || {};
    return innerConfig.entity || '';
  }

  _getDomain(entityId) {
    if (!entityId) return '';
    const parts = entityId.split('.');
    return parts.length > 1 ? parts[0] : '';
  }

  _isAnimationActive() {
    if (!this._hass) return false;

    const entityId = this._getEntity();
    if (!entityId) return false;

    const stateObj = this._hass.states[entityId];
    if (!stateObj) return false;
    const currentState = stateObj.state;

    // Custom trigger state
    if (this._config.trigger_state) {
      const triggers = this._config.trigger_state.split(',').map(s => s.trim());
      return triggers.includes(currentState);
    }

    // Auto-detect from domain defaults
    const domain = this._getDomain(entityId);
    const defaults = DOMAIN_DEFAULTS[domain];
    if (defaults) {
      return defaults.states.includes(currentState);
    }

    // Fallback: 'on' state
    return currentState === 'on';
  }

  _getAnimationConfig() {
    const entityId = this._getEntity();
    const domain = this._getDomain(entityId);
    const defaults = DOMAIN_DEFAULTS[domain] || { animation: 'pulse', speed: 'medium' };

    let animation = this._config.animation || 'auto';
    let speed = this._config.speed || 'medium';

    if (animation === 'auto') {
      animation = defaults.animation;

      // Special: light with rgb_color -> use glow-color
      if (domain === 'light' && this._hass && entityId) {
        const rgb = getLightColor(this._hass, entityId);
        if (rgb) animation = 'glow-color';
      }
    }

    // Special: fan speed override
    if (animation === 'spin' && domain === 'fan') {
      speed = getFanSpinSpeed(this._hass, entityId);
    }

    return { animation, speed };
  }

  _updateAnimation() {
    if (!this._card || !this._hass) return;

    const active = this._isAnimationActive();
    const { animation, speed } = this._getAnimationConfig();
    const animDef = ANIMATIONS[animation];

    if (!animDef || animation === 'none' || !active) {
      this._clearAnimation();
      return;
    }

    const animSpeed = animDef.speeds[speed] || animDef.speeds.medium;
    const animValue = `aic-${animation} ${animSpeed} ${animDef.timing}`;

    // Set color variable for glow-color
    let colorVar = '';
    if (animation === 'glow-color') {
      const entityId = this._getEntity();
      const rgb = getLightColor(this._hass, entityId);
      if (rgb) colorVar = `--aic-color: ${rgb};`;
    }

    // Inject animation CSS into the card's shadow DOM or directly
    this._injectAnimation(animValue, colorVar);
  }

  _injectAnimation(animValue, colorVar) {
    if (!this._card) return;

    const styleId = 'aic-inject';

    // Build CSS that targets all possible icon elements
    // This covers: Mushroom shape-icon, tile cards, entity cards, native HA cards
    const css = `
      ${colorVar ? `:host { ${colorVar} }` : ''}
      ha-state-icon, ha-icon {
        animation: ${animValue} !important;
        ${colorVar}
      }
    `;

    // Strategy 1: Inject into the card's shadow root (if accessible)
    const injectIntoShadow = (root) => {
      if (!root) return false;
      let existing = root.querySelector(`#${styleId}`);
      if (!existing) {
        existing = document.createElement('style');
        existing.id = styleId;
        root.appendChild(existing);
      }
      existing.textContent = css;
      return true;
    };

    // Try direct shadow root
    if (this._card.shadowRoot) {
      injectIntoShadow(this._card.shadowRoot);
    }

    // Also inject into nested shadow roots (Mushroom nests: card > ha-card > mushroom-shape-icon)
    this._deepInjectAnimation(this._card, animValue, colorVar, 0);
  }

  _deepInjectAnimation(el, animValue, colorVar, depth) {
    if (depth > 6 || !el) return;

    const styleId = 'aic-inject';
    const animCss = `animation: ${animValue} !important; ${colorVar || ''}`;

    // Direct icon elements at this level
    const icons = el.querySelectorAll ? el.querySelectorAll('ha-icon, ha-state-icon, ha-svg-icon') : [];
    icons.forEach(icon => {
      icon.style.cssText = icon.style.cssText.replace(/animation:[^;]*;?/g, '') + animCss;
    });

    // Shadow root
    if (el.shadowRoot) {
      const shadowIcons = el.shadowRoot.querySelectorAll('ha-icon, ha-state-icon, ha-svg-icon');
      shadowIcons.forEach(icon => {
        icon.style.cssText = icon.style.cssText.replace(/animation:[^;]*;?/g, '') + animCss;
      });

      // Inject keyframes into shadow root
      let existing = el.shadowRoot.querySelector(`#${styleId}`);
      if (!existing) {
        existing = document.createElement('style');
        existing.id = styleId;
        let kf = '';
        for (const [, def] of Object.entries(ANIMATIONS)) kf += def.keyframes + '\n';
        existing.textContent = kf;
        el.shadowRoot.appendChild(existing);
      }

      // Recurse into shadow children
      const children = el.shadowRoot.querySelectorAll('*');
      children.forEach(child => {
        if (child.shadowRoot || child.tagName?.toLowerCase().includes('icon')) {
          this._deepInjectAnimation(child, animValue, colorVar, depth + 1);
        }
      });
    }

    // Recurse into light DOM children that might have shadow roots
    if (el.children) {
      Array.from(el.children).forEach(child => {
        if (child.shadowRoot || child.tagName?.toLowerCase().includes('mushroom') ||
            child.tagName?.toLowerCase().includes('icon') ||
            child.tagName?.toLowerCase().includes('shape')) {
          this._deepInjectAnimation(child, animValue, colorVar, depth + 1);
        }
      });
    }
  }

  _clearAnimation() {
    if (!this._card) return;
    const clearInEl = (el, depth) => {
      if (depth > 6 || !el) return;
      const icons = el.querySelectorAll ? el.querySelectorAll('ha-icon, ha-state-icon, ha-svg-icon') : [];
      icons.forEach(icon => {
        icon.style.cssText = icon.style.cssText.replace(/animation:[^;]*;?/g, '');
      });
      if (el.shadowRoot) {
        const injectedStyle = el.shadowRoot.querySelector('#aic-inject');
        if (injectedStyle) injectedStyle.remove();
        const shadowIcons = el.shadowRoot.querySelectorAll('ha-icon, ha-state-icon, ha-svg-icon');
        shadowIcons.forEach(icon => {
          icon.style.cssText = icon.style.cssText.replace(/animation:[^;]*;?/g, '');
        });
        el.shadowRoot.querySelectorAll('*').forEach(child => {
          if (child.shadowRoot || child.tagName?.toLowerCase().includes('icon')) {
            clearInEl(child, depth + 1);
          }
        });
      }
      if (el.children) {
        Array.from(el.children).forEach(child => {
          if (child.shadowRoot || child.tagName?.toLowerCase().includes('mushroom') ||
              child.tagName?.toLowerCase().includes('icon')) {
            clearInEl(child, depth + 1);
          }
        });
      }
    };
    clearInEl(this._card, 0);
  }

  getCardSize() {
    return this._card && this._card.getCardSize ? this._card.getCardSize() : 1;
  }

  getLayoutOptions() {
    return this._card && this._card.getLayoutOptions ? this._card.getLayoutOptions() : {};
  }
}

// ═══════════════════════════════════════════════════════════
// VISUAL EDITOR
// ═══════════════════════════════════════════════════════════

class AnimatedIconsCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  _render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const animation = this._config.animation || 'auto';
    const speed = this._config.speed || 'medium';
    const triggerState = this._config.trigger_state || '';
    const triggerEntity = this._config.trigger_entity || '';

    const animOptions = [
      { value: 'auto', label: '🔮 Auto-detect (by domain)' },
      { value: 'none', label: '⛔ None (disabled)' },
      ...Object.entries(ANIMATIONS).map(([key, def]) => ({
        value: key,
        label: def.label,
      })),
    ];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .aic-editor {
          padding: 0;
        }
        .aic-field {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }
        .aic-field label {
          font-weight: 500;
          font-size: 13px;
          color: var(--primary-text-color);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .aic-field .hint {
          font-weight: 400;
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        select, input {
          padding: 10px 12px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          appearance: auto;
        }
        select:focus, input:focus {
          border-color: var(--primary-color);
        }
        .aic-section-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
          margin: 20px 0 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .aic-section-title:first-child {
          margin-top: 0;
        }
        .aic-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          background: var(--secondary-background-color, #f5f5f5);
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--secondary-text-color);
        }
        .aic-preview .preview-icon {
          font-size: 24px;
          display: inline-block;
        }
        .aic-preview .preview-icon.spinning {
          animation: aic-spin 1.5s linear infinite;
        }
        .aic-preview .preview-icon.glowing {
          animation: aic-glow 2.5s ease-in-out infinite;
        }
        .aic-preview .preview-icon.pulsing {
          animation: aic-pulse 3s ease-in-out infinite;
        }
        @keyframes aic-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes aic-glow { 0%,100% { filter: drop-shadow(0 0 2px rgba(255,180,50,0.4)); } 50% { filter: drop-shadow(0 0 10px rgba(255,180,50,0.9)); } }
        @keyframes aic-pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.1); opacity:0.8; } }
      </style>

      <div class="aic-editor">
        <div class="aic-section-title">Animation settings</div>

        <div class="aic-field">
          <label>Animation type</label>
          <select id="animation">
            ${animOptions.map(o => `<option value="${o.value}" ${animation === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
          <div class="hint">Auto-detect picks the best animation based on the entity domain (fan→spin, light→glow, etc.)</div>
        </div>

        <div class="aic-field">
          <label>Speed</label>
          <select id="speed">
            <option value="slow" ${speed === 'slow' ? 'selected' : ''}>🐢 Slow</option>
            <option value="medium" ${speed === 'medium' ? 'selected' : ''}>🚶 Medium</option>
            <option value="fast" ${speed === 'fast' ? 'selected' : ''}>🏃 Fast</option>
          </select>
          <div class="hint">Fan cards auto-adjust speed based on fan percentage when set to Auto-detect</div>
        </div>

        <div class="aic-section-title">Trigger conditions (optional)</div>

        <div class="aic-field">
          <label>Active states</label>
          <input type="text" id="trigger_state" value="${triggerState}" placeholder="auto (e.g. on,playing,heat)">
          <div class="hint">Comma-separated states that activate the animation. Leave empty for domain auto-detect.</div>
        </div>

        <div class="aic-field">
          <label>Trigger entity</label>
          <input type="text" id="trigger_entity" value="${triggerEntity}" placeholder="auto (uses inner card entity)">
          <div class="hint">Use a different entity to evaluate the trigger. Leave empty to use the inner card's entity.</div>
        </div>
      </div>
    `;

    // Bind events
    this.shadowRoot.querySelector('#animation').addEventListener('change', (e) => {
      this._updateConfig('animation', e.target.value);
    });
    this.shadowRoot.querySelector('#speed').addEventListener('change', (e) => {
      this._updateConfig('speed', e.target.value);
    });
    this.shadowRoot.querySelector('#trigger_state').addEventListener('change', (e) => {
      this._updateConfig('trigger_state', e.target.value);
    });
    this.shadowRoot.querySelector('#trigger_entity').addEventListener('change', (e) => {
      this._updateConfig('trigger_entity', e.target.value);
    });
  }

  _updateConfig(key, value) {
    this._config = { ...this._config, [key]: value };
    // Fire config-changed event for HA editor
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// ═══════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════

customElements.define(CARD_NAME, AnimatedIconsCard);
customElements.define(EDITOR_NAME, AnimatedIconsCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_NAME,
  name: 'Animated Icons Card',
  description: 'Wraps any card and adds animated icons based on entity state. Auto-detects by domain or manually configure animation type, speed, and trigger.',
  preview: true,
  documentationURL: 'https://github.com/crs2007/animated-icons-card',
});

console.info(
  `%c ANIMATED-ICONS-CARD %c v${CARD_VERSION} `,
  'color: white; background: #4A90D9; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #4A90D9; background: #E8F0FE; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
