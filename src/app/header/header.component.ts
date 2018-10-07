import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService) { }

  private authListener: Subscription;
  authUserEmail = null;
  isAuthenticated = false;
  ngOnInit() {
    this.isAuthenticated = this.authService.getIsAuth();
    this.authUserEmail = this.authService.getAuthUserEmail();
    this.authListener = this.authService.getAuthStatusListener()
    .subscribe(result => {
      if (result) {
        this.isAuthenticated = true;
        this.authUserEmail = this.authService.getAuthUserEmail();
      } else {
        this.isAuthenticated = false;
        this.authUserEmail = null;
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.authUserEmail = null;
  }

  ngOnDestroy() {
    this.authListener.unsubscribe();
  }

}
