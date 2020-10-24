import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login(): void {
    this.auth.signIn(this.loginForm.value).then(
      (res) => {
        this.router.navigateByUrl('/chats');
      },
      async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message,
          buttons: ['OK'],
        });
        alert.present();
      }
    );
  }

  async openReset(): Promise<void> {
    const inputAlert = await this.alertCtrl.create({
      header: 'Reset Password',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Reset',
          handler: (data) => {
            this.resetPw(data.email);
          },
        },
      ],
    });
    inputAlert.present();
  }

  resetPw(email: string): void {
    this.auth.resetPw(email).then(
      async (res) => {
        const toast = await this.toastCtrl.create({
          duration: 3000,
          message: 'Success! Check your Emails for more information.',
        });
        toast.present();
      },
      async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message,
          buttons: ['OK'],
        });
        alert.present();
      }
    );
  }
}
