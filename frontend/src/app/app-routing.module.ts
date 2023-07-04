import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component';
import { CreatePostComponent } from './posts/create-post/create-post.component';
import { PostDetailComponent } from './posts/post-detail/post-detail.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { MypostsComponent } from './posts/myposts/myposts.component';
import { CreateProfileComponent } from './profile/create-profile/create-profile.component';
import { ViewProfileComponent } from './profile/view-profile/view-profile.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'myposts', component: MypostsComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  {
    path: 'myposts/:postId',
    component: PostDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'myposts/edit/:postId',
    component: CreatePostComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: CreateProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'public/:profileId', component: ViewProfileComponent },
  { path: 'myposts/public/:profileId', component: ViewProfileComponent },
  {
    path: 'profile/:profileId',
    component: ViewProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/edit/:profileId',
    component: CreateProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'public/:profileId/posts/:postId', component: PostDetailComponent },
  { path: ':postId', component: PostDetailComponent },
  { path: 'category/:categoryId/posts/:postId', component: PostDetailComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
