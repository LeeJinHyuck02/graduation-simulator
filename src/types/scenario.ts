import { Semester } from './semester';
import { Activity } from './activity';

export interface Scenario {
  id: string;
  scenarioName: string;
  semesters: Semester[];
  activities: Activity[];
}

