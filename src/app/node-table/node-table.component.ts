import { MyNode } from '../model/node'
import { Component, OnInit, Input } from '@angular/core'
import { ClrDatagridComparatorInterface } from "@clr/angular"
import * as Decimal from 'break_infinity.js'
import { ServService } from '../serv.service';

class QuantityComparator implements ClrDatagridComparatorInterface<MyNode> {
  compare(a: MyNode, b: MyNode) { return a.quantity.cmp(b.quantity) }
}
class ProdComparator implements ClrDatagridComparatorInterface<MyNode> {
  compare(a: MyNode, b: MyNode) { return a.prodPerSec.cmp(b.prodPerSec) }
}

@Component({
  selector: 'app-node-table',
  templateUrl: './node-table.component.html',
  styleUrls: ['./node-table.component.scss']
})
export class NodeTableComponent implements OnInit {

  @Input() nodes: Array<MyNode>
  quantityComparator = new QuantityComparator()
  prodComparator = new ProdComparator()

  constructor(public ser: ServService) { }

  ngOnInit() {
  }

}
