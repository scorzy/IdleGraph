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
import { AutoBuyTabComponent } from './auto-buy-tab/auto-buy-tab.component';
import { AutoBuyerComponent } from './auto-buyer/auto-buyer.component';
import { AchivementComponent } from './achivement/achivement.component';
import { AchivementListComponent } from './achivement-list/achivement-list.component';
import { WorldComponent } from './world/world.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { PrestigeContainerComponent } from './prestige-container/prestige-container.component';
import { HelpComponent } from './help/help.component';
import { UtilityComponent } from './utility/utility.component';
import { PrestigeFooterComponent } from './prestige-footer/prestige-footer.component';
import { CreditsComponent } from './credits/credits.component';

export class CustomOptions extends ToastOptions {
  animate = 'fade'
  dismiss = 'auto'
  showCloseButton = true
  newestOnTop = true
  enableHTML = true
  positionClass = 'toast-bottom-right'
}

const appRoutes: Routes = [
  { path: '', redirectTo: "/main/node/1", pathMatch: "full" },
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: 'node',
        component: NoodeViewComponent,
      }, {
        path: 'node/:id', component: NoodeViewComponent
      }, {
        path: 'prest',
        component: UtilityComponent,
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
      { path: 'skillStats', component: SkillStatsComponent },
      { path: 'auto', component: AutoBuyTabComponent }
    ]
  },
  { path: 'pre', component: PrestigeContainerComponent},
  {
    path: 'opt', component: OptNavComponent, children: [
      { path: 'save', component: SaveComponent },
      { path: 'opt', component: OptionsComponent },
      { path: 'help', component: HelpComponent },
      { path: 'cre', component: CreditsComponent }
    ]
  }, {
    path: 'ack', component: AchivementListComponent
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
    UpToTimePipe,
    AutoBuyTabComponent,
    AutoBuyerComponent,
    AchivementComponent,
    AchivementListComponent,
    WorldComponent,
    PrestigeContainerComponent,
    HelpComponent,
    UtilityComponent,
    PrestigeFooterComponent,
    CreditsComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true }),
    BrowserModule,
    ClarityModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastModule.forRoot(),
    ColorPickerModule
  ],
  providers: [ServService, { provide: ToastOptions, useClass: CustomOptions }],
  bootstrap: [AppComponent]
})
export class AppModule { }
