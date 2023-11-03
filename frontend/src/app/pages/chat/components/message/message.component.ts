import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Message } from '@models/message';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  templateUrl: './message.component.html',
})
export class MessageComponent {
  @Input({ required: true }) message: Message;
  @Input({ required: true }) userId: string;
  @Output() remove = new EventEmitter<string>();
}
