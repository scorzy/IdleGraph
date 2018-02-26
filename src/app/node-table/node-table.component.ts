import {MyNode} from '../model/node';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-node-table',
  templateUrl: './node-table.component.html',
  styleUrls: ['./node-table.component.scss']
})
export class NodeTableComponent implements OnInit {

  @Input() nodes: Array<MyNode>

  constructor() { }

  ngOnInit() {
  }

}
