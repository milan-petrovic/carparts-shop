import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated = false;
  private token: string;
  private tokenTimer: any; // nisam mogao koristiti NodeJS.Timer
  private authStatusListener = new Subject<boolean>();
  private usersUpdatedListener = new Subject<any[]>();
  private authUserEmail: string;
  users = [];


  constructor(private http: HttpClient, private router: Router) {}


  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUsersUpdateListener() {
    return this.usersUpdatedListener.asObservable();
  }

  getAuthUserEmail() {
    return this.authUserEmail;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http.post('http://localhost:3000/api/user/signup', authData)
    .subscribe( response => {
      console.log(response);
    });
    this.router.navigate(['/login']);
  }

  getUsers() {
    this.http.get<{users: any}>('http://localhost:3000/api/user')
    .subscribe(usersData => {
      this.users = usersData.users;
      this.usersUpdatedListener.next([...this.users]);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http.post<{token: string, email: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData)
    .subscribe(loginData => {
      console.log(loginData);
      const token = loginData.token;
      this.token = token;
      if (token) {
        const expiresInDuration = loginData.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        const now = new Date();
        const expiresDate = new Date(now.getTime() + (expiresInDuration * 1000));
        console.log(expiresDate);
        const authUserEmail = loginData.email;
        this.authUserEmail = authUserEmail;
        this.saveAuthData(token, expiresDate, this.authUserEmail);

        this.authStatusListener.next(true);
      }
      this.router.navigate(['/product-list']);
    });
  }

  deleteUser(userId: string) {
    return this.http.delete('http://localhost:3000/api/user/' + userId);
  }

  logout() {
    this.token = null;
    this.authUserEmail = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['']);
  }

  autoAuth() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expiresDate.getTime() - now.getTime();
    console.log(expiresIn);
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.authUserEmail = authInformation.email;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

 private  setAuthTimer(duration: number) {
    console.log('Timer ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);

  }

  private saveAuthData(token: string, expiresDate: Date, email: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiresDate', expiresDate.toISOString());
    localStorage.setItem('email', email);
  }

  clearAuthData() {
    localStorage.clear();
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiresDate = localStorage.getItem('expiresDate');
    const email = localStorage.getItem('email');
    if (!token || !expiresDate) {
      return;
    }

    return {
      token: token,
      expiresDate: new Date(expiresDate),
      email: email,
    };
  }



}
