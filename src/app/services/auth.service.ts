import { Injectable } from '@angular/core';

import { User } from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { take, map, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';

export interface UserCredentials {
  nickname: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User = null;
  nickname = '';

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this.afAuth.authState.subscribe(res => {
      this.user = res;
      if (this.user) {
        this.db.doc(`users/${this.currentUserId}`).valueChanges().pipe(
          tap(result => {
            this.nickname = result['nickname'];
          })
        ).subscribe();
      }
    });
   }

  signUp(credentials: UserCredentials): Promise<void> {
    // creates new username with email and password but no nickname
    return this.afAuth.createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then((data) => {
        // create new document in 'users' collection, so nickname is not lost
        return this.db.doc(`users/${data.user.uid}`).set({
          nickname: credentials.nickname,
          email: data.user.email,
          created: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
  }

  isNicknameAvailable(name: string): Observable<any> {
    return this.db.collection('users', ref => ref.where('nickname', '==', name).limit(1)).valueChanges().pipe(
      take(1),
      map(user => {
        return user;
      })
    );
  }

  signIn(credentials: UserCredentials): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  resetPw(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  updateUser(nickname: string): Promise<void> {
    return this.db.doc(`users/${this.currentUserId}`).update({
      nickname
    });
  }

  get authenticated(): boolean {
    return this.user !== null;
  }

  get currentUser(): any {
    return this.authenticated ? this.user : null;
  }

  get currentUserId(): string {
    return this.authenticated ? this.user.uid : '';
  }
}
