import { Component, OnInit } from '@angular/core'
import { ServService } from '../serv.service'

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.scss']
})
export class SaveComponent implements OnInit {

  clearModal = false
  exp = ""

  constructor(public serv: ServService) { }

  ngOnInit() {
  }

  export() { this.exp = this.serv.getSave() }
  import() { this.serv.import(this.exp.trim()) }

}
