import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService, UserService, UserSummaryDto, SendMessageDto, StartChatDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

interface ChatItem { id: number; recipient?: UserSummaryDto | null; lastPreview?: string; updatedAt?: string; }
interface ChatMessage { id?: number; content: string; senderId?: number; createdAt?: string; }

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit {
  private chat = inject(ChatService);
  private usersApi = inject(UserService);
  private toast = inject(ToastNotificationService);

  users: UserSummaryDto[] = [];
  chats: ChatItem[] = [];
  selectedChat: ChatItem | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';

  searchUser = '';
  starting = false;
  sending = false;
  me: UserSummaryDto | null = null;
  meId?: number;

  ngOnInit(): void {
    this.loadMe();
  }

  loadMe() {
    this.usersApi.apiUserMeGet().subscribe(
      (me: any) => {
        this.me = me ?? null;
        this.meId = (me?.id ?? undefined);
        this.loadUsers();
        this.loadMyChats();
      },
      () => {
        this.me = null;
        this.meId = undefined;
        this.loadUsers();
        this.loadMyChats();
      }
    );
  }

  loadUsers() {
    const acc: Record<string, UserSummaryDto> = {};
    const put = (u: any) => {
      const id = u?.id;
      const emailKey = (u?.email || '').toLowerCase().trim();
      const key = id != null ? `id:${id}` : (emailKey ? `email:${emailKey}` : `name:${(u?.nomUser || '').toLowerCase().trim()}`);
      if (key) acc[key] = u;
    };
    this.usersApi.apiUserByRoleRoleGet('IngenieurRFQ').subscribe(
      (resp: any) => {
        const list = resp?.$values ?? resp ?? [];
        (list || []).forEach(put);
        this.usersApi.apiUserByRoleRoleGet('Validateur').subscribe(
          (resp2: any) => {
            const list2 = resp2?.$values ?? resp2 ?? [];
            (list2 || []).forEach(put);
            this.users = Object.values(acc);
            if (this.users.length === 0) {
              this.toast.showToast({ message: 'No users available to chat', type: 'info', duration: 5000 });
            }
          },
          () => {
            this.users = Object.values(acc);
            if (this.users.length === 0) {
              this.toast.showToast({ message: 'Unable to fetch users by role', type: 'error', duration: 7000 });
            }
          }
        );
      },
      (err) => {
        console.error('Users fetch error', err);
        this.usersApi.apiUserGet().subscribe(
          (respAny: any) => {
            const raw = respAny?.$values ?? respAny ?? [];
            (raw || []).forEach(put);
            this.users = Object.values(acc);
            if (!Array.isArray(this.users) || this.users.length === 0) {
              this.toast.showToast({ message: 'No users returned from API', type: 'info', duration: 5000 });
            }
          },
          () => {
            this.users = [];
            this.toast.showToast({ message: 'Cannot load users (permission required)', type: 'error', duration: 7000 });
          }
        );
      }
    );
  }

  loadMyChats() {
    this.chat.apiChatMyGet().subscribe(
      (res: any) => {
        const arr = Array.isArray(res?.$values) ? res.$values : (Array.isArray(res) ? res : []);
        this.chats = (arr || []).map((c: any) => {
          const cid = c?.id ?? c?.chatId ?? 0;
          const lastObj = c?.lastMessage ?? c?.lastPreview;
          const preview = typeof lastObj === 'string' ? lastObj : (lastObj?.content ?? '');
          return { id: cid, recipient: c?.recipient ?? null, lastPreview: preview, updatedAt: c?.updatedAt ?? c?.lastUpdated ?? undefined } as ChatItem;
        });
      },
      (err) => {
        console.error('Load my chats error', err);
      }
    );
  }

  restoreChats() {
    try {
      const raw = localStorage.getItem('myChats');
      const arr = raw ? JSON.parse(raw) as ChatItem[] : [];
      this.chats = Array.isArray(arr) ? arr : [];
    } catch {}
  }

  persistChats() {
    localStorage.setItem('myChats', JSON.stringify(this.chats));
  }

  startChat(user: UserSummaryDto) {
    if (this.starting || !user?.id) return;
    this.starting = true;
    const payload: StartChatDto = { recipientUserId: user.id!, initialMessage: undefined };
    this.chat.apiChatStartPost(payload).subscribe(
      (res: any) => {
        const chatId = typeof res === 'number' ? res : (res?.id ?? res?.chatId);
        if (!chatId && chatId !== 0) {
          this.toast.showToast({ message: 'Chat started (no id returned)', type: 'info', duration: 5000 });
          this.starting = false;
          return;
        }
        const exists = this.chats.find(c => c.id === chatId);
        if (!exists) {
          this.chats.unshift({ id: chatId, recipient: user, updatedAt: new Date().toISOString() });
          this.persistChats();
        }
        this.selectChat(chatId);
        this.toast.showToast({ message: `Chat started with ${user.nomUser ?? 'user'}`, type: 'success', duration: 5000 });
        this.starting = false;
      },
      (err) => {
        console.error('Start chat error', err);
        this.toast.showToast({ message: 'Failed to start chat', type: 'error', duration: 7000 });
        this.starting = false;
      }
    );
  }

  selectChat(chatId: number) {
    const item = this.chats.find(c => c.id === chatId) || null;
    this.selectedChat = item;
    this.messages = [];
    if (!item) return;
    this.chat.apiChatChatIdMessagesGet(chatId).subscribe((res: any) => {
      const list = Array.isArray(res?.$values) ? res.$values : (Array.isArray(res) ? res : []);
      this.messages = list.map((m: any) => ({ id: m?.id, content: m?.content ?? '', senderId: m?.senderId, createdAt: m?.createdAt }));
    });
  }

  sendMessage() {
    if (this.sending || !this.selectedChat?.id) return;
    const text = (this.newMessage || '').trim();
    if (!text) return;
    const payload: SendMessageDto = { content: text };
    const chatId = this.selectedChat.id;
    this.sending = true;
    this.chat.apiChatChatIdMessagesPost(chatId, payload).subscribe(
      () => {
        this.messages.push({ content: text, createdAt: new Date().toISOString(), senderId: this.meId });
        this.newMessage = '';
        const idx = this.chats.findIndex(c => c.id === chatId);
        if (idx >= 0) { this.chats[idx].lastPreview = text; this.chats[idx].updatedAt = new Date().toISOString(); }
        this.toast.showToast({ message: 'Message sent', type: 'success', duration: 4000 });
        this.sending = false;
      },
      (err) => {
        console.error('Send message error', err);
        this.toast.showToast({ message: 'Failed to send message', type: 'error', duration: 7000 });
        this.sending = false;
      }
    );
  }

  filteredUsers(): UserSummaryDto[] {
    const q = (this.searchUser || '').toLowerCase().trim();
    const excludedIds = new Set<number>((this.chats || [])
      .map(c => c?.recipient?.id)
      .filter((id): id is number => typeof id === 'number'));
    const excludedEmails = new Set<string>((this.chats || [])
      .map(c => (c?.recipient?.email || '').toLowerCase().trim())
      .filter(Boolean));
    const excludedNames = new Set<string>((this.chats || [])
      .map(c => (c?.recipient?.nomUser || '').toLowerCase().trim())
      .filter(Boolean));
    const base = (this.users || []).filter(u => {
      const id = u?.id;
      const email = (u?.email || '').toLowerCase().trim();
      const name = (u?.nomUser || '').toLowerCase().trim();
      if (id === this.meId) return false;
      if (id != null && excludedIds.has(id)) return false;
      if (email && excludedEmails.has(email)) return false;
      if (name && excludedNames.has(name)) return false;
      return true;
    });
    if (!q) return base;
    return base.filter(u => (u.nomUser || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }

  trackUser(index: number, item: UserSummaryDto | null | undefined) { return item?.id ?? index; }
  trackChat(index: number, item: ChatItem) { return item?.id ?? index; }
  trackMsg(index: number, item: ChatMessage) { return item?.id ?? index; }

  isMine(item: ChatMessage) { return (item?.senderId ?? -1) === (this.meId ?? -2); }

  renderPreview(c: ChatItem) { return (c?.lastPreview ?? '').toString(); }
}
