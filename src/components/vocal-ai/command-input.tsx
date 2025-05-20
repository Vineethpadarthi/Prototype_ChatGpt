// src/components/vocal-ai/command-input.tsx
'use client';

import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mic, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  command: z.string().min(1, { message: 'Command cannot be empty.' }),
});

type CommandFormValues = z.infer<typeof formSchema>;

interface CommandInputProps {
  onSubmit: (values: CommandFormValues) => Promise<void>;
  isLoading: boolean;
}

const CommandInput: FC<CommandInputProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<CommandFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      command: '',
    },
  });

  const handleSubmit = async (values: CommandFormValues) => {
    await onSubmit(values);
    if (!isLoading) { // Reset form only if submission didn't get stuck in loading (e.g. due to unmount)
        form.reset();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-start gap-2 p-4 border-t bg-background">
        <FormField
          control={form.control}
          name="command"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input
                  placeholder="Ask VocalAI anything..."
                  autoComplete="off"
                  {...field}
                  className="text-base py-6 rounded-lg shadow-sm focus-visible:ring-accent"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          size="lg" 
          className="aspect-square p-0 h-auto rounded-lg shadow-sm self-stretch" // ensure button matches input height
          disabled={isLoading}
          aria-label={isLoading ? "Processing command" : "Submit command"}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Send className="h-6 w-6" />
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CommandInput;
