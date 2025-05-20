// src/components/vocal-ai/audio-player.tsx
'use client';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  src: string | null;
  onPlaybackEnd?: () => void;
}

const AudioPlayer: FC<AudioPlayerProps> = ({ src, onPlaybackEnd }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (src && audioElement) {
      audioElement.src = src;
      audioElement.load(); // Ensure the new source is loaded
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            // Attempt to play on user interaction if autoplay fails
            const playOnClick = () => {
              audioElement.play().then(() => setIsPlaying(true)).catch(e => console.error("Error playing audio on click:", e));
              document.removeEventListener('click', playOnClick);
            }
            document.addEventListener('click', playOnClick);
          });
      }
    } else if (audioElement) {
      audioElement.pause();
      audioElement.src = ""; // Clear src
      setIsPlaying(false);
    }
  }, [src]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.muted = isMuted;
    }
  }, [isMuted]);

  const handleEnded = () => {
    setIsPlaying(false);
    if (onPlaybackEnd) {
      onPlaybackEnd();
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <>
      <audio ref={audioRef} onEnded={handleEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      {src && isPlaying && (
        <Button variant="ghost" size="icon" onClick={toggleMute} className="ml-2">
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
        </Button>
      )}
    </>
  );
};

export default AudioPlayer;
