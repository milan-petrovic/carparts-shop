import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService) { }

  private authSub: Subscription;
  private usersSub: Subscription;
  isAuthenticated = false;
  isLoading = false;
  authUserEmail: string;
  users = [];

  ngOnInit() {
    this.isLoading = true;
    this.authService.getUsers();
    this.usersSub = this.authService.getUsersUpdateListener()
    .subscribe(usersData => {
      this.isLoading = false;
      this.users = usersData;
    });
    this.isAuthenticated = this.authService.getIsAuth();
    this.authUserEmail = this.authService.getAuthUserEmail();
    this.authSub = this.authService.getAuthStatusListener()
    .subscribe(result => {
      if (result) {
        this.isAuthenticated = result;
        this.authUserEmail = this.authService.getAuthUserEmail();
      } else {
        this.isAuthenticated = false;
        this.authUserEmail = null;
      }
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.usersSub.unsubscribe();
  }

  onDelete(userId: string) {
    this.isLoading = true;
    this.authService.deleteUser(userId).subscribe( () => {
      this.authService.getUsers();
    });
  }
}
