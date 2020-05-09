import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../../service/auth/authentication.service';
import { first } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { LoadingService } from '../../../../service/loading/loading.service';
import { ThemeService } from '../../../../service/theme/theme.service';
import { ErrorService } from '../../../../service/error/error.service';

@Component({
  selector: 'app-facebook-callback',
  templateUrl: './facebook-callback.component.html',
  styleUrls: ['./facebook-callback.component.scss']
})
export class FacebookCallbackComponent implements OnInit {

  returnUrl: string;

  brand = {
    brandLogo: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private loadingService: LoadingService,
    private errorService: ErrorService,
    private themeService: ThemeService
  ) {
  }

  ngOnInit(): void {
    this.brand = this.themeService.brand;

    // get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');

    if (!code || !state) {
      this.errorService.setError('Please try again later');
      return;
    }

    this.authenticationService.socialLoginOAuthV2(environment.facebookTag, code, state)
      .pipe(first())
      .subscribe(
        () => {
          this.loadingService.setLoading(false);
          this.router.navigate([this.returnUrl]);
        },
        errorResponse => {
          if (typeof errorResponse.error === 'string') {
            this.errorService.setError(errorResponse.error);
          } else if (errorResponse.statusText) {
            this.errorService.setError(errorResponse.statusText);
          }
        });
  }
}
