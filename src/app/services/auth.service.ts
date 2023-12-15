import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _idToken: string;
  private _accessToken: string;
  private _expiresAt: number;
  private _fecha: number = Date.now();

  userProfile: any;

  constructor(public router: Router) {
    this._idToken = '';
    this._accessToken = '';
    this._expiresAt = 0;
  }

  auth0 = new auth0.WebAuth({
    clientID: 'iRrZ8SnxvkHbyJfOgSUgMec1dMaND9L3',
    domain: 'dev-li4wsnr6kr66uxm3.us.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'openid profile'

  });

  get accessToken(): string {
    return this._accessToken;
  }

  get idToken(): string {
    return this._idToken;
  }

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err: any, authResult: any) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.localLogin(authResult);
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
      }
    });
  }
  private localLogin(authResult: any): void {
    // Set the time that the access token will expire at
    // const expiresAt = (authResult.expiresIn * 1000) + Date.now();
    // this._accessToken = authResult.accessToken;
    // this._idToken = authResult.idToken;
    // this._expiresAt = expiresAt;

    //en memoria
    const expiresAt = JSON.stringify(
      (authResult.expiresIn * 1000) + new Date().getTime()
    );

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public renewTokens(): void {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.localLogin(authResult);
      } else if (err) {
        alert(`Could not get a new token (${err.error}: ${err.error_description}) .`);
        this.logout();
      }
    });
  }
  public logout(): void {
    // Remove tokens and expiry time
    // this._accessToken = '';
    // this._idToken = '';
    // this._expiresAt = 0;
    // Go back to the home route
    //this.router.navigate(['/']);

    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Remove server SSO session
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time  
    //return this._accessToken && this._fecha < this._expiresAt ? true : false;

    const expireAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
    return new Date().getTime() < expireAt;
  }

  public getProfile(cb: any): void {
    this._accessToken = localStorage.getItem('access_token') ?? '';
    if (!this._accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
    const self = this;
    this.auth0.client.userInfo(this._accessToken, (err, profile) => {
      if (profile) {
        self.userProfile = profile;
      }
      cb(err, profile);
    });
  }
}
