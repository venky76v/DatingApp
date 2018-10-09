import { AuthService } from './../_services/auth.service';
import { catchError } from 'rxjs/operators';
import { AlertifyService } from './../_services/alertify.service';
import { UserService } from './../_services/user.service';
import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { Observable, of } from 'rxjs';

@Injectable()
export class MemberEditResolver implements Resolve<User> {
  constructor(private userService: UserService, private authService: AuthService,
    private router: Router, private alertify: AlertifyService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<User> {
      return this.userService.getUser(this.authService.decodedToken.nameid).pipe(
        catchError(error => {
          this.alertify.error('Problem retrieving your data');
          this.router.navigate(['/members']);
          return of(null);
        })
      );
    }
}
