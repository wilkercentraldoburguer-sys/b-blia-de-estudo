import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";

export default function AudioPlayer({ verses, bookName, chapter }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState([1]);
  const utteranceRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synthRef.current.getVoices();
      const portugueseVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('pt') || voice.lang.includes('BR')
      );
      const voicesToUse = portugueseVoices.length > 0 ? portugueseVoices : availableVoices;
      setVoices(voicesToUse);
      if (voicesToUse.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesToUse[0].name);
      }
    };

    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      synthRef.current.cancel();
    };
  }, []);

  const speakVerse = (index) => {
    if (!verses || verses.length === 0) return;

    synthRef.current.cancel();

    const text = `${bookName}, capítulo ${chapter}, versículo ${index + 1}. ${verses[index].text}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.volume = isMuted ? 0 : volume[0] / 100;
    utterance.rate = rate[0];
    utterance.pitch = 1;

    utterance.onend = () => {
      if (index < verses.length - 1) {
        setCurrentVerseIndex(index + 1);
        speakVerse(index + 1);
      } else {
        setIsPlaying(false);
        setCurrentVerseIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handlePlay = () => {
    if (verses.length === 0) return;
    setIsPlaying(true);
    speakVerse(currentVerseIndex);
  };

  const handlePause = () => {
    setIsPlaying(false);
    synthRef.current.cancel();
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentVerseIndex(0);
    synthRef.current.cancel();
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (value[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    return () => {
      synthRef.current.cancel();
    };
  }, [bookName, chapter]);

  if (!verses || verses.length === 0) return null;

  return (
    <Card className="bg-card border-border p-4 sm:p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              onClick={handleStop}
              variant="outline"
              size="lg"
              disabled={!isPlaying && currentVerseIndex === 0}
            >
              <Square className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="flex-shrink-0"
            >
              {isMuted || volume[0] === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>

        {isPlaying && (
          <div className="bg-secondary rounded-lg p-3 border border-border">
            <p className="text-sm text-primary font-semibold">
              Lendo versículo {currentVerseIndex + 1} de {verses.length}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {voices.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Voz:
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Selecionar voz" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Velocidade: {rate[0].toFixed(1)}x
            </label>
            <Slider
              value={rate}
              onValueChange={setRate}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x (Lento)</span>
              <span>1x (Normal)</span>
              <span>2x (Rápido)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}