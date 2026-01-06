import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { Store } from '@ngrx/store';
import * as AppActions from '../../../core/store/app.action';
import * as AppSelectors from '../../../core/store/app.selectors';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { OptionListService } from '../../service/option-list-service';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { OptionListModel } from '@/pages/model/commonModel.model';

@Component({
  selector: 'app-enter-revenue',
  standalone: true,
  imports: [DatePickerModule, TextareaModule, ReactiveFormsModule, InputNumberModule, ButtonModule, CommonModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './enter-revenue.html',
  styleUrl: './enter-revenue.scss'
})
export class EnterRevenue implements OnInit, OnDestroy {
  @Input() type!: string;
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  dataForm!: FormGroup;

  optionList!: OptionListModel[];
  selectedOption: any = null;
  constructor(
    private fb: FormBuilder,
    private optionListService: OptionListService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.store) {
      this.store.select(AppSelectors.selectUserInfo)
        .pipe(
          filter(userInfo => userInfo !== null && userInfo !== undefined),
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
      amount: [0, [Validators.required]],
    }, {
    });
  }

  getOptionList(userId: string) {
    this.optionListService.getOptionList(userId, this.type).subscribe({
      next: (response: any) => {
        this.optionList = response.data;
        this.selectedOption = this.optionList[0];
        this.store.dispatch(AppActions.setOptionList({ optionList: this.optionList }));
      },
      error: (error: any) => {
        console.error('Error fetching option list:', error);
      }
    });
  }

  selectOption(item: OptionListModel) {
    this.selectedOption = item;
  }

  confirmSubmit() {
    if (this.dataForm.controls['amount'].value <= 0) {
      this.confirmationService.confirm({
        header: 'Xác nhận',
        message: 'Số tiền vẫn là 0, bạn có muốn tiếp tục?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Đồng ý',
        rejectLabel: 'Hủy',
        rejectButtonProps: {
          label: 'Hủy',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Đồng ý',
          severity: 'danger',
        },
        accept: () => {
          this.submitForm();
        },

        reject: () => {
          console.log('User cancelled');
        }
      });
    } else {
      this.submitForm();
    }
  }

  submitForm() {
    const payload = this.dataForm.value;
    payload.type == 2;

  }

}
