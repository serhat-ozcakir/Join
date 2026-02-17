import { Component } from '@angular/core';
import { ContactList } from '../../components/contact-list/contact-list';
import { ContactDetail } from '../../components/contact-detail/contact-detail';
import { ContactFormDialog } from '../../components/contact-form-dialog/contact-form-dialog';
import { Header } from '../../../../shared/components/header/header';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-contacts-page',
  standalone:true,
  imports: [ContactList,ContactDetail,ContactFormDialog, Header, Sidebar ],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
})
export class ContactsPage {

}
