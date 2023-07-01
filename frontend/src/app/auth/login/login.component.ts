import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  error: any = null;

  constructor(private authService: AuthService,
    private toastr:ToastrService) { }

  ngOnInit(): void {
    this.error = null
    this.authService.err.subscribe(err => {
      this.error = err
      this.isLoading = false
    })
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    this.isLoading = true;
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    // console.log(email,password);
    if (this.isLoginMode) {
      this.authService.login(email, password).subscribe(
        (response: any) => {
          // Handle success response
          this.isLoading = false;
          this.toastr.success('Logged in successfully!');
          form.reset();
        },
        (error: any) => {
          // Handle error response
          this.error = error;
          this.isLoading = false;
        }
      );
    } else {
      this.authService.signupUser(email, password).subscribe(
        (response: any) => {
          // Handle success response
          this.isLoading = false;
          this.toastr.success('Account created successfully!');
          form.reset();
        },
        (error: any) => {
          // Handle error response
          this.error = error;
          this.isLoading = false;
        }
      );
    }
  }
}




