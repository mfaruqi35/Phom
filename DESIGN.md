# Phom — Design System Reference

## Typography

| Role              | Font              | Weight        | Keterangan                                |
| ----------------- | ----------------- | ------------- | ----------------------------------------- |
| Heading / Display | Plus Jakarta Sans | 600, 700, 800 | Hero, judul halaman, judul kartu          |
| Body / UI         | Inter             | 400, 500, 600 | Paragraf, label, input, button, teks umum |

Keduanya diambil dari Google Fonts.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

---

## Type Scale

| Token     | Size | Weight | Line Height | Dipakai untuk                           |
| --------- | ---- | ------ | ----------- | --------------------------------------- |
| `display` | 48px | 800    | 1.15        | Hero headline landing page              |
| `h1`      | 36px | 700    | 1.2         | Judul halaman utama                     |
| `h2`      | 28px | 700    | 1.25        | Judul seksi                             |
| `h3`      | 22px | 600    | 1.3         | Judul kartu, sub-seksi                  |
| `h4`      | 18px | 600    | 1.4         | Label grup, heading kecil               |
| `body-lg` | 16px | 400    | 1.6         | Paragraf utama                          |
| `body`    | 14px | 400    | 1.6         | Teks UI umum                            |
| `body-sm` | 13px | 400    | 1.5         | Teks pendukung, caption                 |
| `label`   | 12px | 500    | 1.4         | Label input, badge, chip                |
| `code`    | 13px | 400    | 1.6         | Monospace, gunakan font fallback sistem |

---

## Color Palette

### Light Mode

| Token            | Hex       | RGB           | Kegunaan                        |
| ---------------- | --------- | ------------- | ------------------------------- |
| `bg`             | `#F9FAFB` | 249, 250, 251 | Background halaman utama        |
| `surface`        | `#FFFFFF` | 255, 255, 255 | Card, panel, modal, bubble AI   |
| `surface-raised` | `#F3F4F6` | 243, 244, 246 | Card nested, input background   |
| `border`         | `#E5E7EB` | 229, 231, 235 | Border card, divider, separator |
| `border-focus`   | `#4F46E5` | 79, 70, 229   | Border input saat fokus         |
| `text-primary`   | `#111827` | 17, 24, 39    | Teks utama                      |
| `text-secondary` | `#6B7280` | 107, 114, 128 | Teks pendukung, placeholder     |
| `text-disabled`  | `#D1D5DB` | 209, 213, 219 | Teks disabled                   |

### Dark Mode

| Token                 | Hex       | RGB           | Kegunaan                      |
| --------------------- | --------- | ------------- | ----------------------------- |
| `bg-dark`             | `#0F1117` | 15, 17, 23    | Background halaman utama dark |
| `surface-dark`        | `#1A1D27` | 26, 29, 39    | Card, panel, modal dark       |
| `surface-raised-dark` | `#22263A` | 34, 38, 58    | Card nested dark              |
| `border-dark`         | `#2E3347` | 46, 51, 71    | Border dark mode              |
| `text-primary-dark`   | `#F9FAFB` | 249, 250, 251 | Teks utama dark               |
| `text-secondary-dark` | `#9CA3AF` | 156, 163, 175 | Teks pendukung dark           |

### Brand Colors

| Token             | Hex       | RGB           | Kegunaan                                      |
| ----------------- | --------- | ------------- | --------------------------------------------- |
| `primary`         | `#4F46E5` | 79, 70, 229   | Button utama, bubble user, focus ring, link   |
| `primary-hover`   | `#4338CA` | 67, 56, 202   | Hover state primary                           |
| `primary-active`  | `#3730A3` | 55, 48, 163   | Active/pressed state primary                  |
| `primary-subtle`  | `#EEF2FF` | 238, 242, 255 | Background chip selected, badge primary light |
| `primary-text-on` | `#FFFFFF` | 255, 255, 255 | Teks di atas primary button                   |

### Accent (Sanggahan AI)

| Token            | Hex       | RGB           | Kegunaan                             |
| ---------------- | --------- | ------------- | ------------------------------------ |
| `accent`         | `#F97316` | 249, 115, 22  | Bubble sanggahan AI, label sanggahan |
| `accent-hover`   | `#EA6C0A` | 234, 108, 10  | Hover state aksen                    |
| `accent-subtle`  | `#FFF7ED` | 255, 247, 237 | Background ringan aksen              |
| `accent-text-on` | `#FFFFFF` | 255, 255, 255 | Teks di atas accent bubble           |

### Semantic Colors

| Token            | Hex       | RGB           | Kegunaan                                     |
| ---------------- | --------- | ------------- | -------------------------------------------- |
| `success`        | `#22C55E` | 34, 197, 94   | Status ready, skor tinggi, is_satisfied true |
| `success-subtle` | `#F0FDF4` | 240, 253, 244 | Background badge success                     |
| `danger`         | `#EF4444` | 239, 68, 68   | Error, status failed, skor rendah            |
| `danger-subtle`  | `#FEF2F2` | 254, 242, 242 | Background badge danger                      |
| `warning`        | `#F59E0B` | 245, 158, 11  | Skor sedang, peringatan                      |
| `warning-subtle` | `#FFFBEB` | 255, 251, 235 | Background badge warning                     |

---

## Color Usage per Komponen

### Chat Bubble

| Bubble        | Background                   | Text           | Border   |
| ------------- | ---------------------------- | -------------- | -------- |
| Pertanyaan AI | `surface` / `#FFFFFF`        | `text-primary` | `border` |
| Jawaban User  | `primary` / `#4F46E5`        | `#FFFFFF`      | —        |
| Sanggahan AI  | `accent` / `#F97316`         | `#FFFFFF`      | —        |
| Loading AI    | `surface-raised` / `#F3F4F6` | —              | —        |

### Skor & Evaluation

| Kondisi              | Warna               |
| -------------------- | ------------------- |
| Skor tinggi (80-100) | `success` `#22C55E` |
| Skor sedang (50-79)  | `warning` `#F59E0B` |
| Skor rendah (0-49)   | `danger` `#EF4444`  |

### Status Dokumen

| Status       | Warna               |
| ------------ | ------------------- |
| `processing` | `warning` `#F59E0B` |
| `ready`      | `success` `#22C55E` |
| `failed`     | `danger` `#EF4444`  |

---

## CSS Variables (Tailwind Config Reference)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: "#F9FAFB",
        "bg-dark": "#0F1117",
        surface: "#FFFFFF",
        "surface-dark": "#1A1D27",
        "surface-raised": "#F3F4F6",
        "surface-raised-dark": "#22263A",
        border: "#E5E7EB",
        "border-dark": "#2E3347",
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          active: "#3730A3",
          subtle: "#EEF2FF",
        },
        accent: {
          DEFAULT: "#F97316",
          hover: "#EA6C0A",
          subtle: "#FFF7ED",
        },
        success: {
          DEFAULT: "#22C55E",
          subtle: "#F0FDF4",
        },
        danger: {
          DEFAULT: "#EF4444",
          subtle: "#FEF2F2",
        },
        warning: {
          DEFAULT: "#F59E0B",
          subtle: "#FFFBEB",
        },
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
};
```

---

## Spacing & Radius

| Token         | Value  | Kegunaan               |
| ------------- | ------ | ---------------------- |
| `radius-sm`   | 6px    | Badge, chip, input     |
| `radius-md`   | 10px   | Card, button           |
| `radius-lg`   | 16px   | Modal, panel besar     |
| `radius-xl`   | 24px   | Card hero, bubble chat |
| `radius-full` | 9999px | Avatar, toggle, pill   |

---

## Shadow

| Token            | Value                             | Kegunaan             |
| ---------------- | --------------------------------- | -------------------- |
| `shadow-sm`      | `0 1px 3px rgba(0,0,0,0.08)`      | Card default         |
| `shadow-md`      | `0 4px 12px rgba(0,0,0,0.10)`     | Card hover, dropdown |
| `shadow-lg`      | `0 8px 24px rgba(0,0,0,0.12)`     | Modal                |
| `shadow-primary` | `0 4px 14px rgba(79,70,229,0.35)` | Button primary hover |
