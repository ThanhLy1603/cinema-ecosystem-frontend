export interface StaffBranch {
  cinemaId: number;
  cinemaName: string | null;
  primary: boolean;
}

export interface StaffContext {
  allBranches: boolean;
  branches: StaffBranch[];
}
