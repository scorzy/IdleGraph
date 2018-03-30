import { Component, ViewContainerRef, OnInit, OnDestroy } from '@angular/core'
import { ServService } from './serv.service'
import { ToastsManager } from 'ng2-toastr'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  hh = 0
  mm = 0
  ss = 0
  no_hh = false
  no_mm = false
  no_ss = false
  max_hh = 0
  max_mm = 0
  max_ss = 0
  canWarp = false
  warpModal = false
  updateSub: any

  constructor(
    public serv: ServService,
    public toastr: ToastsManager,
    vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr)
  }

  ngOnInit() {
    this.updateSub = this.serv.updateEmitter.subscribe(a => {
      if (this.warpModal)
        this.checkTime()
    })
  }
  ngOnDestroy() {
    this.updateSub.unsubscribe()
  }


  getClass() {
    return "header-" + this.serv.options.header
  }
  checkTime() {
    const maxTime = this.serv.model.time.toNumber()
    if (maxTime > 0) {
      this.max_hh = Math.min(this.max_ss, maxTime / 3600)
      this.max_mm = Math.min(this.max_ss, maxTime / 60, 60)
      this.max_ss = Math.min(this.max_ss, maxTime, 60)

      this.no_hh = this.hh > this.max_hh || this.hh < 0
      this.no_mm = this.mm > this.max_mm || this.mm < 0
      this.no_ss = this.ss > this.max_ss || this.ss < 0

      this.canWarp = !(this.no_hh || this.no_mm || this.no_ss) ||
        maxTime > (this.ss + this.mm * 60 + this.hh * 3600)
    } else {
      this.max_hh = this.max_mm = this.max_ss = 0
      this.no_hh = this.no_mm = this.no_ss = true
      this.canWarp = false
    }
  }
  warp() {
    if (!this.canWarp)
      return false

    const warpTime = Math.min(this.ss + this.mm * 60 + this.hh * 3600, this.serv.model.time.toNumber())
    this.serv.model.warp(new Decimal(warpTime))
    this.warpModal = false
  }
}





