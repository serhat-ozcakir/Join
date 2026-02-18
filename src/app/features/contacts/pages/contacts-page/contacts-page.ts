import { Component } from '@angular/core';
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
  y:true | false = true;

  disappearSwitch(x:boolean) {
    this.y = x;
  }
}
