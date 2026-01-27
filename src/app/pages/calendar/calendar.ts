import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventApi, DateSelectArg, EventClickArg, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';
import { CalendarService } from '../service/calendar-service';
import { filter, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';
import * as AppActions from '../../core/store/app.action';
import * as AppSelectors from '../../core/store/app.selectors';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, ProgressSpinnerModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar {
  calendarVisible = signal(true);
  currentMonthStart = signal<Date | null>(null);
  currentMonthEnd = signal<Date | null>(null);
  currentEvents = signal<EventApi[]>([]);

  calendarEvents: any[] = [];
  calendarOptions: CalendarOptions;
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  userId: string = '';
  loading: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private calendarService: CalendarService
  ) {
    this.calendarOptions = this.createCalendarOptions([]);
  }

  ngOnInit(): void {
    if (this.store) {
      this.store.select(AppSelectors.selectUserInfo)
        .pipe(
          filter(userInfo => userInfo !== null && userInfo !== undefined),
          take(1)
        )
        .subscribe(userInfo => {
          if (userInfo?.id) {
            this.userId = userInfo.id;
          }
        });
    }
  }

  createCalendarOptions(events: any[]): CalendarOptions {
    return {
      plugins: [
        interactionPlugin,
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
      ],
      locale: viLocale,
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: ''
      },
      initialView: 'dayGridMonth',
      titleFormat: function (date) {
        const month = date.date.month + 1;
        const year = date.date.year;
        return `Tháng ${month} năm ${year}`;
      },
      events: events,
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      eventsSet: (events) => this.handleEvents(events),
      datesSet: (arg) => this.handleDatesSet(arg),
      eventContent: (arg) => {
        const type = arg.event.extendedProps['type'];
        const color = type === 1 ? '#4CAF50' : type === 2 ? '#f44336' : '#ccc';

        return {
          html: `
            <div style="
              background-color: ${color}; 
              border-width: 1px;
              border-style: solid;
              border-color: ${color};
              padding: 2px 8px; 
              border-radius: 3px; 
              color: white;
              text-align: right;
              width: 100%;
              font-size: 12px;
            ">
              ${arg.event.title}
            </div>
          `
        };
      }
    };
  }

  handleDatesSet(arg: DatesSetArg) {
    const viewDate = arg.view.currentStart;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    this.currentMonthStart.set(firstDay);
    this.currentMonthEnd.set(lastDay);

    if (this.userId) {
      this.loadDataForMonth(firstDay, lastDay);
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadDataForMonth(start: Date, end: Date) {
    const startDate = this.formatDate(start);
    const endDate = this.formatDate(end);

    this.getAll(this.userId, startDate, endDate);
  }

  handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
  }

  handleWeekendsToggle() {
    this.calendarOptions = {
      ...this.calendarOptions,
      weekends: !this.calendarOptions.weekends,
    };
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges();
  }

  getMonthStartEnd(): { start: Date, end: Date } {
    const start = this.currentMonthStart();
    const end = this.currentMonthEnd();

    if (!start || !end) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
    }

    return { start, end };
  }

  getAll(userId: string, startDate: string, endDate: string) {
    this.loading = true;
    this.calendarService.getAll(userId, startDate, endDate).subscribe({
      next: (response: any) => {
        const newEvents = response.map((item: any) => ({
          id: item.id?.toString(),
          title: item.amount?.toString(),
          start: item.date,
          extendedProps: {
            type: item.type,
            note: item.note,
            moneyUnit: item.moneyUnit,
            userOptionName: item.userOption?.nameOption || ''
          }
        }));

        const start = new Date(startDate);
        const end = new Date(endDate);

        const eventsOutsideRange = this.calendarEvents.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate < start || eventDate > end;
        });

        const mergedEvents = [...eventsOutsideRange, ...newEvents];

        this.calendarEvents = mergedEvents.filter((event, index, self) =>
          index === self.findIndex((e) => e.id === event.id)
        );


        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...this.calendarEvents]
        };
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}