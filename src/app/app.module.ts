import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextListComponent } from './components/text-list/text-list.component';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataGridComponent } from './components/data-grid/data-grid.component';
import {MatPaginatorModule, MatSortModule, MatTableModule} from '@angular/material';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ClarityModule } from '@clr/angular';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TextListComponent,
    DataGridComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    DragDropModule,
    ClarityModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
