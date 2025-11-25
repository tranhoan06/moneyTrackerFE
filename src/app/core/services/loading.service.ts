import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$: Observable<boolean> = this.loadingSubject.asObservable();

    private requestCount = 0;

    /**
     * Hiển thị loading spinner
     */
    show(): void {
        this.requestCount++;
        this.loadingSubject.next(true);
    }

    /**
     * Ẩn loading spinner
     */
    hide(): void {
        this.requestCount--;
        if (this.requestCount <= 0) {
            this.requestCount = 0;
            this.loadingSubject.next(false);
        }
    }

    /**
     * Reset loading state (dùng khi có lỗi)
     */
    reset(): void {
        this.requestCount = 0;
        this.loadingSubject.next(false);
    }

    /**
     * Kiểm tra đang loading không
     */
    get isLoading(): boolean {
        return this.loadingSubject.value;
    }
}

