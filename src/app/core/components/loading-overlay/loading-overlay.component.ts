import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '@/core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (loadingService.loading$ | async) {
      <div class="loading-overlay">
        <div class="loading-content">
          <p-progressSpinner 
            [style]="{'width': '60px', 'height': '60px'}" 
            strokeWidth="4" 
            animationDuration=".5s"
          ></p-progressSpinner>
          <p class="loading-text">Đang xử lý...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      background: var(--surface-0);
      padding: 2rem 2.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .loading-text {
      color: var(--text-color);
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
    }
  `]
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}

