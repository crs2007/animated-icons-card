# Installation Guide — Animated Icons Card
# For Sharon's HA setup on RPi4

## Step 1: Copy the file to your HA config

SSH or use File Editor add-on:
```
/config/www/animated-icons-card.js
```

Or via terminal:
```bash
mkdir -p /hacsfiles/animated-icons-card
# Copy animated-icons-card.js into /hacsfiles/animated-icons-card/
```

## Step 2: Add as a Lovelace resource

Go to: Settings → Dashboards → ⋮ (top right) → Resources → Add Resource

- URL: `/hacsfiles/animated-icons-card/animated-icons-card.js`
- Resource type: JavaScript Module

Click Create. Then **refresh your browser** (Ctrl+Shift+R).

## Step 3: Use on any card

### Option A — Visual Editor
1. Edit your Mushroom dashboard
2. Add Card → search for "Animated Icons Card"
3. You'll see the animation settings editor
4. For the inner card config, switch to YAML and paste your existing card config under the `card:` key

### Option B — YAML (faster for existing cards)
Wrap any existing card by adding the animated-icons-card around it.

**Before:**
```yaml
type: custom:mushroom-light-card
entity: light.local_entrance_light
icon: hue:ceiling-devere
name: Entrance
layout: vertical
```

**After:**
```yaml
type: custom:animated-icons-card
card:
  type: custom:mushroom-light-card
  entity: light.local_entrance_light
  icon: hue:ceiling-devere
  name: Entrance
  layout: vertical
```

That's it — auto-detect does the rest. The light will glow when on.

## Examples for your specific entities

### Office ceiling fan (speed-aware spin)
```yaml
type: custom:animated-icons-card
card:
  type: custom:mushroom-template-card
  primary: Office Ceiling Fan
  icon: mdi:ceiling-fan-light
  entity: fan.local_office_ceiling_fan
  icon_color: >-
    {% set light = states('light.local_office_ceiling_fan') %}
    {% set fan_on = is_state('fan.local_office_ceiling_fan', 'on') %}
    {% if light == 'on' and fan_on %}amber
    {% elif light == 'on' %}yellow
    {% elif fan_on %}blue
    {% else %}grey{% endif %}
```

### Boiler (override: heat animation instead of default pulse)
```yaml
type: custom:animated-icons-card
animation: heat
card:
  type: custom:mushroom-entity-card
  entity: switch.dvd_shmsh_socket_1
  name: Boiler
  icon: mdi:water-boiler
```

### Front door lock
```yaml
type: custom:animated-icons-card
card:
  type: custom:mushroom-entity-card
  entity: lock.front_door
  icon: mdi:door-closed-lock
```
(Auto-detect: wiggles when unlocked)

### Aroma diffuser (override: breathe instead of pulse)
```yaml
type: custom:animated-icons-card
animation: breathe
card:
  type: custom:mushroom-entity-card
  entity: switch.aroma_diffuser
  icon: phu:essential-oil-diffuser
```

### Washing machine (trigger from template sensor)
```yaml
type: custom:animated-icons-card
animation: spin
speed: slow
trigger_entity: binary_sensor.washing_machine_operating
card:
  type: custom:mushroom-entity-card
  entity: binary_sensor.washing_machine_operating
  icon: mdi:washing-machine
  name: Washing Machine
```

### Parents room fan (Mushroom fan card with built-in controls)
```yaml
type: custom:animated-icons-card
card:
  type: custom:mushroom-fan-card
  entity: fan.nisko_parents_fan
  show_percentage_control: true
  show_oscillate_control: true
  collapsible_controls: true
```
(Auto-detect: spin speed matches fan percentage)

## Notes

- The card wraps your existing card — all tap actions, controls,
  and features of the inner card work exactly as before
- Works alongside your existing card_mod styles (border colors, backgrounds)
- Custom icons (hue:, phu:, cbi:) are fully supported
- No need for card_mod for the animation part — this card handles it
- You can still use card_mod on the inner card for other styling
