import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks'
import { ServService } from './../serv.service'
import { Component, OnInit, HostBinding, AfterViewInit } from '@angular/core'
import * as vis from 'vis'
import { Skill } from '../model/skill';

@Component({
  selector: 'app-skill-tre',
  templateUrl: './skill-tre.component.html',
  styleUrls: ['./skill-tre.component.scss']
})
export class SkillTreComponent implements OnInit, OnDestroy {

  container: any
  network: vis.Network
  skill: any
  openModal = false
  exp = ""

  constructor(public serv: ServService) { }

  ngOnInit() {
    this.container = document.getElementById('mynetwork')

    const data = {
      nodes: this.serv.model.skills,
      edges: this.serv.model.skillEdges
    }
    const options: any = {
      autoResize: true,
      physics: {
        "barnesHut": {
          "gravitationalConstant": -3000
        },
        "minVelocity": 0.75
      },
      height: '100%',
      width: '100%',
      layout: {
        improvedLayout: false
      }
    }

    this.network = new vis.Network(this.container, data, options)

    const skills = this.serv.model.skills
    this.network.on(
      'click', (params => {
        if (params.nodes.length === 0)
          return false
        const nodeId = params.nodes[0]
        this.skill = skills.get(nodeId)

        if (this.skill.avaiable && !this.skill.owned && this.serv.model.prestigeCurrency >= 1)
          this.openModal = true
      }
      ).bind(this))
  }
  ngOnDestroy(): void {
    this.network.storePositions()
  }
  export() {
    this.network.storePositions()
    this.exp = JSON.stringify(this.network.getPositions())
  }
}
