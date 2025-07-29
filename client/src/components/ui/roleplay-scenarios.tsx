import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Theater, School, Store, Home, UtensilsCrossed } from "lucide-react";

type Scenario = 'school' | 'store' | 'home' | 'restaurant';

interface RoleplayScenariosProps {
  onScenarioSelect: (scenario: Scenario) => void;
  selectedScenario?: Scenario | null;
}

export default function RoleplayScenarios({ onScenarioSelect, selectedScenario }: RoleplayScenariosProps) {
  const scenarios = [
    {
      id: 'school' as const,
      title: 'School',
      description: 'Classroom conversations',
      icon: School,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'store' as const,
      title: 'Store',
      description: 'Shopping & purchasing',
      icon: Store,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'home' as const,
      title: 'Home',
      description: 'Family conversations',
      icon: Home,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'restaurant' as const,
      title: 'Restaurant',
      description: 'Ordering & dining',
      icon: UtensilsCrossed,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Theater className="w-5 h-5 text-primary" />
          <span>Roleplay Scenarios</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          const isSelected = selectedScenario === scenario.id;
          
          return (
            <Button
              key={scenario.id}
              variant="ghost"
              className={`w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-colors h-auto ${
                isSelected ? 'border-primary bg-blue-50' : ''
              }`}
              onClick={() => onScenarioSelect(scenario.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`p-2 rounded ${scenario.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{scenario.title}</p>
                  <p className="text-sm text-gray-500">{scenario.description}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
