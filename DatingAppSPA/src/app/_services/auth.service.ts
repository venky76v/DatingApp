import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class AuthService {
  baseUrl = 'http://localhost:5000/api/auth/';
  userToken: any;
  decodedToken: any;
  jwtHelper = new JwtHelperService();
  ipAddress: any;


  constructor(private http: Http, private httpClient: HttpClient) { }

  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model, this.requestOptions()).pipe(map((response: Response) => {
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
    // return !!tokenFromLocalStorage;
    if (tokenFromLocalStorage === null) {
      return true;
    } else {
      return this.jwtHelper.isTokenExpired(tokenFromLocalStorage);
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

  getClientIPAddres() {
    this.httpClient.get('https://jsonip.com')
    .subscribe(data => {
      this.ipAddress = data.ip;
    });
  }
}
