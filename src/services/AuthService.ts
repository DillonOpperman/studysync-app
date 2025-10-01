// src/services/AuthService.ts
import auth from '@react-native-firebase/auth';

export class AuthService {
  static async signUp(email: string, password: string) {
    return auth().createUserWithEmailAndPassword(email, password);
  }
  
  static async signIn(email: string, password: string) {
    return auth().signInWithEmailAndPassword(email, password);
  }
}