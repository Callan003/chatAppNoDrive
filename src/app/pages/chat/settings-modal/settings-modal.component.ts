import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss'],
})
export class SettingsModalComponent {
  @Input() alerts: boolean;
  @Input() driving: boolean;
  @Input() quality: number;

  constructor(private modalController: ModalController) { }

  close() {
    this.modalController.dismiss();
  }
  confirmAction() {
    this.modalController.dismiss({
      alerts: this.alerts,
      driving: this.driving,
      quality: this.quality
    });
  }

  changeQuality($event: Event) {
    console.log($event);
    if (!!$event['detail'].value) {
      this.quality = $event['detail'].value;
    }
  }

  changeDriving($event: any) {
    this.driving = $event['detail'].checked;
  }
  changeAlerts($event: any) {
    this.alerts = $event['detail'].checked;
  }
}
