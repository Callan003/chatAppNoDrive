import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartChatPage } from './start-chat.page';

const routes: Routes = [
  {
    path: '',
    component: StartChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StartChatPageRoutingModule {}
