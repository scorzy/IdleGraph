import { Component, ViewContainerRef } from '@angular/core';
import { ServService } from './serv.service';
import { ToastsManager } from 'ng2-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule }          from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  hh = 0
  mm = 0
  ss = 0
  no_hh = false
  no_mm = false
  no_ss = false
  max_hh = 0
  max_mm = 0
  max_ss = 0

  warpForm = new FormGroup({
    hh: new FormControl('', Validators.required),
    mm: new FormControl('', Validators.required),
    ss: new FormControl('', Validators.required)
  })

  constructor(
    public serv: ServService,
    public toastr: ToastsManager,
    vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr)
  }

  getClass() {
    return "header-" + this.serv.options.header
  }
  checkTime() {
    const maxTime = this.serv.model.time.toNumber()
    this.max_hh = maxTime / 3600
    this.max_mm = maxTime % 3600
    this.max_ss = maxTime % 60

    this.no_hh = this.hh > this.max_hh || this.hh < 0
    this.no_mm = this.mm > this.max_mm || this.mm < 0
    this.no_ss = this.ss > this.max_ss || this.ss < 0
  }
}





