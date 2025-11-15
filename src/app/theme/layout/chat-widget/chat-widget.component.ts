import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ChatWidgetComponent {
  isOpen = false
  messages: { role: 'user' | 'assistant'; text: string; time: string }[] = []
  input = ''
  loading = false
  error: string | null = null
  apiBase = 'http://localhost:5001'
  sendPath = '/respond'

  constructor(private http: HttpClient) {}

  toggle() {
    this.isOpen = !this.isOpen
  }

  send() {
    const content = this.input.trim()
    if (!content || this.loading) return
    this.messages.push({ role: 'user', text: content, time: new Date().toISOString() })
    this.input = ''
    this.loading = true
    this.error = null
    this.http.post<any>(this.apiBase + this.sendPath, { message: content, include_debug: false }).subscribe({
      next: (res) => {
        const reply = typeof res === 'string' ? res : (res?.answer ?? '')
        this.messages.push({ role: 'assistant', text: String(reply), time: new Date().toISOString() })
        this.loading = false
      },
      error: () => {
        this.error = 'Request failed'
        this.loading = false
      }
    })
  }
}

