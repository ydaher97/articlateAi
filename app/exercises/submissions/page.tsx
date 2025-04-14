'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFirebaseClient } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Submission {
  id: string;
  exerciseId: string;
  hundredWordResponse: string;
  fiftyWordResponse: string;
  submittedAt: Date;
  status: string;
  feedback?: {
    clarity: number;
    coherence: number;
    conciseness: number;
    comments: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const router = useRouter();
  const { firestore } = createFirebaseClient();
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) {
      fetchSubmissions();
    } else {
      router.push('/auth/login');
    }
  }, [auth.currentUser]);

  const fetchSubmissions = async () => {
    try {
      const submissionsRef = collection(firestore, 'submissions');
      const q = query(
        submissionsRef,
        where('userId', '==', auth.currentUser?.uid),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const submissionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate()
      })) as Submission[];
      
      setSubmissions(submissionsList);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Submissions</h1>
      
      <div className="space-y-6">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <CardTitle>
                Submission from {submission.submittedAt.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">100-Word Summary</h3>
                  <p className="text-muted-foreground">{submission.hundredWordResponse}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">50-Word Summary</h3>
                  <p className="text-muted-foreground">{submission.fiftyWordResponse}</p>
                </div>

                {submission.feedback && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Feedback</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Clarity</p>
                        <p className="text-lg font-semibold">{submission.feedback.clarity}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coherence</p>
                        <p className="text-lg font-semibold">{submission.feedback.coherence}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conciseness</p>
                        <p className="text-lg font-semibold">{submission.feedback.conciseness}/10</p>
                      </div>
                    </div>
                    <p className="text-sm">{submission.feedback.comments}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 