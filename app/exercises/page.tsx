'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFirebaseClient } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, limit, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { generateExercise, gradeSubmission } from '@/lib/ai';
import { Difficulty, Category } from '@/components/exercise-settings';

interface Exercise {
  id: string;
  prompt: string;
  date: Date;
  difficulty: Difficulty;
  category: Category;
}

export default function ExercisesPage() {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [hundredWordResponse, setHundredWordResponse] = useState('');
  const [fiftyWordResponse, setFiftyWordResponse] = useState('');
  const [wordCount, setWordCount] = useState({ hundred: 0, fifty: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<{ difficulty: Difficulty; category: Category }>({
    difficulty: 'intermediate',
    category: 'general'
  });
  const router = useRouter();
  const { firestore } = createFirebaseClient();
  const auth = getAuth();

  useEffect(() => {
    // Get settings from localStorage
    const savedSettings = localStorage.getItem('exerciseSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      // If no settings found, redirect to settings page
      router.push('/exercise-settings');
    }
  }, [router]);

  useEffect(() => {
    if (settings.difficulty && settings.category) {
      fetchDailyExercise();
    }
  }, [settings]);

  const fetchDailyExercise = async () => {
    try {
      const exercisesRef = collection(firestore, 'exercises');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        exercisesRef,
        where('date', '>=', today),
        where('difficulty', '==', settings.difficulty),
        where('category', '==', settings.category),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const exercise = snapshot.docs[0];
        setCurrentExercise({
          id: exercise.id,
          prompt: exercise.data().prompt,
          date: exercise.data().date.toDate(),
          difficulty: exercise.data().difficulty,
          category: exercise.data().category
        });
      } else {
        // Generate new exercise if none exists for today
        const newPrompt = await generateExercise(settings.difficulty, settings.category);
        const newExercise = await addDoc(exercisesRef, {
          prompt: newPrompt,
          date: new Date(),
          difficulty: settings.difficulty,
          category: settings.category
        });
        
        setCurrentExercise({
          id: newExercise.id,
          prompt: newPrompt,
          date: new Date(),
          difficulty: settings.difficulty,
          category: settings.category
        });
      }
    } catch (error) {
      console.error('Error fetching exercise:', error);
    }
  };

  const handleWordCount = (text: string, type: 'hundred' | 'fifty') => {
    const count = text.trim().split(/\s+/).length;
    setWordCount(prev => ({ ...prev, [type]: count }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser || !currentExercise) {
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Add submission
      const submissionsRef = collection(firestore, 'submissions');
      const submissionDoc = await addDoc(submissionsRef, {
        userId: auth.currentUser.uid,
        exerciseId: currentExercise.id,
        hundredWordResponse,
        fiftyWordResponse,
        submittedAt: new Date(),
        status: 'grading',
        difficulty: currentExercise.difficulty,
        category: currentExercise.category
      });

      // Get AI feedback
      const feedback = await gradeSubmission(
        currentExercise.prompt,
        hundredWordResponse,
        fiftyWordResponse,
        currentExercise.difficulty
      );

      // Update submission with feedback
      await updateDoc(doc(firestore, 'submissions', submissionDoc.id), {
        status: 'completed',
        feedback
      });

      // Reset form
      setHundredWordResponse('');
      setFiftyWordResponse('');
      setWordCount({ hundred: 0, fifty: 0 });

      // Redirect to submissions page
      router.push('/exercises/submissions');
    } catch (error) {
      console.error('Error submitting exercise:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Writing Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          {currentExercise ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  {currentExercise.difficulty}
                </span>
                <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-md text-sm">
                  {currentExercise.category}
                </span>
              </div>
              <p className="text-lg mb-4">{currentExercise.prompt}</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">100-Word Summary</h3>
                  <Textarea
                    value={hundredWordResponse}
                    onChange={(e) => {
                      setHundredWordResponse(e.target.value);
                      handleWordCount(e.target.value, 'hundred');
                    }}
                    placeholder="Write your 100-word summary here..."
                    className="min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Word count: {wordCount.hundred}/100
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">50-Word Summary</h3>
                  <Textarea
                    value={fiftyWordResponse}
                    onChange={(e) => {
                      setFiftyWordResponse(e.target.value);
                      handleWordCount(e.target.value, 'fifty');
                    }}
                    placeholder="Write your 50-word summary here..."
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Word count: {wordCount.fifty}/50
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/exercise-settings')}
                  >
                    Change Settings
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={wordCount.hundred !== 100 || wordCount.fifty !== 50 || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Exercise'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p>Loading today's exercise...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 