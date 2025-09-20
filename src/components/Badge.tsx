import { Achievement } from '@/lib/achievements';

export function Badge({ achievement }: { achievement: Achievement }) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg">
      <span className="text-4xl">{achievement.icon}</span>
      <h3 className="font-bold">{achievement.name}</h3>
      <p className="text-sm text-center">{achievement.description}</p>
    </div>
  );
}
