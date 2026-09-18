import { HeartRateState, MediaState } from '../types';

export function getHeartIcon(bpm: number, tick: number = 0): string {
  if (bpm <= 0) return '🩶';
  const pulse = tick % 2 === 0 ? '❤️' : '💓';
  if (bpm >= 150) return tick % 2 === 0 ? '❤️‍🔥' : '💥';
  if (bpm >= 120) return tick % 2 === 0 ? '🧡' : '💛';
  if (bpm >= 90) return pulse;
  if (bpm >= 60) return tick % 2 === 0 ? '💚' : '💙';
  return '💜';
}

export function getBpmZoneName(bpm: number): string {
  if (bpm <= 0) return 'Inaktiv';
  if (bpm < 60) return 'Ruhe';
  if (bpm < 100) return 'Normal';
  if (bpm < 140) return 'Erhöht';
  if (bpm < 170) return 'Cardio';
  return 'Peak';
}

export function formatChatboxMessage(
  template: string,
  hrState: HeartRateState,
  mediaState: MediaState,
  customStatus: string,
  tick: number = 0,
  marqueeEnabled: boolean = false,
  marqueeWidth: number = 40
): { fullText: string; displayText: string; isOverflow: boolean } {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const clock = `${hours}:${minutes}`;
  const clockWithSec = `${hours}:${minutes}:${seconds}`;

  const hrBpmStr = hrState.bpm > 0 ? String(hrState.bpm) : '--';
  const hrIcon = getHeartIcon(hrState.bpm, tick);
  const hrZone = getBpmZoneName(hrState.bpm);

  const songTitle = mediaState.title.trim() || 'Keine Musik';
  const songArtist = mediaState.artist.trim();
  const fullSong = songArtist ? `${songTitle} - ${songArtist}` : songTitle;
  const musicIcon = mediaState.isPlaying ? '🎵' : '⏸️';

  const batteryStr = hrState.battery !== undefined ? `${hrState.battery}%` : '';

  let message = template
    .replace(/\{hr\}/g, hrBpmStr)
    .replace(/\{hr_icon\}/g, hrIcon)
    .replace(/\{hr_zone\}/g, hrZone)
    .replace(/\{song\}/g, fullSong)
    .replace(/\{song_title\}/g, songTitle)
    .replace(/\{song_artist\}/g, songArtist)
    .replace(/\{music_icon\}/g, musicIcon)
    .replace(/\{clock\}/g, clock)
    .replace(/\{clock_sec\}/g, clockWithSec)
    .replace(/\{custom_text\}/g, customStatus || '')
    .replace(/\{battery\}/g, batteryStr);

  // Clean multiple spaces and trim
  message = message.replace(/[ \t]+/g, ' ').trim();

  // VRChat hard limit is 144 characters
  const isOverflow = message.length > 144;

  let displayText = message;
  if (marqueeEnabled && message.length > marqueeWidth) {
    const loopStr = message + '   ✦   ';
    const startIdx = tick % loopStr.length;
    const doubleStr = loopStr + loopStr;
    displayText = doubleStr.substring(startIdx, startIdx + marqueeWidth);
  } else if (message.length > 144) {
    displayText = message.substring(0, 141) + '...';
  }

  return {
    fullText: message,
    displayText,
    isOverflow,
  };
}
