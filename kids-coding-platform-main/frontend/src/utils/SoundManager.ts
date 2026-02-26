// Sound Manager for Kids Coding Platform
// Provides context-aware audio feedback and background music

export type SoundType = 'click' | 'success' | 'error' | 'achievement' | 'levelUp' | 'background';

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  backgroundMusic: boolean;
}

class SoundManagerClass {
  private settings: SoundSettings = {
    enabled: true,
    volume: 0.7,
    backgroundMusic: true
  };

  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.loadSounds();
    this.loadSettings();
  }

  private loadSounds() {
    const sounds = [
      { key: 'click', path: '/sounds/click.mp3' },
      { key: 'success', path: '/sounds/success.mp3' },
      { key: 'error', path: '/sounds/error.mp3' }
    ];

    sounds.forEach(({ key, path }) => {
      try {
        const audio = new Audio(path);
        audio.preload = 'none'; // Don't preload to avoid 404 errors
        audio.volume = this.settings.volume;
        
        // Handle load errors gracefully
        audio.addEventListener('error', () => {
          // Sound file not found - fail silently
        });
        
        this.audioCache.set(key, audio);
      } catch (error) {
        // Failed to load sound - continue without audio
      }
    });
  }

  private loadSettings() {
    const saved = localStorage.getItem('soundSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  private saveSettings() {
    localStorage.setItem('soundSettings', JSON.stringify(this.settings));
  }

  play(soundType: SoundType, volume?: number) {
    if (!this.settings.enabled) return;

    const audio = this.audioCache.get(soundType);
    if (audio) {
      // Reset audio to beginning
      audio.currentTime = 0;
      audio.volume = volume || this.settings.volume;
      
      // Play with error handling
      audio.play().catch(error => {
        // Audio play failed - continue silently
      });
    }
  }

  // Contextual sound methods
  playClick() {
    this.play('click', 0.3);
  }

  playSuccess() {
    this.play('success', 0.6);
  }

  playError() {
    this.play('error', 0.5);
  }

  playAchievement() {
    // Play success sound with celebration effect
    this.playSuccess();
    setTimeout(() => this.playSuccess(), 200);
    setTimeout(() => this.playSuccess(), 400);
  }

  playLevelUp() {
    // Special level up sound sequence
    this.play('success', 0.8);
    setTimeout(() => this.play('success', 0.6), 300);
    setTimeout(() => this.play('success', 0.4), 600);
  }

  // Settings management
  setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    
    // Update all cached audio volumes
    this.audioCache.forEach(audio => {
      audio.volume = this.settings.volume;
    });
  }

  getSettings() {
    return { ...this.settings };
  }

  // React hook for component integration
  static useSound() {
    return {
      playClick: () => SoundManager.playClick(),
      playSuccess: () => SoundManager.playSuccess(),
      playError: () => SoundManager.playError(),
      playAchievement: () => SoundManager.playAchievement(),
      playLevelUp: () => SoundManager.playLevelUp(),
      settings: SoundManager.getSettings(),
      setEnabled: (enabled: boolean) => SoundManager.setEnabled(enabled),
      setVolume: (volume: number) => SoundManager.setVolume(volume)
    };
  }
}

export const SoundManager = new SoundManagerClass();

// React Hook
export const useSound = SoundManagerClass.useSound;
