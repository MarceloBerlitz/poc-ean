import { Component, HostListener, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { combineAll, finalize, map, timeout } from 'rxjs/operators';


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
    this.$eanKeys.pipe(
      timeout(1000),
      combineAll(),
      map(res => res.reduce((acc, cur) => acc + cur, '')),
      finalize(() => this.subscribeToKeys())
    ).subscribe(res => {
      this.$ean.next(res);
    }, err => console.log('subscribeToKeys', err));
  }
}
