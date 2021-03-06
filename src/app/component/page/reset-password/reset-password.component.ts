import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../../../service/auth/authentication.service';
import { LoadingService } from '../../../service/loading/loading.service';

@Component( {
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: [ './reset-password.component.scss' ]
} )
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submitted = false;
  error = '';
  token = '';
  username = '';
  success = false;
  loading: boolean = false;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      public router: Router,
      private authenticationService: AuthenticationService,
      private loadingService: LoadingService
  ) {
    // redirect to home if already logged in
    if ( this.authenticationService.currentUserValue ) {
      this.router.navigate( [ '/dashboard' ] );
    }

    this.loadingService.sharedLoading.subscribe( loading => this.loading = loading );
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.resetPasswordForm.controls;
  }

  ngOnInit() {
    this.route.queryParams.subscribe( params => {
      this.token = params.token;
      this.username = params.username;
    } );

    this.resetPasswordForm = this.formBuilder.group( {
      password: [ '', Validators.compose( [ Validators.required, Validators.minLength( 6 ) ] ) ],
      confirmPassword: [ '', Validators.required ]
    }, {
      validator: this.MustMatch( 'password', 'confirmPassword' )
    } );
  }

  onSubmit() {
    if ( this.loading ) {
      return;
    }

    this.submitted = true;

    if ( this.resetPasswordForm.invalid ) {
      return;
    }

    this.loadingService.setLoading( true );
    this.authenticationService.resetPassword( this.username, this.token, this.f.password.value )
    .pipe( first() )
    .subscribe(
        () => {
          this.success = true;
          this.loadingService.setLoading( false );
        },
        errorResponse => {
          if ( typeof errorResponse.error === 'string' ) {
            this.error = errorResponse.error;
          } else if ( errorResponse.statusText ) {
            this.error = errorResponse.statusText;
          }
          this.success = false;
          this.loadingService.setLoading( false );
        } );
  }

  private MustMatch( controlName: string, matchingControlName: string ) {
    return ( formGroup: FormGroup ) => {
      const control = formGroup.controls[ controlName ];
      const matchingControl = formGroup.controls[ matchingControlName ];

      if ( matchingControl.errors && !matchingControl.errors.mustMatch ) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if ( control.value !== matchingControl.value ) {
        matchingControl.setErrors( { mustMatch: true } );
      } else {
        matchingControl.setErrors( null );
      }
    };
  }
}
