'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExerciseSettings, Difficulty, Category } from '@/components/exercise-settings';

export default function ExerciseSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<{ difficulty: Difficulty; category: Category }>({
    difficulty: 'intermediate',
    category: 'general'
  });

  const handleContinue = () => {
    // Store settings in localStorage for the exercises page to use
    localStorage.setItem('exerciseSettings', JSON.stringify(settings));
    router.push('/exercises');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Choose Your Exercise Settings</h1>
        <p className="text-muted-foreground">
          Select your preferred difficulty level and category to get started with your writing exercise.
        </p>
        
        <ExerciseSettings
          onSettingsChange={setSettings}
          initialSettings={settings}
        />

        <Button 
          onClick={handleContinue}
          className="w-full"
        >
          Continue to Exercise
        </Button>
      </div>
    </div>
  );
} 