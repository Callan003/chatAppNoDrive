import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  groups: Observable<any>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private chatService: ChatService,
    private alertController: AlertController) { }

  ngOnInit(): void {
    this.groups = this.chatService.getGroups();
  }

  openProfile() {

  }

  signOut() {
    this.auth.signOut().then(() => {
      this.router.navigateByUrl('/login');
    });
  }

  async confirmSignOut() {
    const alert = await this.alertController.create({
      header: 'Sign-out confirmation',
      message: 'Do you want to sign-out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Sign-out',
          handler: () => {
            this.signOut();
          }
        }
      ]
    });
    await alert.present();
  }
}
