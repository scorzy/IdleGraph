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
import { OptNavComponent } from './opt-nav/opt-nav.component';
import { OptionsComponent } from './options/options.component';
import { ToastOptions, ToastModule } from 'ng2-toastr/ng2-toastr';
import { ServService } from './serv.service';
import { UpToTimePipe } from './up-to-time.pipe';

export class CustomOptions extends ToastOptions {
  animate = 'fade'
  dismiss = 'auto'
  showCloseButton = true
  newestOnTop = true
  enableHTML = true
  positionClass = 'toast-bottom-right'
}

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
  {
    path: 'opt', component: OptNavComponent, children: [
      { path: 'save', component: SaveComponent },
      { path: 'opt', component: OptionsComponent }
    ]
  }
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
    SkillStatsComponent,
    OptNavComponent,
    OptionsComponent,
    UpToTimePipe
  ],
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true }),
    BrowserModule,
    ClarityModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastModule.forRoot()
  ],
  providers: [{ provide: ToastOptions, useClass: CustomOptions }, ServService],
  bootstrap: [AppComponent]
})
export class AppModule { }
