import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Platform } from '@ionic/angular';

// https://medium.freecodecamp.org/how-to-get-push-notifications-working-with-ionic-4-and-firebase-ad87cc92394e
@Injectable({
  providedIn: 'root',
})
export class FcmService {
  constructor(
    private firebase: Firebase,
    private afs: AngularFirestore,
    private platform: Platform,
    private auth: AuthService
  ) {}

  async getToken() {
    let token;

    if (this.platform.is('android')) {
      token = await this.firebase.getToken();
    }

    if (this.platform.is('ios')) {
      token = await this.firebase.getToken();
      await this.firebase.grantPermission();
    }

    this.saveToken(token);
  }

  private saveToken(token) {
    if (!token) {
      return;
    }
    const devicesRef = this.afs.collection('devices');

    const data = {
      token,
      userId: this.auth.currentUserId,
    };

    return devicesRef.doc(this.auth.currentUserId).set(data);
  }

  onNotifications() {
    return this.firebase.onNotificationOpen();
  }
}
