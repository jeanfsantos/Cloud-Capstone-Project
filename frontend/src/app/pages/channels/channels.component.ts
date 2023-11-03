import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { EMPTY, Observable, catchError, map, of } from 'rxjs';

import { environment } from '@env';

interface User {
  sub: string;
  email_verified: boolean;
  updated_at: string;
  nickname: string;
  name: string;
  given_name: string;
  locale: string;
  family_name: string;
  picture: string;
  email: string;
}

interface Channel {
  createdAt: string;
  user: User;
  channelId: string;
  name: string;
  userId: string;
  attachmentUrl?: string;
}

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDividerModule,
    RouterModule,
  ],
  templateUrl: './channels.component.html',
})
export class ChannelsComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    name: new FormControl('', Validators.required),
  });
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  channels$: Observable<Channel[]> = of([]);
  columnsToDisplay = ['attachmentUrl', 'channelId', 'name', 'edit'];

  ngOnInit(): void {
    this.channels$ = this.http
      .get<{ channels: Channel[] }>(`${environment.endpoint}/my-channels`)
      .pipe(map(response => response.channels));
  }

  create() {
    if (this.form.invalid) {
      return;
    }

    this.http
      .post(`${environment.endpoint}/channels`, this.form.value)
      .pipe(
        catchError(e => {
          console.error(e);
          this.snackBar.open('Error to create a channel', 'Close');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.form.reset();
        this.snackBar.open('Channel created successfully', 'Done');
      });
  }
}
