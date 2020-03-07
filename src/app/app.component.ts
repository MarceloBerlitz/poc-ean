import { Component, HostListener, OnInit } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { combineAll, map, first, delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public eans = [];

  private $eanKeys: Subject<string>;
  private $ean = new Subject();

  @HostListener('window:keydown', ['$event'])
  public verifyEan(eventHost: KeyboardEvent): void {
    if (!isNaN(+eventHost.key)) {
      this.$eanKeys.next(eventHost.key);
    } else {
      if ('Enter' === eventHost.key) {
        this.$eanKeys.complete();
      }
    }
  }

  ngOnInit(): void {
    this.subscribeToKeys();
    this.subscribeToEan();
  }

  private subscribeToEan() {
    this.$ean.subscribe(res => {
      this.eans.push(res);
    });
  }

  private subscribeToKeys(): void {
    this.$eanKeys = new Subject<string>();
    this.setupBufferTimeout(
      this.$eanKeys.pipe(
        combineAll(),
        map(res => res.reduce((acc, cur) => acc + cur, ''))
      ).subscribe(res => {
        this.$ean.next(res);
        this.subscribeToKeys();
      })
    );
  }

  setupBufferTimeout(subs: Subscription) {
    this.$eanKeys.pipe(
      first(),
      delay(1000)
    ).subscribe(() => {
      subs.unsubscribe();
      this.subscribeToKeys();
    });
  }
}
