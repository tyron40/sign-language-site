import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export const initializeAuthListener = () => {
  const { setUser, setLoading } = useAuthStore.getState();
  
  onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      setUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  });
};