import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserLogin } from '../models/userLogin';
import { environment } from '../../environments/environment';

@Injectable()

export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  userToken: any;
  decodedToken: any;
  jwtHelper = new JwtHelperService();


  constructor(private http: Http, private httpClient: HttpClient) { }

  login(model: any, ipAddress: string) {
    let userLoginModel = new UserLogin();
    userLoginModel.Username = model.username;
    userLoginModel.Password = model.password;
    userLoginModel.LastLoginIP = ipAddress;

    return this.http.post(this.baseUrl + 'login', userLoginModel, this.requestOptions()).pipe(map((response: Response) => {
      const user = response.json();
      if (user) {
        localStorage.setItem('token', user.tokenString);
        this.userToken = user.tokenString;
        this.decodedToken = this.jwtHelper.decodeToken(this.userToken);
      }
    }), catchError(this.handleError));
  }

  register(model: any) {
    return this.http.post(this.baseUrl + 'register', model, this.requestOptions()).pipe(map(res => res), catchError(this.handleError));
  }

  loggedIn() {
    const tokenFromLocalStorage = localStorage.getItem('token');
    if (tokenFromLocalStorage === null) {
      return false;
    } else {
      if (this.jwtHelper.isTokenExpired(tokenFromLocalStorage)) {
        return false;
      } else {
        return true;
      }
    }
  }

  private requestOptions() {
    const headers = new Headers({'Content-type': 'application/json'});
    return new RequestOptions({headers: headers});
  }

  private handleError(error: any) {
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
      return throwError(applicationError);
      // return Observable.throw(applicationError);
    }

    const serverError = error.json();
    let modelStateErrors = '';
    if (serverError) {
      for (const key in serverError) {
        if (serverError[key]) {
          modelStateErrors += serverError[key] + '\n';
        }
      }
    }

    return throwError(
      modelStateErrors || 'Server Error'
    );
  }

  private handleErrorObs(error: HttpErrorResponse): Observable<any> {
    console.error('observable error: ', error);
    return throwError(error);
  }
}
