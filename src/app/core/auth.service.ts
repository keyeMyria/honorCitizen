import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthHttp } from 'angular2-jwt';
import url from '../url';

declare const FB: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: AuthHttp
  ) {
    FB.init({
      appId: 233355730725067,
      status: false,
      cookie: false,
      xfbml: false,
      version: 'v3.0'
    })
  }

  emailSignup() {
    return this.http.post(`${url}/users/auth/emailSignup`,
      {
        fullName: 'John Smith',
        email: 'email@email.com',
        password: 'password',
        photoURL: 'https://npengage.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png'
      })
  }

  emailLogin() {
    return this.http.post(`${url}/users/auth/login`, { email: 'email@email.com', password: 'password' })
  }

  fbLogin() {
    return new Promise((resolve, reject) => {
      FB.login(result => {
        if (result.authResponse) {
          let token = result.authResponse.accessToken;
          return this.http.post(`${url}/users/auth/facebook`, { access_token: token })
            .toPromise()
            .then(response => {
              let token = response.headers.get('x-auth-token');
              if (token) {
                localStorage.setItem('id_token', token);
              }
              resolve(response.json());
            })
            .catch(() => reject());
        } else {
          reject();
        }
      }, { scope: 'public_profile,email' })
    });
  }

  logout() {
    if (localStorage.id_token) {
      localStorage.removeItem('id_token');
      localStorage.removeItem('user');
      console.log('logged out');
    } else {
      console.log('not logged in')
    }
  }

  isLoggedIn() {
    return new Promise((resolve, reject) => {
      this.getCurrentUser().then(user => resolve(true)).catch(() => reject(false));
    });
  }

  getCurrentUser() {
    return new Promise((resolve, reject) => {
      return this.http.get(`${url}/users/auth/me`).toPromise().then(response => {
        resolve(response.json());
      }).catch(() => reject());
    });
  }

}
