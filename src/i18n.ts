export const t = (key: string, lang: string): string => {
  const dict: Record<string, Record<string, string>> = {
    "system.idle": {
      en: "SYSTEM: IDLE",
      es: "SISTEMA: INACTIVO",
      fr: "SYSTÈME: REPOS",
    },
    "system.uncompromised": {
      en: "SYSTEM: UNCOMPROMISED",
      es: "SISTEMA: EN LÍNEA",
      fr: "SYSTÈME: EN LIGNE",
    },
    "nav.discover": {
      en: "DISCOVER",
      es: "DESCUBRIR",
      fr: "DÉCOUVRIR",
    },
    "nav.studio": {
      en: "EQ STUDIO",
      es: "ESTUDIO EQ",
      fr: "STUDIO EQ",
    },
    "nav.integration": {
      en: "INTEGRATION",
      es: "INTEGRACIÓN",
      fr: "INTÉGRATION",
    },
    "search.placeholder": {
      en: "Find tracks...",
      es: "Buscar pistas...",
      fr: "Rechercher...",
    },
    "settings.title": {
      en: "Configuration",
      es: "Configuración",
      fr: "Configuration",
    },
    "settings.language": {
      en: "Display Language",
      es: "Idioma de Interfaz",
      fr: "Langue d'affichage",
    },
    "settings.theme": {
      en: "Theme Accent",
      es: "Acento de Tema",
      fr: "Thème",
    },
    "settings.close": {
      en: "SAVE & CLOSE",
      es: "GUARDAR Y CERRAR",
      fr: "SAUVEGARDER & FERMER",
    },
    "settings.dsp.title": {
      en: "ORION-Ω v8 Advanced DSP Modules",
      es: "Módulos Avanzados DSP ORION-Ω v8",
      fr: "Modules DSP avancés ORION-Ω v8",
    },
    "settings.dsp.hrtf": {
      en: "Quantum HRTF & Chaotic Reverb",
      es: "HRTF Cuántico y Reverb Caótica",
      fr: "HRTF Quantique & Reverb Chaotique"
    },
    "settings.dsp.neural": {
      en: "Neural Harmonics Gen (>22kHz)",
      es: "Gen. de Armónicos Neural (>22kHz)",
      fr: "Génération Harmonique Neurale (>22kHz)",
    },
    "settings.dsp.adaptive": {
      en: "KL Frame-Adaptive Antigranularity",
      es: "Antigranularidad KL Adaptativa",
      fr: "Anti-granularité KL Adaptative",
    },
    "settings.dsp.holographic": {
      en: "8D Holographic Upmix",
      es: "Upmix Holográfico 8D",
      fr: "Upmix Holographique 8D",
    },
    "settings.dsp.pll": {
      en: "Aerospace PLL Anti-Jitter",
      es: "Anti-Jitter PLL Aeroespacial",
      fr: "Anti-Jitter PLL Aérospatial",
    },
    "settings.dsp.streaming": {
      en: "Hi-Res Streaming Integration",
      es: "Integración Streaming Hi-Res",
      fr: "Intégration Streaming Haute Résolution",
    },
    "settings.dsp.mutation": {
      en: "Quantum Mutation (Analog Magic)",
      es: "Mutación Cuántica (Magia Analógica)",
      fr: "Mutation Quantique (Magie Analogique)",
    },
    "hero.ai": {
      en: "AI DRIVEN",
      es: "IMPULSADO POR IA",
      fr: "PROPULSÉ PAR L'IA",
    },
    "hero.subtitle": {
      en: "Advanced hardware-level audio manipulation via WebAudio API directly in the browser.",
      es: "Manipulación de audio avanzada a nivel de hardware mediante WebAudio API directamente en el navegador.",
      fr: "Manipulation audio avancée au niveau matériel via WebAudio API directamente dans le navigateur."
    },
    "hero.start": {
      en: "START PLAYBACK",
      es: "INICIAR REPRODUCCIÓN",
      fr: "DÉMARRER LA LECTURE",
    },
    "tidal.title": {
      en: "Real-Time Audio Interception",
      es: "Intercepción de Audio en Tiempo Real",
      fr: "Interception Audio en Temps Réel",
    },
    "tidal.info": {
      en: "<b>For Mobile:</b> Due to copyright, we can only play 30s previews directly. To process full songs, use \"CAPTURE MICROPHONE\" (above) and play Spotify/YouTube in the background.<br/><br/><b>For PC/Desktop:</b> Open YouTube Music or Spotify in another tab! Click \"INTERCEPT TAB (PC)\" and select the tab, checking \"Share audio\" to pass full songs through our DSP engine.",
      es: "<b>Para Móvil:</b> Por derechos de autor solo reproducimos pruebas de 30s directamente. Para canciones completas, usa \"CAPTURAR MICRÓFONO\" (arriba) y reproduce Spotify/YouTube de fondo.<br/><br/><b>Para PC/Desktop:</b> ¡Abre YouTube Music o Spotify en otra pestaña! Haz clic en \"INTERCEPTAR PESTAÑA (PC)\" y selecciona la pestaña, marcando \"Compartir audio\" para procesarlas completas.",
      fr: "<b>Pour Mobile:</b> Pour des razones de droits d'auteur, nous ne jouons que des aperçus de 30s. Pour des chansons complètes, utilisez \"CAPTURER LE MICRO\" et jouez Spotify en arrière-plan.<br/><br/><b>Pour PC/Bureau:</b> Ouvrez YouTube Music ou Spotify dans un autre onglet! Cliquez sur \"INTERCEPTER L'ONGLET\" et cochez \"Partager l'audio\" pour les traiter en entier."
    },
    "btn.intercept": {
      en: "▶ INTERCEPT TAB (PC)",
      es: "▶ INTERCEPTAR PESTAÑA (PC)",
      fr: "▶ INTERCEPTER L'ONGLET",
    },
    "btn.intercept.stop": {
      en: "⏹ DISCONNECT TAB",
      es: "⏹ DESCONECTAR PESTAÑA",
      fr: "⏹ DÉCONNECTER L'ONGLET",
    },
    "btn.mic": {
      en: "🎙️ CAPTURE MICROPHONE",
      es: "🎙️ CAPTURAR MICRÓFONO",
      fr: "🎙️ CAPTURER LE MICRO",
    },
    "btn.mic.stop": {
      en: "⏹ STOP MICROPHONE",
      es: "⏹ DETENER MICRÓFONO",
      fr: "⏹ ARRÊTER LE MICRO",
    },
    "btn.simulate": {
      en: "SIMULATE STREAM",
      es: "SIMULAR STREAM",
      fr: "SIMULER LE STREAM",
    },
    "bt.redirect": {
      en: "Redirect to Bluetooth / Jack 3.5 / Line Out",
      es: "Redirigir a Bluetooth / Jack 3.5 / Salida de Línea",
      fr: "Rediriger vers Bluetooth / Jack 3.5 / Ligne",
    },
    "bt.device": {
      en: "Output Device",
      es: "Dispositivo de Salida",
      fr: "Périphérique de Sortie",
    },
    "btn.local": {
      en: "Local Library",
      es: "Librería Local",
      fr: "Bibliothèque Locale",
    },
    "btn.mutate": {
      en: "Mutation",
      es: "Mutación",
      fr: "Mutation",
    },
    "btn.hash": {
      en: "Correction Hash",
      es: "Hash de Corrección",
      fr: "Hash de Correction",
    },
    "btn.neural": {
      en: "Neural Optimization",
      es: "Optimización Neuronal",
      fr: "Optimisation Neurale",
    },
    "label.neuralBoost": {
      en: "Neural Boost",
      es: "Impulso Neuronal",
      fr: "Boost Neural",
    },
    "tt.drive": {
      en: "Drive: Controls the input signal saturation, range 1-10",
      es: "Drive: Controla la saturación de la señal de entrada, rango 1-10",
      fr: "Drive: Contrôle la saturation du signal d'entrée, plage 1-10",
    },
    "tt.warmth": {
      en: "Warmth: Adds analog tube-style warmth and harmonics, range 0-5",
      es: "Warmth: Añade calidez y armónicos estilo tubo analógico, rango 0-5",
      fr: "Warmth: Ajoute une chaleur et des harmoniques de style tube analogique, plage 0-5",
    },
    "tt.reverb": {
      en: "Reverb: Adjusts the quantum HRTF chaotic spatialization, range 0-1",
      es: "Reverb: Ajusta la espacialización caótica HRTF cuántica, rango 0-1",
      fr: "Reverb: Ajuste la spatialisation chaotique HRTF quantique, plage 0-1",
    },
    "tt.neuralBoost": {
      en: "Neural Boost: Excitation of high-order harmonics, range 0-1",
      es: "Impulso Neuronal: Excitación de armónicos de alto orden, rango 0-1",
      fr: "Boost Neural: Excitation des harmoniques d'ordre élevé, plage 0-1",
    },
    "tt.eqBand": {
      en: "EQ Band: Adjusts gain for this frequency, range -12dB to +12dB",
      es: "Banda EQ: Ajusta la ganancia para esta frecuencia, rango -12dB a +12dB",
      fr: "Bande EQ: Ajuste le gain pour cette fréquence, plage -12dB à +12dB",
    },
    "tt.hash": {
      en: "Integrity Hash: Verifies DSP pipeline consistency and neural convergence",
      es: "Hash de Integridad: Verifica la consistencia del pipeline DSP y convergencia neural",
      fr: "Hash d'Intégrité: Vérifie la cohérence du pipeline DSP et la convergence neurale",
    },
    "tt.sync": {
      en: "Sync Status: Real-time neural engine state and lock status",
      es: "Estado de Sinc: Estado del motor neural en tiempo real y bloqueo",
      fr: "État Sync: État du moteur neural en temps réel et verrouillage",
    },
    "tt.mutate": {
      en: "Mutation: Activates chaotic quantum variations in the signal",
      es: "Mutación: Activa variaciones cuánticas caóticas en la señal",
      fr: "Mutation: Active les variations quantiques chaotiques dans le signal",
    },
    "tt.neural": {
      en: "Neural: Toggles AI-driven adaptive frequency balancing",
      es: "Neural: Alterna el balance de frecuencia adaptativo impulsado por IA",
      fr: "Neural: Alterne l'équilibrage de fréquence adaptatif géré par l'IA",
    },
    "tt.intercept": {
      en: "Intercept: Routes audio from other applications via tab capture",
      es: "Interceptar: Enruta audio de otras aplicaciones mediante captura de pestaña",
      fr: "Intercepter: Oriente l'audio d'autres applications via la capture d'onglet",
    },
    "tt.play": {
      en: "Play/Pause: Controls the master audio playback",
      es: "Play/Pausa: Controla la reproducción de audio maestra",
      fr: "Jouer/Pause: Contrôle la lecture audio principale",
    },
    "tt.gain": {
      en: "Master Gain: Controls the final output volume level, range 0-200%",
      es: "Ganancia Maestra: Controla el nivel de volumen de salida final, rango 0-200%",
      fr: "Gain Principal: Contrôle le niveau de volume de sortie final, plage 0-200%",
    },
    "tt.local": {
      en: "Local Archive: Load audio files from your device storage",
      es: "Archivo Local: Carga archivos de audio desde el almacenamiento de tu dispositivo",
      fr: "Archive Locale: Chargez des fichiers audio depuis le stockage de votre appareil",
    },
    "tt.settings": {
      en: "Settings: Configure audio output and DSP modules",
      es: "Ajustes: Configura la salida de audio y los módulos DSP",
      fr: "Paramètres: Configurez la sortie audio et les modules DSP",
    },
    "tt.refresh": {
      en: "Refresh: Reload the music discovery library",
      es: "Refrescar: Recargar la librería de descubrimiento musical",
      fr: "Actualiser: Recharger la bibliothèque de découverte musicale",
    }
  };

  return dict[key]?.[lang] || dict[key]?.["en"] || key;
};
