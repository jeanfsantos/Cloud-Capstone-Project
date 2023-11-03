import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '@env';
import { Subscription, map, switchMap } from 'rxjs';

interface CreateImageUrlResponse {
  imageUrl: string;
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
    NgxMatFileInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit.component.html',
})
export class EditComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    attachment: new FormControl(null, Validators.required),
  });
  private activetedrRoute = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private subscriptions = new Subscription();

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  save() {
    const subscription = this.activetedrRoute.params
      .pipe(
        map(param => param['id']),
        switchMap((id: string) =>
          this.http.post<CreateImageUrlResponse>(
            `${environment.endpoint}/channels/${id}/image`,
            {},
          ),
        ),
        switchMap(data =>
          this.http.put(`${data.imageUrl}`, this.form.value.attachment),
        ),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.snackBar.open('Image uploaded successfully', 'Done');
          this.router.navigateByUrl('/channels');
        },
        error: e => {
          console.error('Error to upload a image', e);
          this.snackBar.open('Error to upload a image', 'Close');
        },
      });

    this.subscriptions.add(subscription);
  }
}
