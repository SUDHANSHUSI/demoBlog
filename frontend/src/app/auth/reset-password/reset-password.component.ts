import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  password: string = '';
  error: any = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr:ToastrService
  ) {}

  onSubmit(form: any) {
    if (!form.valid) {
      return;
    }

    this.isLoading = true;
    const token = this.route.snapshot.params['token'];

    this.authService.resetPassword(token, this.password).subscribe(
      (response: any) => {
        console.log(response);
        this.isLoading = false;
        this.toastr.success(
          'Password has been reset successfully! mail is sent with new credentials ',
          'Success',
          {
            positionClass: 'toast-top-right',
          }
        );
        this.router.navigate(['/login']); // Redirect to the login page after successful password reset
      },
      (error: any) => {
        console.log(error);
        this.error = error;
        this.isLoading = false;
        this.toastr.error(
          'An error occurred while resetting the password.',
          'Error',
          {
            positionClass: 'toast-top-right',
          }
        );
      }
    );
  }
}
