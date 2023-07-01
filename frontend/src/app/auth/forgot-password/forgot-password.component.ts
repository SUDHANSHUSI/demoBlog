import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  error: any = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  onSubmit(form: any) {
    if (!form.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe(
      (response: any) => {
        console.log(response);
        this.isLoading = false;
        this.toastr.success(
          'Email for reset password sent successfully!',
          'Success',
          {
            positionClass: 'toast-top-right',
          }
        );
      },
      (error: any) => {
        console.log(error);
        this.error = error;
        this.isLoading = false;
        this.toastr.error(
          'An error occurred while sending the reset password email.',
          'Error',
          {
            positionClass: 'toast-top-right',
          }
        );
      }
    );
  }
}
