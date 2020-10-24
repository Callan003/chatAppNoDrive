import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private alertCtrl: AlertController, private toastCtrl: ToastController, private router: Router) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nickname: ['', Validators.required]
    });
  }

  register() {
    this.auth.isNicknameAvailable(this.registerForm.value.nickname).subscribe(res => {
      if (res.length > 0) {
        let alert = this.alertCtrl.create({
          header: 'Error',
          message: 'Nickname already taken',
          buttons: ['OK']
        });
        alert.then(alert => alert.present());
      } else {
        console.log('aaaaa');
        this.auth.signUp(this.registerForm.value).then(async (res) => {
          let toast = await this.toastCtrl.create({
            duration: 3000,
            message: 'Successfully created new Account!'
          });
          toast.present();
          this.router.navigateByUrl('/chats');
        }, async (err) => {
          let alert = await this.alertCtrl.create({
            header: 'Error',
            message: err.message,
            buttons: ['OK']
          });
          alert.present();
        })
      }
    })
  }
}