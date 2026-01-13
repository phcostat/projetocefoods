import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  standalone: false
})
export class IndexPage {
  constructor(private router: Router) {}

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }
}
