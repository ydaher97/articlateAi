'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CloudCog, LogOut, BookOpen, BarChart, FileText } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs ,deleteDoc, doc } from 'firebase/firestore';
import { createFirebaseClient } from '@/lib/firebase'; 

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [tasks, setTasks] = useState<{ id: string; task: any }[]>([]);
  const [newTask, setNewTask] = useState('');
  const { auth, firestore } = createFirebaseClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchTasks();
      } else {
        router.push('/auth/login'); 
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const fetchTasks = async () => {
    const tasksCollection = collection(firestore, 'tasks');
    const taskSnapshot = await getDocs(tasksCollection);
    const taskList = taskSnapshot.docs.map((doc) => ({
      id: doc.id, 
      task: doc.data().task, 
      userId: doc.data().userId,
    }));
    console.log(taskList);
    setTasks(taskList);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const tasksCollection = collection(firestore, 'tasks');
      await addDoc(tasksCollection, {
        task: newTask,
        userId: user?.uid,
        createdAt: new Date(),
      });
      setTasks((prev) => [...prev, { id: Date.now().toString(), task: newTask }]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log(taskId);
      const taskDoc = doc(firestore, 'tasks', taskId);
      await deleteDoc(taskDoc);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  console.log(user);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Writing Exercises Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome! <span className="text-muted-foreground">
             {user?.displayName}
          </span></h2>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center"
            onClick={() => router.push('/exercises')}
          >
            <BookOpen className="w-8 h-8 mb-2" />
            <span>Daily Exercise</span>
          </Button>

          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center"
            onClick={() => router.push('/exercises/submissions')}
          >
            <FileText className="w-8 h-8 mb-2" />
            <span>My Submissions</span>
          </Button>

          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center"
            onClick={() => router.push('/exercises/analytics')}
          >
            <BarChart className="w-8 h-8 mb-2" />
            <span>Progress Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
}