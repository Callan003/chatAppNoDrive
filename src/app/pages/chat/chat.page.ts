import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {IonContent, ModalController, ToastController} from '@ionic/angular';
import { map, tap } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SettingsModalComponent } from './settings-modal/settings-modal.component';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';


import 'src/typingdna.js';
declare var TypingDNA: any;


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  messages: Observable<any[]>;
  newMsg = '';
  chatTitle = '';
  currentUserId = this.auth.currentUserId;
  chat = null;
  currentDate: moment.Moment;
  breakPoints = [];
  typingDnaRecorder = null;
  driving = false;
  alerts = false;
  quality = 2;

  @ViewChild(IonContent) content: IonContent;
  @ViewChild('input', { read: ElementRef }) msgInput: ElementRef;

  movingSpeed: number;
  watchGeolocation: any;
  overTheSpeedLimit = false;
  speedLimit = 20;
  optionObject: any;
  geoSubscription: Subscription;
  sendingMessage = false;
  backendUrl = 'http://server.oriontechnologies.ro:2999/typing-dna';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private chatService: ChatService,
    private router: Router,
    private camera: Camera,
    private geolocation: Geolocation,
    public toastController: ToastController,
    private http: HttpClient,
    public modalController: ModalController) {
      this.typingDnaRecorder = new TypingDNA();
    }

  ngOnInit(): void {
    this.startGeolocation();
    this.route.params.subscribe(data => {
      this.chatService.getOneGroup(data.id).subscribe(res => {
        this.chat = res;
        this.messages = this.chatService.getChatMessages(this.chat.id).pipe(
          map(messages => {
            this.shouldDisplayBreak(messages);
            for (const msg of messages) {
              msg['user'] = this.getMsgFromName(msg['from']);
            }
            return messages;
          }),
          tap(() => {
            setTimeout(() => {
              this.content.scrollToBottom(300);
            }, 500);
          })
        );
      });
    });
    this.currentDate = moment();
  }

  sendMessage(): void {
    this.optionObject = {
      type: 2,
      text: this.newMsg,
    };
    const typingPattern = this.typingDnaRecorder.getTypingPattern(this.optionObject);
    if (this.overTheSpeedLimit) {
      if (!!typingPattern){
      this.sendingMessage = true;
      this.verifyTypingPattern(typingPattern).subscribe((result: any) => {
        if (this.alerts){
          this.toastMessage(result);
        }
        this.sendMessageToFirebase(result.result === 0);
      }, error => {
        if (this.alerts) {
          this.toastMessage(error);
        }
        this.sendMessageToFirebase(false);
      });
      }
    } else {
      if (!!typingPattern){
        this.saveTypingPattern(typingPattern).subscribe(result => {
          if (this.alerts){
            this.toastMessage(result);
          }
        }, error => {
          if (this.alerts) {
            this.toastMessage(error);
          }
        });
      }
      this.sendMessageToFirebase(false);
    }
    this.typingDnaRecorder.reset();
    this.typingDnaRecorder.start();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SettingsModalComponent,
      cssClass: 'settings-modal',
      componentProps: {
        driving: this.driving,
        alerts: this.alerts,
        quality: this.quality
      }
    });

    modal.onDidDismiss().then(response => {
      if (response) {
        this.driving = response.data.driving;
        this.alerts = response.data.alerts;
        this.toggleDriving(this.driving);
        this.quality = response.data.quality;
      }
    });

    return await modal.present();
  }

  toggleDriving(driving) {
    if (driving){
      if (!!this.geoSubscription) {
        this.geoSubscription.unsubscribe();
        this.geoSubscription = null;
      }
      this.overTheSpeedLimit = true;
    } else {
      this.startGeolocation();
      this.overTheSpeedLimit = false;
    }
  }

  async toggleInfo(message, user: 'currentUser' | 'otherUser') {
    const toast = await this.toastController.create({
      message: user === 'otherUser' ? '<ion-icon name=\'car-sport-sharp\'></ion-icon> ' + message.user + ' was probably driving when sending this message <ion-icon name=\'car-sport-sharp\'></ion-icon><br><ion-icon name="warning"></ion-icon> Please do not encourage ' + message.user + ' to text and drive! <ion-icon name="warning"></ion-icon>' :
      '<ion-icon name=\'car-sport-sharp\'></ion-icon> You were probably driving when sending this message <ion-icon name=\'car-sport-sharp\'></ion-icon><br><ion-icon name="warning"></ion-icon> Please do not text and drive! <ion-icon name="warning"></ion-icon>',
      color: 'danger',
      position: 'middle',
      duration: 5000,
      cssClass: 'drivingInfoToast',
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel',
        }
      ]
    });
    toast.present();
  }

  async toastMessage(message) {
    alert(JSON.stringify(message));
  }

  verifyTypingPattern(typingPattern) {
    return this.http.post(this.backendUrl + '/verifyTypingPattern',
     {userId: this.currentUserId, tp: typingPattern, quality: this.quality, });
  }

  saveTypingPattern(typingPattern){
    return this.http.post(this.backendUrl + '/saveTypingPattern',
    {userId: this.currentUserId, tp: typingPattern});
  }

  sendMessageToFirebase(driving: boolean) {
    this.chatService.addChatMessage(this.newMsg, this.chat.id, driving).then(async () => {
      this.newMsg = '';
      this.content.scrollToBottom();
      if (!driving) {
        this.msgInput.nativeElement.focus();
      }
      if (driving) {
        const toast = await this.toastController.create({
          message: 'Please do not text and drive!',
          color: 'danger',
          position: 'middle',
          duration: 5000
        });
        toast.present();
      }
    });
    this.sendingMessage = false;
  }

  isUserDriving(message,  user: 'currentUser' | 'otherUser') {
    const time = moment(message.createdAt?.toMillis());
    if (user === 'currentUser') {
      return (message.from === this.currentUserId) &&
      message.driving && !this.isT1Plus1hBeforeT2(time, this.currentDate);
    } else {
      return (message.from !== this.currentUserId) &&
      message.driving && !this.isT1Plus1hBeforeT2(time, this.currentDate);
    }

  }

  isT1Plus1hBeforeT2(t1, t2) {
    t1 = t1.add(1, 'hours');
    return t1.isSameOrBefore(t2);
  }

  shouldDisplayBreak(messages) {
    messages.forEach((msg, i) => {
      const time = moment(msg.createdAt?.toMillis());
      if (this.isT1Plus1hBeforeT2(time, this.currentDate)){
        if (this.isT1Plus1hBeforeT2( time, messages[i + 1]?.createdAt?.toMillis())) {
        const indexOfBreakpoint = this.breakPoints.findIndex(element => {
          return element === i + 1;
        });

        if (indexOfBreakpoint !== -1) {
          this.breakPoints.splice(indexOfBreakpoint, 1, i + 1);
        } else {
          this.breakPoints.push(i + 1);
        }
      }
    }
    });
  }

  displayBreakPoint(i) {
    return (this.breakPoints.length > 0 && this.breakPoints.includes(i)) || i === 0;
  }

  getMsgFromName(userId: string): string {
    for (const usr of this.chat.users) {
      if (usr.id === userId) {
        return usr.nickname;
      }
    }
    return 'Deleted';
  }

  sendFile() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(data => {
      const obj = this.chatService.addFileMessage(data, this.chat.id);
      const task = obj.task;

      task.then( res => {
        obj.ref.getDownloadURL().subscribe( url => {
          this.chatService.saveFileMessage(url, this.chat.id);
        });
      });

      task.percentageChanges().subscribe(change => {
      });
    });
  }

  resize(): void {
    this.msgInput.nativeElement.style.height = 'auto';
    this.msgInput.nativeElement.style.height = this.msgInput.nativeElement.scrollHeight + 'px';
  }

  leave(): void {
    const newUsers = this.chat.users.filter(usr => usr.id !== this.auth.currentUserId);

    this.chatService.leaveGroup(this.chat.id, newUsers).subscribe(res => {
      this.router.navigateByUrl('/chats');
    });
  }

  startGeolocation() {
    this.watchGeolocation = this.geolocation.watchPosition({enableHighAccuracy: true});
    this.geoSubscription = this.watchGeolocation.subscribe((data) => {
        this.movingSpeed = data?.coords.speed;
        this.overTheSpeedLimit = (this.movingSpeed * 3.6) > this.speedLimit;
    });
  }
}
