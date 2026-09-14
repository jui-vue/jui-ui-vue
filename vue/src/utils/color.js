// 원본(colorpicker.js)은 juijs 코어의 jui.include("util.color")에 의존하는데, 이 유틸은
// 이 리포에 vendoring되어 있지 않다(juijs 코어 자체가 외부 CDN 의존). 여기서는 원본이
// 실제로 사용한 4개 API(rgb/format/HSVtoRGB/RGBtoHSV/scale)만 동일한 시그니처로 재구현한다.

export function parseColor(str) {
    str = (str || "").trim()

    if (str.charAt(0) === "#") {
        let hex = str.slice(1)
        if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("")
        return {
            r: parseInt(hex.slice(0, 2), 16) || 0,
            g: parseInt(hex.slice(2, 4), 16) || 0,
            b: parseInt(hex.slice(4, 6), 16) || 0,
            a: 1
        }
    }

    const m = str.match(/rgba?\(([^)]+)\)/)
    if (m) {
        const parts = m[1].split(",").map((s) => parseFloat(s.trim()))
        return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts[3] !== undefined ? parts[3] : 1 }
    }

    return { r: 0, g: 0, b: 0, a: 1 }
}

export function formatColor(rgb, type) {
    const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))
    if (type === "hex") {
        const toHex = (n) => clamp(n).toString(16).padStart(2, "0")
        return "#" + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b)
    }
    const a = rgb.a !== undefined ? rgb.a : 1
    return a < 1
        ? `rgba(${clamp(rgb.r)}, ${clamp(rgb.g)}, ${clamp(rgb.b)}, ${a})`
        : `rgb(${clamp(rgb.r)}, ${clamp(rgb.g)}, ${clamp(rgb.b)})`
}

export function hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360 / 360
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)
    let r, g, b
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break
        case 1: r = q; g = v; b = p; break
        case 2: r = p; g = v; b = t; break
        case 3: r = p; g = q; b = v; break
        case 4: r = t; g = p; b = v; break
        default: r = v; g = p; b = q; break
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export function rgbToHsv(r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const v = max
    const d = max - min
    const s = max === 0 ? 0 : d / max
    let h = 0
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            default: h = (r - g) / d + 4; break
        }
        h /= 6
    }
    return { h: h * 360, s, v }
}

// scale().domain(startHex, endHex) -> fn(t, type) : 두 색 사이를 t(0~1)로 선형 보간
export function colorScale() {
    let startRgb, endRgb
    const fn = (t, type) => {
        const rgb = {
            r: startRgb.r + (endRgb.r - startRgb.r) * t,
            g: startRgb.g + (endRgb.g - startRgb.g) * t,
            b: startRgb.b + (endRgb.b - startRgb.b) * t
        }
        return formatColor(rgb, type)
    }
    fn.domain = (c1, c2) => {
        startRgb = parseColor(c1)
        endRgb = parseColor(c2)
        return fn
    }
    return fn
}
