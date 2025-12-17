import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { OptionListModel } from '../model/commonModel.model';
import { Store } from '@ngrx/store';
import * as AppActions from '../../core/store/app.action';
import * as AppSelectors from '../../core/store/app.selectors';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { OptionListService } from '../service/option-list-service';
@Component({
  selector: 'app-data-entry-component',
  standalone: true,
  imports: [DatePickerModule, TextareaModule, ReactiveFormsModule],
  templateUrl: './data-entry-component.html',
  styleUrl: './data-entry-component.scss'
})
export class DataEntryComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  dataForm!: FormGroup;

  optionList!: OptionListModel[];

  constructor(
    private fb: FormBuilder,
    private optionListService: OptionListService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.store) {
      this.store.select(AppSelectors.selectUserInfo)
        .pipe(
          filter(userInfo => userInfo !== null && userInfo !== undefined), // ✅ Chỉ lấy khi có data
          take(1)
        )
        .subscribe(userInfo => {
          console.log('User Info after dispatch:', userInfo);
          if (userInfo?.id) {
            this.getOptionList(userInfo.id);
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.dataForm = this.fb.group({
      date: ['', [Validators.required]],
      note: ['', [Validators.maxLength(255)]],
      amount: ['', [Validators.required]],
    }, {
    });
  }

  getOptionList(userId: string) {
    this.optionListService.getOptionList(userId).subscribe({
      next: (response: any) => {
        this.optionList = response.data;
        this.store.dispatch(AppActions.setOptionList({ optionList: this.optionList }));
      },
      error: (error: any) => {
        console.error('Error fetching option list:', error);
      }
    });
  }
}
