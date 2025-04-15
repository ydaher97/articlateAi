'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'frontend' | 'backend' | 'devops' | 'architecture' | 'general';

interface ExerciseSettingsProps {
  onSettingsChange: (settings: { difficulty: Difficulty; category: Category }) => void;
  initialSettings?: {
    difficulty: Difficulty;
    category: Category;
  };
}

export function ExerciseSettings({ onSettingsChange, initialSettings }: ExerciseSettingsProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialSettings?.difficulty || 'intermediate');
  const [category, setCategory] = useState<Category>(initialSettings?.category || 'general');

  const handleDifficultyChange = (value: Difficulty) => {
    setDifficulty(value);
    onSettingsChange({ difficulty: value, category });
  };

  const handleCategoryChange = (value: Category) => {
    setCategory(value);
    onSettingsChange({ difficulty, category: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <RadioGroup
            value={difficulty}
            onValueChange={(value) => handleDifficultyChange(value as Difficulty)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner">Beginner</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate">Intermediate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced">Advanced</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(value) => handleCategoryChange(value as Category)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend Development</SelectItem>
              <SelectItem value="backend">Backend Development</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="architecture">Software Architecture</SelectItem>
              <SelectItem value="general">General Software Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
} 