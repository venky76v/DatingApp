import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})

export class NavComponent implements OnInit {
  model: any = {};
  privateIP;
  publicIP;

  constructor(public authService: AuthService, private alertify: AlertifyService, private http: HttpClient) {
    this.http.get('https://api.ipify.org?format=json').subscribe(data => {
      this.publicIP = data['ip'];
      console.log(this.publicIP);
   });
  }

  ngOnInit() {
  }

  login() {
    console.log('ip address in login method', this.publicIP);
    this.authService.login(this.model, this.publicIP).subscribe(data => {
      this.alertify.success('logged in successfully');
    }, error => {
      this.alertify.error(error);
    });
  }

  logout() {
    this.authService.userToken = null;
    localStorage.removeItem('token');
    this.alertify.message('logged out');
  }

  loggedIn() {
    return this.authService.loggedIn();
    // const tokenFromLocalStorage = localStorage.getItem('token');
    // return !!tokenFromLocalStorage;
  }
}
