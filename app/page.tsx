import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Our App</h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get started by creating an account or signing in to access your dashboard.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/login">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}