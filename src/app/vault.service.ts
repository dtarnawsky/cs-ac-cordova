import { Injectable } from '@angular/core';
import { BrowserVault, DeviceSecurityType, IdentityVaultConfig, Vault, VaultType } from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class VaultService {

  config: IdentityVaultConfig = {
    key: 'io.ionic.iv-test-cordova',
    type: VaultType.DeviceSecurity,
    deviceSecurityType: DeviceSecurityType.Both,
    lockAfterBackgrounded: 2,
    shouldClearVaultAfterTooManyFailedAttempts: false,
    customPasscodeInvalidUnlockAttempts: 10,
    unlockVaultOnLoad: true,
  };

  vault: Vault | BrowserVault;

  constructor(private platform: Platform) {

    this.init();
  }

  async init() {
    console.log('init');
    await this.platform.ready();
    console.log('init platform ready', this.platform.platforms());

    this.vault = this.platform.is('cordova') ? new Vault(this.config) : new BrowserVault(this.config);
    this.vault.onLock(() => {
      console.log('Vault was locked');
    });
    this.vault.onUnlock(() => {
      console.log('Vault was unlocked');
    });
    this.vault.onError((err) => {
      console.log('Vault error', err);
    });
  }

  async lock() {
    await this.vault.lock();
  }

  async unlock() {
    await this.vault.unlock();
  }

  async setData(key: string, value: string): Promise<void> {
    await this.vault.setValue(key, value);
  }
}
