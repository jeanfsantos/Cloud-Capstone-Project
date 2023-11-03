import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

const routes: Routes = [
  {
    path: 'channels/:id/edit',
    loadComponent: () =>
      import('./pages/channels/edit/edit.component').then(c => c.EditComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'channels',
    loadComponent: () =>
      import('./pages/channels/channels.component').then(
        c => c.ChannelsComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat/chat.component').then(c => c.ChatComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(c => c.HomeComponent),
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
