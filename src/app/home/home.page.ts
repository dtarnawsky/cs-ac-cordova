import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-enterprise/identity-vault';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { VaultService } from '../vault.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public authenticationChange$: Observable<boolean>;

  constructor(private authenticationService: AuthenticationService, private vaultService: VaultService) {
    this.authenticationChange$ = authenticationService.authenticationChange$;
  }

  async ngOnInit() {

  }

  async login(): Promise<void> {
    // This line is required if iosWebView is shared and we are using Identity Vault. It prevents the privacy screen from displaying
    // Device.setHideScreenOnBackground(false);
    await this.authenticationService.login();
  }

  async logout(): Promise<void> {
    this.authenticationService.logout();
  }

}
