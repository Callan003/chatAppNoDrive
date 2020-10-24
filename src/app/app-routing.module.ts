import { AuthGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule' },
  { 
    path: 'chats', 
    loadChildren: './pages/chats/chats.module#ChatsPageModule',
    canActivate: [AuthGuard]
  },
  { path: 'chats/start', loadChildren: './pages/start-chat/start-chat.module#StartChatPageModule', canActivate: [AuthGuard] },
  { path: 'chat/:id', loadChildren: './pages/chat/chat.module#ChatPageModule', canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: './pages/profile/profile.module#ProfilePageModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }