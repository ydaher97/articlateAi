'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFirebaseClient } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Analytics {
  totalSubmissions: number;
  averageClarity: number;
  averageCoherence: number;
  averageConciseness: number;
  streak: number;
  lastSubmissionDate: Date | null;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSubmissions: 0,
    averageClarity: 0,
    averageCoherence: 0,
    averageConciseness: 0,
    streak: 0,
    lastSubmissionDate: null
  });
  const router = useRouter();
  const { firestore } = createFirebaseClient();
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) {
      fetchAnalytics();
    } else {
      router.push('/auth/login');
    }
  }, [auth.currentUser]);

  const fetchAnalytics = async () => {
    try {
      const submissionsRef = collection(firestore, 'submissions');
      const q = query(
        submissionsRef,
        where('userId', '==', auth.currentUser?.uid)
      );
      
      const snapshot = await getDocs(q);
      const submissions = snapshot.docs.map(doc => doc.data());
      
      const totalSubmissions = submissions.length;
      const feedbacks = submissions
        .filter(sub => sub.feedback)
        .map(sub => sub.feedback);
      
      const averageClarity = feedbacks.length > 0
        ? feedbacks.reduce((acc, curr) => acc + curr.clarity, 0) / feedbacks.length
        : 0;
      
      const averageCoherence = feedbacks.length > 0
        ? feedbacks.reduce((acc, curr) => acc + curr.coherence, 0) / feedbacks.length
        : 0;
      
      const averageConciseness = feedbacks.length > 0
        ? feedbacks.reduce((acc, curr) => acc + curr.conciseness, 0) / feedbacks.length
        : 0;

      // Calculate streak
      const sortedSubmissions = submissions
        .sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate());
      
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const submission of sortedSubmissions) {
        const submissionDate = submission.submittedAt.toDate();
        submissionDate.setHours(0, 0, 0, 0);

        if (currentDate.getTime() === submissionDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      setAnalytics({
        totalSubmissions,
        averageClarity,
        averageCoherence,
        averageConciseness,
        streak,
        lastSubmissionDate: sortedSubmissions[0]?.submittedAt.toDate() || null
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Progress</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.totalSubmissions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.streak} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Clarity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.averageClarity.toFixed(1)}/10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Coherence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.averageCoherence.toFixed(1)}/10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Conciseness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.averageConciseness.toFixed(1)}/10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {analytics.lastSubmissionDate
                ? analytics.lastSubmissionDate.toLocaleDateString()
                : 'No submissions yet'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 