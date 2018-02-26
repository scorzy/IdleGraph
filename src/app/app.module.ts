import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ClarityModule } from "@clr/angular";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { NoodeViewComponent } from './noode-view/noode-view.component';
import { SaveComponent } from './save/save.component';
import { FormatPipe } from './format.pipe';
import { NodeLineComponent } from './node-line/node-line.component';
import { NodeTableComponent } from './node-table/node-table.component';
import { OverviewComponent } from './overview/overview.component';
import { MainComponent } from './main/main.component';
import { TopComponent } from './top/top.component';
import { FormsModule } from '@angular/forms';
import { PrestigeComponent } from './prestige/prestige.component';
import { SkillTreComponent } from './skill-tre/skill-tre.component';
import { PrestigeNavComponent } from './prestige-nav/prestige-nav.component';
import { SkillStatsComponent } from './skill-stats/skill-stats.component';

const appRoutes: Routes = [
  { path: '', redirectTo: "main", pathMatch: "full" },
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: 'node',
        component: NoodeViewComponent,
      }, {
        path: 'node/:id', component: NoodeViewComponent
      }, {
        path: 'ove', component: OverviewComponent
      }
    ]
  },
  {
    path: 'pnav', component: PrestigeNavComponent,
    children: [
      {
        path: '',
        redirectTo: 'skill',
        pathMatch: 'full'
      },
      { path: 'skill', component: SkillTreComponent },
      { path: 'skillStats', component: SkillStatsComponent }
    ]
  },
  { path: 'pre', component: PrestigeComponent },
  { path: 'save', component: SaveComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    NoodeViewComponent,
    SaveComponent,
    FormatPipe,
    NodeLineComponent,
    NodeTableComponent,
    OverviewComponent,
    MainComponent,
    TopComponent,
    PrestigeComponent,
    SkillTreComponent,
    PrestigeNavComponent,
    SkillStatsComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true }),
    BrowserModule,
    ClarityModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
