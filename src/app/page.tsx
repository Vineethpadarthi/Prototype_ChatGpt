'use client';

import { useState, useEffect, useRef } from 'react';
import { BotIcon, Sun, Moon } from 'lucide-react';
import CommandInput from '@/components/vocal-ai/command-input';
import ConversationView, { type Message as ConversationMessage } from '@/components/vocal-ai/conversation-view';
import AudioPlayer from '@/components/vocal-ai/audio-player'; // This might be mainly used inside ConversationView
import { processVoiceCommand } from '@/ai/flows/process-voice-command';
import { synthesizeSpokenResponse } from '@/ai/flows/synthesize-spoken-response';
import { Button } from '@/components/ui/button';

export default function VocalAiPage() {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlayingAudioMessageId, setCurrentPlayingAudioMessageId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever conversation changes
    const bottomMarker = document.getElementById('conversation-bottom');
    bottomMarker?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    // Set initial theme based on system preference or local storage
    const storedTheme = localStorage.getItem('vocalai-theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Apply theme to HTML element
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('vocalai-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleCommandSubmit = async ({ command }: { command: string }) => {
    if (!command.trim() || isLoading) return;

    setIsLoading(true);
    const userMessageId = crypto.randomUUID();
    const newUserMessage: ConversationMessage = {
      id: userMessageId,
      sender: 'user',
      text: command,
      timestamp: Date.now(),
    };
    setConversation(prev => [...prev, newUserMessage]);

    try {
      const aiResponseOutput = await processVoiceCommand({ command });
      const aiResponseText = aiResponseOutput.response;
      
      let audioDataUri: string | undefined = undefined;
      if (aiResponseText) {
        try {
          const speechResponse = await synthesizeSpokenResponse({ text: aiResponseText });
          audioDataUri = speechResponse.audioDataUri;
        } catch (speechError) {
          console.error("Error synthesizing speech:", speechError);
          // Continue without audio, error is logged
        }
      }
      
      const aiMessageId = crypto.randomUUID();
      const newAiMessage: ConversationMessage = {
        id: aiMessageId,
        sender: 'ai',
        text: aiResponseText || "I'm sorry, I couldn't generate a response.",
        audioDataUri: audioDataUri,
        timestamp: Date.now(),
      };
      setConversation(prev => [...prev, newAiMessage]);
      
      if (audioDataUri) {
        setCurrentPlayingAudioMessageId(aiMessageId); // Trigger audio playback for this message
      }

    } catch (error) {
      console.error("Error processing command:", error);
      const errorMessageId = crypto.randomUUID();
      const newErrorMessage: ConversationMessage = {
        id: errorMessageId,
        sender: 'system-error',
        text: "Sorry, an unexpected error occurred. Please try again.",
        timestamp: Date.now(),
      };
      setConversation(prev => [...prev, newErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioPlaybackEnd = (messageId: string) => {
    if (currentPlayingAudioMessageId === messageId) {
      setCurrentPlayingAudioMessageId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shadow-sm">
        <div className="flex items-center gap-2">
          <BotIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-primary">VocalAI</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </header>

      <main className="flex-grow flex flex-col overflow-hidden">
        <ConversationView 
          messages={conversation}
          currentAudioId={currentPlayingAudioMessageId}
          onAudioPlaybackEnd={handleAudioPlaybackEnd}
        />
      </main>
      
      <CommandInput onSubmit={handleCommandSubmit} isLoading={isLoading} />
      {/* This AudioPlayer is effectively managed by ConversationView now */}
      {/* <AudioPlayer src={currentAudioForGlobalPlayer} onPlaybackEnd={() => setCurrentAudioForGlobalPlayer(null)} /> */}
    </div>
  );
}
