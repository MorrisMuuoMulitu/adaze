import { redirect } from 'next/navigation';

export default function CollectivePage() {
  // Redirecting to marketplace or a dedicated collective section if it existed.
  // For now, marketplace is the best fit for "The Collective" browse experience.
  redirect('/marketplace');
}
