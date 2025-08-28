export type GoToStageFunctions<T extends string> = {
  [key in T as `goTo${Capitalize<Lowercase<T>>}`]?: () => void;
};
export interface DefaultStageProps<T extends string = never> {
  goToStage?: (stageIndex: T extends string ? T : number | string) => void;
  finish?: () => unknown;
}
export type StageProps<T extends string> = GoToStageFunctions<T> &
  DefaultStageProps<T>;
