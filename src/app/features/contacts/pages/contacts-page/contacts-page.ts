import { Component, signal } from '@angular/core';
import { ContactList } from '../../components/contact-list/contact-list';
import { ContactDetail } from '../../components/contact-detail/contact-detail';
import { ContactFormDialog } from '../../components/contact-form-dialog/contact-form-dialog';

@Component({
  selector: 'app-contacts-page',
  imports: [ContactList,ContactDetail,ContactFormDialog],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
})

export class ContactsPage {

  y = signal(false);
  showDetailOnMobile = signal(false);

  disappearSwitch(x: boolean) {
    this.y.set(x);

    if (x) {
      setTimeout(() => {
        this.y.set(false);
      }, 3000);
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('contact-selected', () => {
        if (window.innerWidth <= 600) {
          this.showDetailOnMobile.set(true);
        }
      });
    }
  }

  closeDetail() {
    this.showDetailOnMobile.set(false);
  }
}
