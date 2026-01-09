import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSource: (url: string) => void;
  setPlaybackRate: (rate: number) => void;
  seek: (time: number) => void;
}

export function useAudioPlayer(onEnded?: () => void): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, [onEnded]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const setSource = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    play,
    pause,
    stop,
    setSource,
    setPlaybackRate,
    seek,
  };
}
