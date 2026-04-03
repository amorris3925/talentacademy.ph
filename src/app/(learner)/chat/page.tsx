import { redirect } from 'next/navigation';

/** Chat has been unified into the AI Studio — redirect any old links. */
export default function ChatPage() {
  redirect('/studio');
}
