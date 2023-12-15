import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {
 

  const auth = inject(AuthService);

  if (auth.isAuthenticated()){
    return true;
  } 
    
  return false;
   
};
