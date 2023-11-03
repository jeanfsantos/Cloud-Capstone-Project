import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
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
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '@auth0/auth0-angular';
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
import { MessageComponent } from './components/message/message.component';

interface ChannelResponse {
  channels: Channel[];
}

interface MessageResponse {
  messages: Message[];
}

interface InsertSocketResponse {
  eventName: 'INSERT';
  payload: Message;
}

interface RemoveSocketResponse {
  eventName: 'REMOVE';
  payload: {
    messageId: string;
  };
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
    MatMenuModule,
    MessageComponent,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  private http = inject(HttpClient);
  channels$: Observable<Channel[]> = of([]);
  private fb = new FormBuilder();
  form = this.fb.group({
    text: new FormControl('', Validators.required),
    channelId: new FormControl('', Validators.required),
  });
  private subscriptions = new Subscription();
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();
  isLoading = false;
  private webSocketSubject = webSocket(environment.socketUrl);
  @ViewChild('container') private container: ElementRef<HTMLUListElement>;
  auth = inject(AuthService);

  ngOnInit(): void {
    this.fetchChannels();
    this.fetchMessages();
    this.handleWebSocket();
  }

  ngAfterViewInit(): void {
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

    this.isLoading = true;

    this.http
      .post(`${environment.endpoint}/messages`, this.form.value)
      .subscribe({
        next: () => this.form.controls.text.reset(),
        complete: () => (this.isLoading = false),
      });
  }

  remove(messageId: string) {
    if (!messageId) {
      return;
    }

    this.http
      .delete(`${environment.endpoint}/messages/${messageId}`)
      .subscribe({
        next: () => (this.isLoading = true),
      });
  }

  identify(index: number, message: Message) {
    return message.messageId;
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
        next: data => this.messagesSubject.next(data),
      });

    this.subscriptions.add(subscription);
  }

  private scrollToBottom() {
    const subscription = this.messages$.subscribe({
      next: () => {
        if (!this.container) {
          return;
        }

        setTimeout(() => {
          this.container.nativeElement.scrollTop =
            this.container.nativeElement.scrollHeight;
        });
      },
    });

    this.subscriptions.add(subscription);
  }

  private handleWebSocket() {
    const subscription = this.webSocketSubject.subscribe({
      next: data => {
        if ((data as InsertSocketResponse).eventName === 'INSERT') {
          this.appendMessage(data);
        } else if ((data as RemoveSocketResponse).eventName === 'REMOVE') {
          this.removeMessage(data);
        }
        this.isLoading = false;
      },
    });

    this.subscriptions.add(subscription);
  }

  private removeMessage(data: unknown) {
    const messageId = (data as RemoveSocketResponse).payload.messageId;
    const messagesFiltered = this.messagesSubject.value.filter(
      m => m.messageId !== messageId,
    );

    if (this.messagesSubject.value.length !== messagesFiltered.length) {
      this.messagesSubject.next(messagesFiltered);
    }
  }

  private appendMessage(data: unknown) {
    const payload = (data as InsertSocketResponse).payload;

    if (payload.channelId === this.form.controls.channelId.value) {
      this.messagesSubject.next([...this.messagesSubject.value, payload]);
    }
  }
}
