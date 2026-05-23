# IVANNURI OMEGA EQ — v4.1

Procesador de audio DSP con motor Orion Omega v8. Ecualizador paramétrico de 10 bandas, captura de audio del sistema, integración TIDAL (PKCE OAuth) y búsqueda YouTube.

## 🌐 App en vivo
**https://luisurielpimentelperez814-design.github.io/IVANNURI-OMEGA-EQ-PLUS-/**

## Correcciones v4.1
- ✅ Bug crítico del worklet de audio corregido (variable duplicada que crasheaba el motor DSP)
- ✅ Botón Capture ahora crea el motor antes de capturar (fix null engine)
- ✅ Fallback a micrófono en móviles donde getDisplayMedia no está disponible
- ✅ TIDAL OAuth 2.0 PKCE completo (sin backend, directo del navegador)
- ✅ Integración YouTube — búsqueda y apertura de tracks
- ✅ UI mejorada con panel YouTube y flujo TIDAL mejorado

## Redirect URI para TIDAL Developer Portal
`https://luisurielpimentelperez814-design.github.io/IVANNURI-OMEGA-EQ-PLUS-/`
