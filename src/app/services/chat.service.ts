import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, map, switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { forkJoin, from, Observable } from 'rxjs';
import {
  AngularFireStorage,
  AngularFireStorageReference,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private storage: AngularFireStorage
  ) {}

  findUser(value: string): Observable<{ id: string }[]>[] {
    const email = this.db
      .collection('users', (ref) => ref.where('email', '==', value))
      .snapshotChanges()
      .pipe(
        take(1),
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as {};
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
    const nickname = this.db
      .collection('users', (ref) => ref.where('nickname', '==', value))
      .snapshotChanges()
      .pipe(
        take(1),
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as {};
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
    return [email, nickname];
  }

  createGroup(title: any, users: any): Promise<any> {
    const current = {
      email: this.auth.currentUser.email,
      id: this.auth.currentUserId,
      nickname: this.auth.nickname,
    };

    const allUsers = [current, ...users];
    return this.db
      .collection('groups')
      .add({
        title,
        users: allUsers,
      })
      .then((res) => {
        const promises = [];

        for (const usr of allUsers) {
          const oneAdd = this.db.collection(`users/${usr.id}/groups`).add({
            id: res.id,
          });
          promises.push(oneAdd);
        }
        return Promise.all(promises);
      });
  }

  getGroups() {
    return this.db
      .collection(`users/${this.auth.currentUserId}/groups`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as {};
            const user_group_key = a.payload.doc.id;
            return this.getOneGroup(data['id'], user_group_key);
          })
        )
      );
  }

  getOneGroup(
    id: any,
    user_group_key = null
  ): Observable<{ id: any; user_group_key: any }> {
    return this.db
      .doc(`groups/${id}`)
      .snapshotChanges()
      .pipe(
        take(1),
        map((changes) => {
          const data = changes.payload.data() as {};
          const group_id = changes.payload.id;
          return { user_group_key, id: group_id, ...data };
        })
      );
  }

  getChatMessages(groupId: any) {
    return this.db
      .collection(`groups/${groupId}/messages`, (ref) =>
        ref.orderBy('createdAt')
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as {};
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  addChatMessage(msg: any, chatId: string, driving: boolean) {
    return this.db.collection('groups/' + chatId + '/messages').add({
      msg,
      from: this.auth.currentUserId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      driving
    });
  }

  addFileMessage(file: string, chatId: any) {
    const newName = `${new Date().getTime()}-${this.auth.currentUserId}.png`;
    const storageRef: AngularFireStorageReference = this.storage.ref(
      `/files/${chatId}/${newName}`
    );

    return {
      task: storageRef.putString(file, 'base64', { contentType: 'image/png' }),
      ref: storageRef,
    };
  }

  saveFileMessage(filepath: any, chatId: string) {
    return this.db.collection('groups/' + chatId + '/messages').add({
      file: filepath,
      from: this.auth.currentUserId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  leaveGroup(groupId: string, users: any): Observable<void> {
    return this.getGroups().pipe(
      switchMap((userGroups) => {
        return forkJoin(userGroups);
      }),
      map((data) => {
        let toDelete = null;

        for (const group of data) {
          if (group.id === groupId) {
            toDelete = group.user_group_key;
          }
        }
        return toDelete;
      }),
      switchMap((deleteId) => {
        return from(
          this.db
            .doc(`users/${this.auth.currentUserId}/groups/${deleteId}`)
            .delete()
        );
      }),
      switchMap(() => {
        return from(
          this.db.doc(`groups/${groupId}`).update({
            users,
          })
        );
      })
    );
  }
}
