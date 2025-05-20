// src/components/vocal-ai/conversation-view.tsx
'use client';

import type { FC } from 'react';
import { User, Bot, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import AudioPlayer from './audio-player';

export type Message = {
  id: string;
  sender: 'user' | 'ai' | 'system-error';
  text: string;
  audioDataUri?: string;
  timestamp: number;
};

interface ConversationViewProps {
  messages: Message[];
  currentAudioId: string | null;
  onAudioPlaybackEnd: (messageId: string) => void;
}

const ConversationView: FC<ConversationViewProps> = ({ messages, currentAudioId, onAudioPlaybackEnd }) => {
  return (
    <ScrollArea className="flex-grow h-full p-4 sm:p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-end gap-2 w-full',
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.sender !== 'user' && (
            <Avatar className="h-8 w-8 self-start shadow-sm">
              <AvatarFallback className={cn(
                message.sender === 'ai' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground' 
              )}>
                {message.sender === 'ai' ? <Bot size={18} /> : <AlertTriangle size={18} />}
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              'max-w-[70%] rounded-xl px-4 py-3 shadow-md text-sm sm:text-base leading-relaxed',
              message.sender === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-none'
                : message.sender === 'ai'
                ? 'bg-card text-card-foreground rounded-bl-none border'
                : 'bg-destructive/20 text-destructive-foreground rounded-bl-none border border-destructive'
            )}
          >
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.sender === 'ai' && message.audioDataUri && (
               <div className="mt-2">
                 <AudioPlayer 
                    src={currentAudioId === message.id ? message.audioDataUri : null} 
                    onPlaybackEnd={() => onAudioPlaybackEnd(message.id)}
                  />
               </div>
            )}
          </div>
          {message.sender === 'user' && (
             <Avatar className="h-8 w-8 self-start shadow-sm">
              <AvatarFallback className="bg-accent text-accent-foreground">
                <User size={18}/>
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
       <div id="conversation-bottom" />
    </ScrollArea>
  );
};

export default ConversationView;
