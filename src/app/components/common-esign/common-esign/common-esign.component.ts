import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-common-esign',
    templateUrl: './common-esign.component.html',
    styleUrls: ['./common-esign.component.scss'],
    standalone: false
})
export class CommonEsignComponent implements OnInit {

  constructor() { }

  gateway: string | null;

  ngOnInit() {
    this.gateway = localStorage.getItem("gateway");
    
    if (this.gateway) {
      // If gateway value is found, proceed to form submission
      this.submitForm();
    } else {
      // Optional: Handle the case when gateway is not available
      console.error("Gateway value not found in localStorage");
    }
  }

  submitForm() {
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://authenticate.sandbox.emudhra.com'; // External URL

    // Create hidden input for gateway value (txnref)
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'txnref'; // Name expected by the server
    input.value = this.gateway; // Set the gateway value from localStorage

    // Append the hidden input to the form
    form.appendChild(input);

    // Append form to the body and submit it
    document.body.appendChild(form);
    form.submit();
  }
}