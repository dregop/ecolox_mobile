import { NgModule } from '@angular/core';
import { LegalMentionsComponent } from './pages/legal-mentions/legal-mentions.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ShoppingComponent } from './pages/shopping/shopping.component';
import { InternetComponent } from './pages/internet/internet.component';
import { TravelComponent } from './pages/travel/travel.component';
import { RouterModule, Routes } from '@angular/router';
import { GlobalComponent } from './pages/global/global.component';

const routes: Routes = [
  { path: '', redirectTo: '/global', pathMatch: 'full' },
  { path: 'internet', component: InternetComponent},
  { path: 'achats', component: ShoppingComponent},
  { path: 'deplacement', component: TravelComponent},
  { path: 'global', component: GlobalComponent},
  { path: 'mentions-legales', component: LegalMentionsComponent},
  { path: 'mot-de-passe-oublie/:token', component: ResetPasswordComponent},
  { path: '**', redirectTo: '/global'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
