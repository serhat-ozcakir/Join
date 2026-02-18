import { Component, } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  isSignupPage = false;

 constructor(private router: Router) {
  this.updateIsSignupPage()
  this.router.events.pipe(filter((e)=> e instanceof NavigationEnd)).subscribe(()=>
  this.updateIsSignupPage())
 }
 private updateIsSignupPage(){
  this.isSignupPage = this.router.url.startsWith('/signup')
 }
}
