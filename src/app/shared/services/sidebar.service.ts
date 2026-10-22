import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpenedSubject = new BehaviorSubject<boolean>(false);
  public isOpened$: Observable<boolean> = this.isOpenedSubject.asObservable();

  private isPinnedSubject = new BehaviorSubject<boolean>(true);
  public isPinned$: Observable<boolean> = this.isPinnedSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedPin = localStorage.getItem('rw_sidebar_pinned');
      const isPinned = savedPin !== null ? savedPin === 'true' : true;
      this.isPinnedSubject.next(isPinned);

      if (isPinned && window.innerWidth > 1024) {
        this.isOpenedSubject.next(true);
      }
      this.updateBodyPinClass();
    }
  }

  get isOpened(): boolean {
    return this.isOpenedSubject.value;
  }

  get isPinned(): boolean {
    return this.isPinnedSubject.value;
  }

  toggleMenu(): void {
    const nextState = !this.isOpenedSubject.value;
    this.isOpenedSubject.next(nextState);
    this.updateBodyPinClass();
  }

  open(): void {
    this.isOpenedSubject.next(true);
    this.updateBodyPinClass();
  }

  close(): void {
    this.isOpenedSubject.next(false);
    this.updateBodyPinClass();
  }

  closeOnMobileOrUnpinned(): void {
    if (typeof window !== 'undefined') {
      if (!this.isPinned || window.innerWidth <= 1024) {
        this.close();
      }
    } else {
      this.close();
    }
  }

  togglePin(): void {
    const nextPin = !this.isPinnedSubject.value;
    this.isPinnedSubject.next(nextPin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rw_sidebar_pinned', String(nextPin));
    }
    if (nextPin) {
      this.isOpenedSubject.next(true);
    }
    this.updateBodyPinClass();
  }

  updateBodyPinClass(): void {
    if (typeof document !== 'undefined') {
      if (this.isPinnedSubject.value && this.isOpenedSubject.value && window.innerWidth > 1024) {
        document.body.classList.add('sidebar-pinned');
      } else {
        document.body.classList.remove('sidebar-pinned');
      }
    }
  }
}
