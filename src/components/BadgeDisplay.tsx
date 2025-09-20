import { Achievement } from '@/lib/achievements';

const BADGE_ARTWORK: Record<string, string> = {
  first_submission: '🥇',
  prolific_author: '📚',
  first_review: '⭐',
  active_critic: '💬',
  // Add 28 more badge designs here
};

export default function Badge({ achievement }: { achievement: Achievement }) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg">
      <span className="text-4xl">{BADGE_ARTWORK[achievement.slug]}</span>
      <h3 className="font-bold mt-2">{achievement.name}</h3>
      <p className="text-sm text-center">{achievement.description}</p>
    </div>
  );
}
