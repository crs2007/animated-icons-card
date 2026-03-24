# Animated Icons Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/crs2007/animated-icons-card?style=for-the-badge)
![GitHub Release Date](https://img.shields.io/github/release-date/crs2007/animated-icons-card?style=for-the-badge)
![License](https://img.shields.io/github/license/crs2007/animated-icons-card?style=for-the-badge)
![HA Version](https://img.shields.io/badge/HA-2023.4%2B-blue?style=for-the-badge&logo=homeassistant)

A wrapper card that adds **animated icons** to any Home Assistant dashboard card — with a **visual editor** (no YAML needed).

Works with Mushroom cards, Tile cards, Entity cards, and any card that renders icons. Supports MDI, hass-hue-icons, and custom-brand-icons.

![Animated Icons Card](https://via.placeholder.com/800x400?text=Screenshot+Coming+Soon)

## Features

- **Visual editor** — dropdowns for animation type, speed, and trigger condition
- **Auto-detect by domain** — fans spin, lights glow, switches pulse, etc.
- **Fan speed awareness** — spin speed adjusts with fan percentage (slow/medium/fast)
- **Light color awareness** — glow color matches the light's RGB color
- **13 animation types** — spin, glow, pulse, wiggle, ping, bounce, breathe, slide, roam, heat, alert, and more
- **Custom trigger states** — animate on any state, not just "on"
- **Trigger entity override** — use a sensor to control when a different card animates
- **Zero dependencies** — no card-mod required

## Installation

### Manual

1. Download `animated-icons-card.js`
2. Copy to `/config/www/community/animated-icons-card/animated-icons-card.js`
3. Add resource in Home Assistant settings:
   - **Settings → Dashboards → ⋮ → Resources → Add Resource**
   - URL: `/hacsfiles/animated-icons-card/animated-icons-card.js`
   - Type: JavaScript Module

### HACS (Custom Repository)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=crs2007&repository=animated-icons-card&category=plugin)

1. In HACS, go to Frontend
2. Click ⋮ → Custom repositories
3. Add your repository URL, category: Lovelace
4. Install "Animated Icons Card"

## Usage

### Visual Editor

1. Edit your dashboard
2. Add card → search "Animated Icons"
3. Configure the inner card (the card you want to animate)
4. Choose animation settings from the dropdowns

### YAML

```yaml
type: custom:animated-icons-card
animation: auto          # auto|spin|glow|pulse|wiggle|ping|bounce|breathe|slide|roam|heat|alert|none
speed: medium            # slow|medium|fast
card:
  type: custom:mushroom-light-card
  entity: light.living_room
  layout: vertical
```

### Advanced: Custom Trigger

```yaml
type: custom:animated-icons-card
animation: heat
speed: fast
trigger_state: "on"
trigger_entity: sensor.boiler_power    # Use a different entity for trigger
card:
  type: custom:mushroom-entity-card
  entity: switch.boiler
```

### Advanced: Multiple Active States

```yaml
type: custom:animated-icons-card
trigger_state: "heat,cool,auto"        # Comma-separated states
card:
  type: custom:mushroom-climate-card
  entity: climate.living_room
```

## Animation Reference

| Animation | Effect | Best for |
|-----------|--------|----------|
| `spin` | Rotation (speed varies with fan %) | Fans, loading indicators |
| `glow` | Warm golden pulse | Lights (non-RGB) |
| `glow-color` | Pulse in entity's RGB color | RGB lights (auto-selected) |
| `pulse` | Scale throb | Switches, plugs, booleans |
| `wiggle` | Shake side to side | Locks, alerts |
| `ping` | Radar-style pulse | Motion sensors, binary sensors |
| `bounce` | Music-style bounce | Media players |
| `breathe` | Scale + hue shift | Climate, humidifiers |
| `slide` | Vertical slide | Covers, shutters |
| `roam` | Random wander | Vacuums |
| `heat` | Blue heat ripple | Boilers, water heaters |
| `alert` | Urgent flash | Alarm panels |

## Auto-Detect Mapping

When `animation: auto` (default), the card picks the animation based on the entity domain:

| Domain | Animation | Trigger States |
|--------|-----------|---------------|
| `fan` | spin (speed-aware) | on |
| `light` | glow / glow-color | on |
| `switch` | pulse | on |
| `lock` | wiggle | unlocked |
| `cover` | slide | opening, closing |
| `binary_sensor` | ping | on |
| `media_player` | bounce | playing, paused |
| `climate` | breathe | heat, cool, auto |
| `vacuum` | roam | cleaning |
| `alarm_control_panel` | alert | triggered |

## License

MIT
