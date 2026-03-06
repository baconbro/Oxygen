export const customStatus =
{
  IssueStatus: {
    ONTRACK: 'ontrack',
    BEHIND: 'behind',
  ATRISK: 'atrisk',
  PENDING: 'pending',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  },
  IssueStatusCopy: {
    ontrack: 'On track',
    behind: 'Behind',
  atrisk: 'At risk',
  pending: 'Pending',
  completed: 'Completed',
  paused: 'Paused',
  cancelled: 'Cancelled',
  },
  IssueStatusClass: {
    ontrack: 'success',
    behind: 'warning',
  atrisk: 'danger',
  pending: 'secondary',
  completed: 'primary',
  paused: 'light-dark',
  cancelled: 'light-dark',
  }
}

export   const getScoreColor = (value) => {
    if (value >= 60 && value <= 100) {
      return 'success';
    } else if (value >= 30 && value < 60) {
      return 'warning';
    } else if (value >= 1 && value < 30) {
      return 'danger';
    } else {
      return 'secondary';
    }
  };

  export const goalType =
{
  IssueStatus: {
    STRAT: 'strat',
    OBJ: 'objective',
    KR: 'kr',
    INITIATIVE: 'initiative',
  },
  IssueStatusCopy: {
    strat: 'Strategic',
    objective: 'Objective',
    obj: 'Objective',
    kr: 'Key Result',
    initiative: 'Initiative',
  },
  IssueStatusClass: {
    strat: 'light-success',
    objective: 'light-primary',
    obj: 'light-primary',
    kr: 'light-info',
    initiative: 'light-warning',
  }
}

export const goalVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  TEAM: 'team',
};

export const goalVisibilityCopy = {
  public: 'Public',
  private: 'Private',
  team: 'Team only',
};

export const scoringMethods = {
  SIMPLE: 'simple',
  SCORE: 'score',
};

export const scoringMethodCopy = {
  simple: 'Simple Status',
  score: 'Status & Score',
};

export const updateCadences = {
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
};

export const updateCadenceCopy = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};
