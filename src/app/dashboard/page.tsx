"use client";

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import BadgeDisplay from '@/components/BadgeDisplay';
import { 
  Plus as IconAdd,
  MessageSquare as IconComment,
  Edit as IconEdit,
  Rocket as IconRocket,
  Share2 as IconShare,
  Star as IconStar,
  UserPlus as IconUserPlus,
  Users as IconUsers
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserStats } from '@/lib/userService';
import { Achievement } from '@/lib/achievements';

async function fetchEarnedBadges(userId: string): Promise<Achievement[]> {
  // Implementation would go here
  return [];
}

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const [stats, setStats] = useState({ submissions: 0, reviews: 0, followers: 0 });
  const [earnedBadges, setEarnedBadges] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        const data = await getUserStats(user.id);
        setStats(data);
      }
    };
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEarnedBadges(user.id).then(data => setEarnedBadges(data));
    }
  }, [user]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to view dashboard</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="md:col-span-1 border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Your Profile</h2>
          <div className="flex flex-col items-center">
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-24 h-24 rounded-full mb-4"
            />
            <h2 className="text-xl font-bold">{user.fullName}</h2>
            <p className="text-gray-600">@{user.username}</p>
            <div className="grid grid-cols-3 gap-4 mt-6 w-full">
              <StatCard title="Submissions" value={stats.submissions.toString()} />
              <StatCard title="Reviews" value={stats.reviews.toString()} />
              <StatCard title="Followers" value={stats.followers.toString()} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <IconAdd className="mr-2" /> Submit Work
              </Button>
              <Button variant="outline">
                <IconEdit className="mr-2" /> Edit Profile
              </Button>
              <Button variant="outline">
                <IconShare className="mr-2" /> Share Portfolio
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem 
                icon={<IconComment />}
                text="You commented on Jane's portfolio"
                time="2 hours ago"
              />
              <ActivityItem 
                icon={<IconStar />}
                text="David reviewed your submission"
                time="1 day ago"
              />
              <ActivityItem 
                icon={<IconUserPlus />}
                text="You followed Alex"
                time="2 days ago"
              />
            </div>
          </div>

          {/* Achievements */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Your Achievements</h2>
            <div className="flex gap-4">
              <BadgeDisplay achievement={{ slug: 'first_review', name: 'First Review', description: '', icon: '' }} />
              <BadgeDisplay achievement={{ slug: 'top_contributor', name: 'Top Contributor', description: '', icon: '' }} />
              <BadgeDisplay achievement={{ slug: 'community_builder', name: 'Community Builder', description: '', icon: '' }} />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              {earnedBadges.map(badge => (
                <BadgeDisplay key={badge.slug} achievement={badge} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

function ActivityItem({ icon, text, time }: { 
  icon: React.ReactNode; 
  text: string; 
  time: string; 
}) {
  return (
    <div className="flex items-start">
      <div className="mr-3 mt-1 text-primary">{icon}</div>
      <div>
        <p>{text}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function LocalBadge({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-100 rounded-full p-3">{icon}</div>
      <p className="mt-2 text-sm">{title}</p>
    </div>
  );
}
