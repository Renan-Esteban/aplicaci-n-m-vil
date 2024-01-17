import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { ReactiveFormsModule } from '@angular/forms';

import { RegisterPage } from './register.page';
import { LoginComponent } from './componentes/login/login.component';

@NgModule({
  
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    
  ],
  declarations: [RegisterPage, LoginComponent],
  exports: [LoginComponent]
  
  
})
export class RegisterPageModule {}
