import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StartChatPage } from './start-chat.page';

describe('StartChatPage', () => {
  let component: StartChatPage;
  let fixture: ComponentFixture<StartChatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartChatPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StartChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
