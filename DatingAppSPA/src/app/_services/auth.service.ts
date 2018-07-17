import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()

export class AuthService {
  baseUrl = 'http://localhost:5000/api/auth/';
  userToken: any;

constructor(private http: Http) { }

  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model, this.requestOptions()).pipe(map((response: Response) => {
      const user = response.json();
      if (user) {
        localStorage.setItem('token', user.tokenString);
        this.userToken = user.tokenString;
      }
    }), catchError(this.handleError));
  }

  register(model: any) {
    return this.http.post(this.baseUrl + 'register', model, this.requestOptions()).pipe(map(res => res), catchError(this.handleError));
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
}
