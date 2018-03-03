import { Component, ViewContainerRef } from '@angular/core';
import { ServService } from './serv.service';
import { ToastsManager } from 'ng2-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public serv: ServService,
    public toastr: ToastsManager,
    vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr)
  }

  getClass() {
    return "header-" + this.serv.options.header
  }
}
