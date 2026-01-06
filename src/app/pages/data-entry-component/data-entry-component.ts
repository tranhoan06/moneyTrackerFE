import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { EnterRevenue } from './enter-revenue/enter-revenue';
import { EnterExpenses } from './enter-expenses/enter-expenses';
@Component({
  selector: 'app-data-entry-component',
  standalone: true,
  imports: [TabsModule, CommonModule, EnterRevenue, EnterExpenses],
  templateUrl: './data-entry-component.html',
  styleUrl: './data-entry-component.scss'
})
export class DataEntryComponent {
  tabs: { title: string; value: number }[] = [];;

  constructor() {
    this.tabs = [
      { title: 'Tiền chi', value: 0, },
      { title: 'Tiền thu', value: 1, },
    ];
  }
}
