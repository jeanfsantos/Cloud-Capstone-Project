import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  map,
  of,
  switchMap,
} from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { environment } from '@env';
import { Channel } from '@models/channel';
import { Message } from '@models/message';

interface ChannelResponse {
  channels: Channel[];
}

interface MessageResponse {
  messages: Message[];
}

interface SocketResponse<T> {
  eventName: 'INSERT' | 'REMOVE';
  payload: T;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private http = inject(HttpClient);
  channels$: Observable<Channel[]> = of([]);
  private fb = new FormBuilder();
  form = this.fb.group({
    text: new FormControl('', Validators.required),
    channelId: new FormControl('', Validators.required),
  });
  private subscriptions = new Subscription();
  private messageSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messageSubject.asObservable();
  isSending = false;
  private webSocketSubject = webSocket(environment.socketUrl);
  @ViewChild('container') container: ElementRef<HTMLUListElement>;

  ngOnInit(): void {
    this.fetchChannels();
    this.fetchMessages();
    this.handleWebSocket();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  select(event: MatSelectionListChange) {
    const [selectedItem] = event.options;
    const channelId = (selectedItem.value as Channel).channelId;

    this.form.patchValue({
      channelId,
    });
  }

  send() {
    if (this.form.invalid) {
      return;
    }

    this.isSending = true;

    this.http
      .post(`${environment.endpoint}/messages`, this.form.value)
      .subscribe({
        next: () => this.form.controls.text.reset(),
        complete: () => (this.isSending = false),
      });
  }

  private fetchChannels() {
    this.channels$ = this.http
      .get<ChannelResponse>(`${environment.endpoint}/channels`)
      .pipe(map(data => data.channels));
  }

  private fetchMessages(): void {
    const subscription = this.form.controls.channelId.valueChanges
      .pipe(
        switchMap(channelId =>
          this.http
            .get<MessageResponse>(
              `${environment.endpoint}/channel/${channelId}/messages`,
            )
            .pipe(map(data => data.messages)),
        ),
      )
      .subscribe({
        next: data => this.messageSubject.next(data),
      });

    this.subscriptions.add(subscription);
  }

  private scrollToBottom() {
    const subscription = this.messageSubject.subscribe({
      next: () => {
        this.container.nativeElement.scrollTop =
          this.container.nativeElement.scrollHeight;
      },
    });

    this.subscriptions.add(subscription);
  }

  private handleWebSocket() {
    const subscription = this.webSocketSubject.subscribe({
      next: data => {
        if ((data as SocketResponse<Message>).eventName === 'INSERT') {
          const payload = (data as SocketResponse<Message>).payload;

          if (payload.channelId === this.form.controls.channelId.value) {
            this.messageSubject.next([...this.messageSubject.value, payload]);
          }
        }
      },
    });

    this.subscriptions.add(subscription);
  }
}
