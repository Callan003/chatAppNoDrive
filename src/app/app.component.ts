import { Component } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FcmService } from './services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private afAuth: AngularFireAuth,
    private router: Router,
    private fcm: FcmService,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.notificationSetup();
        this.router.navigateByUrl('/chats');
      }
    });
  }

  notificationSetup() {
    this.fcm.getToken();
    this.fcm.onNotifications().subscribe((msg) => {
      if (msg.tap >= 1) {
        this.router.navigateByUrl(`/chat/${msg.chat}`);
      } else {
        if (this.platform.is('ios')) {
          this.presentAlert(msg.aps.alert, msg.chat);
        } else {
          this.presentAlert(msg, msg.chat);
        }
      }
    });
  }

  private async presentAlert(info, chat) {
    const toast = await this.alertController.create({
      header: info.title,
      message: 'Would you like to chat now?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            this.router.navigateByUrl(`/chats/${chat}`);
          },
        },
      ],
    });
    toast.present();
  }
}
