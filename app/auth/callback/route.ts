import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createFirebaseClient } from '@/lib/firebase';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const idToken = requestUrl.searchParams.get('idToken');

  if (idToken) {
    try {
      const { auth } = createFirebaseClient();
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Error signing in with credential:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.redirect(new URL('/exercises', request.url));
}