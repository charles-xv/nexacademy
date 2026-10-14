import { PartyPopper, Sparkles } from 'lucide-react';

// Single source of truth for notifications. Both the bell
// (preview) and the Notifications page (full list) read from
// here — so there's only ever ONE copy to update. When the
// backend is ready, this whole array gets replaced by a fetch.
export const notifications = [
  {
    id: 1,
    icon: PartyPopper,
    title: 'Welcome to NeXaCaDemY!',
    message: 'Your account is ready. Start exploring the course catalog to find something to learn.',
    time: 'Just now',
  },
  {
    id: 2,
    icon: Sparkles,
    title: 'Complete your first course',
    message: 'Enroll in a course and pick up where you left off anytime.',
    time: 'Just now',
  },
];