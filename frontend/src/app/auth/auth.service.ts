import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { AuthData } from './user.model';

import {environment} from '../../environments/environment'
const BACKEND_URL = environment.apiUrl + "/user/"

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token!: string;
  private tokenTimer: any;
  private userId!: string;
  private authStatusListener = new Subject<boolean>();
  public err = new BehaviorSubject<any>(null);

  
  constructor(private http: HttpClient, private router: Router,
    private profileService: ProfileService) { }


  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  login(email: string, password: string): Observable<any> {
  const authData: AuthData = { email: email, password: password };
  return this.http.post<{ token: string; expiresIn: number; userId: string }>(
    BACKEND_URL + "login",
    authData
  ).pipe(
    tap(response => {
      this.err.next(null);
      
      const token = response.token;
      this.token = token;
      if (token) {
      
        const expiresInDuration = response.expiresIn;
        // console.log(expiresInDuration);
        // this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        // console.log(expirationDate);

        this.saveAuthData(token, expirationDate, this.userId)
        this.router.navigate(["/"]);
      }
    }),
    catchError(err => {
      this.err.next(err);
      return throwError(err);
    })
  );
}

signupUser(email: string, password: string): Observable<any> {
  const authData: AuthData = { email: email, password: password };
  return this.http.post(BACKEND_URL + "signup", authData).pipe(
    tap(response => {
      this.err.next(null);
      this.router.navigate(["/"]);
    }),
    catchError(err => {
      this.err.next(err);
      return throwError(err);
    })
  );
}


  logout() {
    this.token ='';
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }
  
forgotPassword(email: string) {
    const url = BACKEND_URL + 'forgotPassword';
    const body = { email };
    return this.http.post(url, body);
}

resetPassword(token: string, password: string) {
  const url = BACKEND_URL + 'resetPassword/' + token;
  const body = { password };
  return this.http.patch(url, body);
}


  autoAuthUser() {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();


    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId ?authInformation.userId : '';
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
    else {
    this.logout(); // Token has expired, so log out the user
  }
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if (!token || !expirationDate) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }



  private setAuthTimer(duration: number) {

    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
 
  private saveAuthData(token: string, expirationDate: Date, userId: string) {    
    // this.profileService.getProfile()
    localStorage.setItem("token", token);
    localStorage.setItem("expiration",expirationDate.toISOString());
    localStorage.setItem("userId", userId);
  }


  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");

    localStorage.removeItem("profile");
    localStorage.removeItem("uname");
  }

}




  // login(email: string, password: string) {
  //   const authData: AuthData = { email: email, password: password };
  //   this.http
  //     .post<{ token: string; expiresIn: number, userId: string }>(
  //       BACKEND_URL + "login",
  //       authData
  //     )
  //     .subscribe(response => {

  //       this.err.next(null)

  //       const token = response.token;
  //       this.token = token;
  //       if (token) {
  //         const expiresInDuration = response.expiresIn;
  //         this.setAuthTimer(expiresInDuration);
  //         this.isAuthenticated = true;
  //         this.userId = response.userId;
  //         this.authStatusListener.next(true);
  //         const now = new Date();
  //         const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

  //         this.saveAuthData(token, expirationDate, this.userId);
  //         this.router.navigate(["/"]);
  //       }
  //     },
  //       err => {
  //         this.err.next(err)
  //       });
  // }


  // signupUser(email: string, password: string) {
  //   const authData: AuthData = { email: email, password: password };
  //   this.http
  //     .post(BACKEND_URL + "signup", authData)
  //     .subscribe(response => {
  //       this.err.next(null)
  //       this.router.navigate(["/"]);

  //     },
  //       err => {
  //         this.err.next(err)
  //       });
  // }