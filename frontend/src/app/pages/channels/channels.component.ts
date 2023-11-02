import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { EMPTY, catchError } from 'rxjs';

import { environment } from '@env';

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
  ],
  templateUrl: './channels.component.html',
})
export class ChannelsComponent {
  private fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    name: new FormControl('', Validators.required),
  });
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

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
