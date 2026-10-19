import { MapPin, Wallet, CalendarClock, Users } from 'lucide-react';

export interface ExamplePrompt {
  label: string;
  prompt: string;
  icon: 'map' | 'wallet' | 'calendar' | 'users';
}

// 入力欄の下に表示するサンプル質問
export const examplePrompts: ExamplePrompt[] = [
  {
    label: '京都旅行',
    prompt: '京都で1泊2日の旅行を計画したいです。予算は5万円で、お寺や観光地を巡りたいです。',
    icon: 'map',
  },
  {
    label: '予算5万円',
    prompt: '予算5万円以内で、2人で楽しめる温泉旅行のプランを教えてください。',
    icon: 'wallet',
  },
  {
    label: '1泊2日の旅行',
    prompt: '1泊2日で日帰りでも楽しめる、関東近郊の旅行プランを提案してください。',
    icon: 'calendar',
  },
  {
    label: 'グルメ旅',
    prompt: '4人で海鮮グルメを楽しめる旅行先を教えてください。予算は1人あたり3万円です。',
    icon: 'users',
  },
];

const iconMap = {
  map: MapPin,
  wallet: Wallet,
  calendar: CalendarClock,
  users: Users,
} as const;

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

// サンプル質問のチップ一覧
export function ExamplePrompts({ onSelect, disabled }: ExamplePromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {examplePrompts.map((example) => {
        const Icon = iconMap[example.icon];
        return (
          <button
            key={example.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(example.prompt)}
            className="inline-flex items-center gap-1.5 rounded-full border border-ocean-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-ocean-700 transition hover:border-ocean-400 hover:bg-ocean-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon size={15} className="text-ocean-500" />
            {example.label}
          </button>
        );
      })}
    </div>
  );
}
